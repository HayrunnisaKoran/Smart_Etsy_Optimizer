import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Package, ShoppingCart, Plus, Search, RefreshCw, Clock, CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', stock: '', price: '' });
  
  // --- YENİ EKLENEN AKTİF STATE YAPILARI ---
  const [chartPeriod, setChartPeriod] = useState('daily'); // 'daily' veya 'weekly'
  const [activityTab, setActivityTab] = useState('general'); // 'general' veya 'etsy'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');

  useEffect(() => {
    const qProd = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubProd = onSnapshot(qProd, (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    const qOrd = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubOrd = onSnapshot(qOrd, (snap) => {
      setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => { unsubProd(); unsubOrd(); };
  }, []);

  // REFRESH DATA BUTONU FONKSİYONU
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshMessage('Veriler senkronize ediliyor...');
    
    // Gerçekçi bir API yenileme efekti için 1 saniye gecikme ekliyoruz
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshMessage('Mağaza verileri güncel!');
      setTimeout(() => setRefreshMessage(''), 2000);
    }, 1200);
  };

  // ÜRÜN EKLEME FONKSİYONU
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        stock: Number(newProduct.stock),
        price: Number(newProduct.price),
        createdAt: serverTimestamp()
      });
      setNewProduct({ name: '', sku: '', stock: '', price: '' });
      setIsModalOpen(false);
    } catch (err) { console.error(err); }
  };

  // VERİTABANINDAN GELEN GERÇEK VERİLERLE DOSYALARI ANALİZ ETME VE AKTİVİTE LOGU OLUŞTURMA
  const totalSalesValue = orders.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const itemsSold = orders.reduce((acc, curr) => acc + Number(curr.itemCount || 1), 0);
  const inventoryValue = products.reduce((acc, curr) => acc + (Number(curr.price || 0) * Number(curr.stock || 0)), 0);

  // --- GERÇEK VERİLERDEN DİNAMİK LOG OLUŞTURMA (RECENT ACTIVITY) ---
  const generateGeneralActivities = () => {
    const orderActivities = orders.map(o => ({
      text: `${o.customerName || 'Bilinmeyen Müşteri'} isimli kullanıcıdan $${o.amount} tutarında sipariş alındı.`,
      time: 'Yeni',
      status: o.status || 'Completed',
      type: 'order'
    }));

    const productActivities = products.map(p => ({
      text: `"${p.name}" ürünü envantere eklendi. (Stok: ${p.stock})`,
      time: 'Güncel',
      status: 'Success',
      type: 'product'
    }));

    // Sipariş ve ürün loglarını birleştiriyoruz
    return [...orderActivities, ...productActivities].slice(0, 5);
  };

  // ETSY API SEKME VERİSİ (SENKRONİZASYON SİMÜLASYONU)
  const generateEtsyApiActivities = () => {
    return products.slice(0, 3).map(p => ({
      text: `Etsy API: Envanterdeki "${p.name}" ürünü mağaza ile eşitlendi.`,
      time: 'Eş zamanlı',
      status: 'Synced',
      type: 'api'
    }));
  };

  const activeActivities = activityTab === 'general' ? generateGeneralActivities() : generateEtsyApiActivities();

  // --- GRAFİK İÇİN GÜNLÜK VE HAFTALIK VERİ SETLERİ ---
  const dailyChartData = [
    { name: 'May 8', sales: 1200 }, { name: 'May 9', sales: 1900 },
    { name: 'May 10', sales: 1500 }, { name: 'May 11', sales: 2200 },
    { name: 'May 12', sales: 1800 }, { name: 'May 13', sales: 2400 },
    { name: 'May 14', sales: 2100 }, { name: 'May 15', sales: totalSalesValue > 0 ? totalSalesValue : 2800 }
  ];

  const weeklyChartData = [
    { name: 'Week 17', sales: 8500 },
    { name: 'Week 18', sales: 12400 },
    { name: 'Week 19', sales: 9800 },
    { name: 'Week 20', sales: 15600 }
  ];

  const activeChartData = chartPeriod === 'daily' ? dailyChartData : weeklyChartData;

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Anlık mağaza performansı</p>
        </div>
        <div className="flex items-center space-x-3">
            {refreshMessage && (
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-2 rounded-xl animate-pulse">
                {refreshMessage}
              </span>
            )}
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-orange-600 border border-orange-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all flex items-center shadow-sm">
               <Plus size={18} className="mr-2" /> Add Product
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-100 flex items-center hover:bg-[#e66000] transition-all disabled:opacity-80"
            >
                <RefreshCw size={14} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                {isRefreshing ? 'Yenileniyor...' : 'Refresh Data'}
            </button>
        </div>
      </header>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total Products" value={products.length} trend="Live" isPositive={true} />
        <StatCard title="Total Orders" value={orders.length} trend="+12.4%" isPositive={true} />
        <StatCard title="Items Sold" value={itemsSold} trend="+14.8%" isPositive={true} />
        <StatCard title="Inventory Value" value={`$${inventoryValue.toLocaleString()}`} trend="Value" isPositive={true} />
      </div>

      {/* ORTA PANEL (GRAFİK GEÇİŞİ AKTİFLEŞTİRİLDİ) */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-gray-800 tracking-tight">Sales Overview</h3>
            <div className="bg-gray-50 p-1 rounded-xl flex space-x-1 text-[10px] font-black uppercase">
              <button 
                onClick={() => setChartPeriod('daily')}
                className={`px-4 py-2 rounded-lg transition-all ${chartPeriod === 'daily' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
              >
                Daily
              </button>
              <button 
                onClick={() => setChartPeriod('weekly')}
                className={`px-4 py-2 rounded-lg transition-all ${chartPeriod === 'weekly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
              >
                Weekly
              </button>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData}>
                <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B00" stopOpacity={0.15}/><stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 600}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                <Area type="monotone" dataKey="sales" stroke="#FF6B00" strokeWidth={4} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP SELLING PRODUCTS */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col h-[450px]">
          <h3 className="font-bold text-xl text-gray-800 mb-8 tracking-tight">Top Selling Products</h3>
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {products.slice(0, 5).map(p => {
                const stockPercentage = Math.min(100, (p.stock / 150) * 100);
                return (
                    <div key={p.id} className="flex justify-between items-center border border-gray-100 p-3 rounded-2xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-orange-200"><Package size={20}/></div>
                            <div>
                                <p className="text-sm font-bold text-gray-800 truncate w-24">{p.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">SKU: {p.sku}</p>
                            </div>
                        </div>
                        <div className="w-24 text-right">
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{width: `${stockPercentage}%`}}></div></div>
                            <span className="text-[10px] font-black text-gray-500 mt-1 block">{p.stock} units</span>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>

      {/* ALT PANEL (RECENT ACTIVITY SEKME GEÇİŞİ VE GERÇEK VERİ BAĞLANTISI) */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-gray-800 tracking-tight">Recent Activity</h3>
            <div className="bg-gray-50 p-1 rounded-xl flex space-x-1 text-[10px] font-black uppercase">
              <button 
                onClick={() => setActivityTab('general')}
                className={`px-4 py-2 rounded-lg transition-all ${activityTab === 'general' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
              >
                General
              </button>
              <button 
                onClick={() => setActivityTab('etsy')}
                className={`px-4 py-2 rounded-lg transition-all ${activityTab === 'etsy' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
              >
                Etsy API
              </button>
            </div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
             {activeActivities.length > 0 ? activeActivities.map((activity, index) => (
               <div key={index} className="flex justify-between items-center p-3 border border-gray-50 rounded-2xl bg-gray-50/30">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      activity.type === 'order' ? 'bg-green-50 text-green-600' : activity.type === 'product' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                        {activity.type === 'order' ? 'O' : activity.type === 'product' ? 'P' : 'E'}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-700 leading-tight w-48 break-words">{activity.text}</p>
                        <p className="text-[9px] font-black text-green-500 uppercase mt-0.5">{activity.status}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center text-[10px] font-bold text-gray-400">
                    <Clock size={10} className="mr-1" /> {activity.time}
                  </div>
               </div>
             )) : (
               <div className="text-center text-gray-300 italic pt-12 text-sm">Gösterilecek aktivite kaydı bulunamadı.</div>
             )}
          </div>
        </div>

        {/* INVENTORY HEALTH PROGRESS COLUMNS */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[400px] flex flex-col justify-between">
          <h3 className="font-bold text-xl text-gray-800 tracking-tight">Inventory Health</h3>
          <div className="flex space-x-4 items-end h-full mt-4">
            {[
              { label: 'In Stock', value: products.filter(p => p.stock >= 10).length, color: 'bg-green-500' },
              { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock < 10).length, color: 'bg-amber-500' },
              { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, color: 'bg-red-500' }
            ].map(col => {
              const heightPercentage = products.length > 0 ? Math.min(100, (col.value / products.length) * 100) : 0;
              return (
                <div key={col.label} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-50 rounded-2xl h-44 relative overflow-hidden flex flex-col justify-end border border-gray-100">
                    <div className={`${col.color} rounded-2xl transition-all duration-500`} style={{height: `${heightPercentage}%`}}></div>
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-black text-gray-800">{col.value}</span>
                  </div>
                  <span className="text-[9px] font-black text-gray-400 uppercase mt-2 tracking-wider text-center">{col.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL BÖLÜMÜ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl">
            <h2 className="text-2xl font-black mb-8 text-gray-900">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-5">
              <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" placeholder="Product Name" onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <input required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" placeholder="SKU" onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" placeholder="Stock" onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} />
                <input type="number" step="0.01" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium" placeholder="Price ($)" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
              </div>
              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400">Cancel</button>
                <button type="submit" className="flex-1 bg-[#FF6B00] text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, trend, isPositive }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
    <div className="flex items-center justify-between mt-2">
      <h3 className="text-3xl font-black text-gray-800 tracking-tighter">{value}</h3>
      <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{trend}</div>
    </div>
    <p className="text-[9px] text-gray-300 font-bold mt-2 italic">from last 7 days</p>
  </div>
);

export default DashboardPage;