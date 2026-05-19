import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreHorizontal, ChevronLeft, ChevronRight, Clock, Truck, CheckCircle2, XCircle, ArrowUpDown } from 'lucide-react';
import API from './api'; 

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('date_desc'); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false); 

  // BACKEND ÜZERİNDEN VERİ ÇEKME MOTORU
  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders');
      setOrders(response.data.map(doc => {
        const data = doc;
        
        // Tarih formatını güvenli bir şekilde ayrıştırma
        let validDate = new Date();
        if (data.timestamp) {
          if (data.timestamp._seconds) validDate = new Date(data.timestamp._seconds * 1000);
          else if (data.timestamp.seconds) validDate = new Date(data.timestamp.seconds * 1000);
          else validDate = new Date(data.timestamp);
        }
        if (isNaN(validDate.getTime())) validDate = new Date();

        return {
          ...data,
          id: data.id || 'UNKNOWN',
          customerName: data.customerName || data.customer || 'Bilinmeyen Müşteri',
          amount: Number(data.amount || data.total || 0),
          status: data.status || 'Processing',
          itemCount: data.itemCount || (data.items ? data.items.length : 1),
          dateObj: validDate,
          displayDate: validDate.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }));
    } catch (err) {
      console.error("Sipariş çekme hatası:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // SAYFAYI YENİLEMEDEN EXPORT (DIŞA AKTARMA) ALGORİTMASI
  const handleExportCSV = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    if (sortedOrders.length === 0) return alert("Dışa aktarılacak sipariş bulunamadı.");
    
    const headers = ["Order ID", "Customer", "Total Amount", "Status", "Items", "Date"];
    const rows = sortedOrders.map(o => [
      `#${o.id.slice(0, 7).toUpperCase()}`,
      o.customerName,
      `$${o.amount}`,
      o.status,
      `${o.itemCount} pcs`,
      o.displayDate
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `EtsySync_Orders.csv`);
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // DURUM GÜNCELLEMESİNİ BACKEND'E İLETME
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      setActiveMenuId(null);
      fetchOrders(); // Tabloyu canlı tazele
    } catch (err) { console.error("Durum güncelleme hatası:", err); }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase().trim() : 'processing';
    if (s === 'completed') return { label: 'Completed', class: 'text-green-500 bg-green-50' };
    if (s === 'shipped') return { label: 'Shipped', class: 'text-blue-500 bg-blue-50' };
    if (s === 'cancelled') return { label: 'Cancelled', class: 'text-red-500 bg-red-50' };
    return { label: 'Processing', class: 'text-amber-500 bg-amber-50' };
  };

  // 1. FİLTRELEME İŞLEMİ
  const filteredOrders = orders.filter(o => {
    const cName = o.customerName ? o.customerName.toLowerCase().trim() : '';
    const oId = o.id ? o.id.toLowerCase().trim() : '';
    const oStatus = o.status ? o.status.toLowerCase().trim() : 'processing';
    const currentFilter = statusFilter.toLowerCase().trim();
    
    const matchesSearch = cName.includes(searchTerm.toLowerCase()) || oId.includes(searchTerm.toLowerCase());
    const matchesStatus = currentFilter === 'all status' || oStatus === currentFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 2. SIRALAMA İŞLEMİ (TARİH, FİYAT, İSİM)
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date_desc') return b.dateObj - a.dateObj;
    if (sortBy === 'date_asc') return a.dateObj - b.dateObj;
    if (sortBy === 'price_desc') return b.amount - a.amount;
    if (sortBy === 'price_asc') return a.amount - b.amount;
    if (sortBy === 'name_asc') return a.customerName.localeCompare(b.customerName);
    return 0;
  });

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentOrders = sortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Manage and track your store's customer orders</p>
        </div>
        <button 
          type="button" 
          onClick={handleExportCSV} 
          className="bg-white text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center shadow-sm"
        >
          <Download size={16} className="mr-2" /> Export
        </button>
      </header>

      <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
        
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders by Customer or Order ID..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-4 relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 outline-none shadow-sm cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button 
              type="button" 
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} 
              className={`px-4 py-3 rounded-2xl border transition-all shadow-sm flex items-center ${isSortMenuOpen ? 'bg-orange-50 text-[#FF6B00] border-orange-200' : 'bg-white text-gray-400 border-gray-100 hover:text-gray-600'}`}
            >
              <Filter size={18} />
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 top-14 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-52 z-40 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 py-1.5 border-b border-gray-50 flex items-center"><ArrowUpDown size={10} className="mr-1"/> Sıralama Seçenekleri</p>
                <button type="button" onClick={() => { setSortBy('date_desc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'date_desc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Tarih: Yeniden Eskiye</button>
                <button type="button" onClick={() => { setSortBy('date_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'date_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Tarih: Eskiden Yeniye</button>
                <button type="button" onClick={() => { setSortBy('price_desc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'price_desc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Tutar: Yüksekten Düşüğe</button>
                <button type="button" onClick={() => { setSortBy('price_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'price_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Tutar: Düşükten Yükseğe</button>
                <button type="button" onClick={() => { setSortBy('name_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'name_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Müşteri Adı: A - Z</button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-4 py-5">Customer</th>
                <th className="px-4 py-5">Total</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-4 py-5">Items</th>
                <th className="px-4 py-5">Date</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5"><span className="font-black text-xs text-gray-800 tracking-wider">#{order.id.slice(0, 7).toUpperCase()}</span></td>
                    <td className="px-4 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF6B00] font-bold text-xs flex items-center justify-center border border-orange-100">{order.customerName.charAt(0)}</div>
                        <span className="font-bold text-sm text-gray-800">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5"><span className="font-black text-sm text-gray-800">${order.amount}</span></td>
                    <td className="px-4 py-5"><span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${badge.class}`}>{badge.label}</span></td>
                    <td className="px-4 py-5"><span className="font-bold text-sm text-gray-500">{order.itemCount} pcs</span></td>
                    <td className="px-4 py-5"><span className="text-xs font-bold text-gray-400">{order.displayDate}</span></td>
                    
                    <td className="px-8 py-5 text-right relative">
                      <button type="button" onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><MoreHorizontal size={18} /></button>
                      {activeMenuId === order.id && (
                        <div className="absolute right-8 top-14 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-44 z-30">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 py-1.5 border-b border-gray-50">Update Status</p>
                          <button type="button" onClick={() => handleUpdateStatus(order.id, 'Processing')} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-amber-50 hover:text-amber-600 flex items-center"><Clock size={14} className="mr-2"/> Processing</button>
                          <button type="button" onClick={() => handleUpdateStatus(order.id, 'Shipped')} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 flex items-center"><Truck size={14} className="mr-2"/> Shipped</button>
                          <button type="button" onClick={() => handleUpdateStatus(order.id, 'Completed')} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-600 flex items-center"><CheckCircle2 size={14} className="mr-2"/> Completed</button>
                          <button type="button" onClick={() => handleUpdateStatus(order.id, 'Cancelled')} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center"><XCircle size={14} className="mr-2"/> Cancelled</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {currentOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-12 text-center text-gray-400 font-medium">
                      Gösterilecek sipariş bulunamadı.
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-6 border-t border-gray-50 flex justify-between items-center bg-white">
          <span className="text-xs font-bold text-gray-400">Showing {filteredOrders.length} orders</span>
          {totalPages > 1 && (
            <div className="flex space-x-2">
              <button type="button" onClick={handlePrevPage} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 disabled:opacity-50"><ChevronLeft size={16}/></button>
              {[...Array(totalPages)].map((_, i) => (
                <button type="button" key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs ${currentPage === i + 1 ? 'bg-[#FF6B00] text-white shadow-sm' : 'border border-gray-100 text-gray-600 hover:bg-gray-50'}`}>{i + 1}</button>
              ))}
              <button type="button" onClick={handleNextPage} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 disabled:opacity-50"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}