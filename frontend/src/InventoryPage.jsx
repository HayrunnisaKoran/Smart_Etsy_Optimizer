import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Box, CheckCircle2, AlertTriangle, XCircle, Search, Plus, Minus, X } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  // 1. Ürünleri Firebase'den Canlı Çekme
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  // --- DİNAMİK STOK HESAPLAMALARI ---
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => Number(p.stock) >= 10);
  const lowStockProducts = products.filter(p => Number(p.stock) > 0 && Number(p.stock) < 10);
  const outOfStockProducts = products.filter(p => Number(p.stock) === 0);

  // Yüzdelik Hesaplamaları (Güvenli bölme ile)
  const inStockPct = totalProducts > 0 ? Math.round((inStockProducts.length / totalProducts) * 100) : 0;
  const lowStockPct = totalProducts > 0 ? Math.round((lowStockProducts.length / totalProducts) * 100) : 0;
  const outOfStockPct = totalProducts > 0 ? Math.round((outOfStockProducts.length / totalProducts) * 100) : 0;

  // --- RECHARTS BAR GRAFİĞİ VERİSİ ---
  const chartData = [
    { name: 'In Stock', count: inStockProducts.length, color: '#22C55E' },
    { name: 'Low Stock', count: lowStockProducts.length, color: '#F59E0B' },
    { name: 'Out of Stock', count: outOfStockProducts.length, color: '#EF4444' }
  ];

  // --- HIZLI STOK ARTTIRMA / AZALTMA FONKSİYONU (Direct Firebase Update) ---
  const handleUpdateStock = async (productId, currentStock, amount) => {
    const newStock = Math.max(0, Number(currentStock) + amount); // Stok eksiye düşmesin
    try {
      await updateDoc(doc(db, "products", productId), {
        stock: newStock
      });
    } catch (err) {
      console.error("Stok güncellenirken hata oluştu:", err);
    }
  };

  // Modal içindeki hızlı arama filtresi
  const filteredModalProducts = products.filter(p => 
    p.name.toLowerCase().includes(modalSearchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory Health</h1>
        <p className="text-gray-400 text-sm font-medium mt-1">Monitor your stock levels and prevent stockouts</p>
      </header>

      {/* ÜST İSTATİSTİK KARTLARI (Ekran Görüntün ile Birebir Tasarım) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Products */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Products</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-4xl font-black text-gray-800 tracking-tighter">{totalProducts}</h3>
            <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center"><Box size={20}/></div>
          </div>
          <p className="text-[9px] text-gray-300 font-bold italic">Active items in catalog</p>
        </div>

        {/* In Stock */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">In Stock</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-4xl font-black text-gray-800 tracking-tighter">{inStockProducts.length}</h3>
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><CheckCircle2 size={20}/></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mr-2"><div className="bg-green-500 h-full" style={{width: `${inStockPct}%`}}></div></div>
            <span>{inStockPct}%</span>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Low Stock</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-4xl font-black text-gray-800 tracking-tighter">{lowStockProducts.length}</h3>
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><AlertTriangle size={20}/></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mr-2"><div className="bg-amber-500 h-full" style={{width: `${lowStockPct}%`}}></div></div>
            <span>{lowStockPct}%</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Out of Stock</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-4xl font-black text-gray-800 tracking-tighter">{outOfStockProducts.length}</h3>
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><XCircle size={20}/></div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mr-2"><div className="bg-red-500 h-full" style={{width: `${outOfStockPct}%`}}></div></div>
            <span>{outOfStockPct}%</span>
          </div>
        </div>

      </div>

      {/* ORTA PANEL: GRAFİK VE LİSTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Taraf: Envanter Dağılım Grafiği */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[420px] flex flex-col">
          <h3 className="font-bold text-xl text-gray-800 tracking-tight mb-6">Inventory Overview</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="count" radius={[12, 12, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sağ Taraf: Kritik Stok Uyarı Paneli (Butonun Olduğu Yer) */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[420px] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xl text-gray-800 tracking-tight mb-6">Low Stock Items</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 border border-amber-50 bg-amber-50/20 rounded-2xl">
                  <div className="overflow-hidden mr-2">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {p.stock} Left
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24}/>
                  </div>
                  <p className="text-sm font-bold text-gray-400">All stocks are healthy!</p>
                </div>
              )}
            </div>
          </div>

          {/* ARTIK %100 AKTİF OLAN MANAGE INVENTORY BUTONU */}
          <button 
            type="button"
            onClick={() => setIsManageModalOpen(true)}
            className="w-full bg-white text-[#FF6B00] border border-orange-100 hover:bg-orange-50/50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center mt-4 shadow-sm"
          >
            Manage Inventory
          </button>
        </div>

      </div>

      {/* --- HIZLI STOK YÖNETİM MODALI (MANAGE INVENTORY TETİKLEMESİ) --- */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200 border border-gray-50 flex flex-col h-[550px]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quick Stock Manager</h2>
                <p className="text-gray-400 text-xs font-medium mt-0.5">Hızlı stok arttırma ve azaltma paneli</p>
              </div>
              <button type="button" onClick={() => setIsManageModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Arama Çubuğu */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Ürün adı veya SKU ile hızlı ara..." 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                value={modalSearchTerm}
                onChange={(e) => setModalSearchTerm(e.target.value)}
              />
            </div>

            {/* Ürün Listesi ve Hızlı Düzenleme Butonları */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
              {filteredModalProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 border border-gray-50 bg-gray-50/30 rounded-2xl hover:bg-gray-50/70 transition-colors">
                  <div className="overflow-hidden mr-4">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">SKU: {p.sku} | ${p.price}</p>
                  </div>
                  
                  {/* Stok Arttırma / Azaltma Tetikleyicileri */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => handleUpdateStock(p.id, p.stock, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-black text-sm text-gray-800">{p.stock}</span>
                    <button 
                      type="button" 
                      onClick={() => handleUpdateStock(p.id, p.stock, 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-100 text-gray-500 hover:text-green-500 hover:bg-green-50 flex items-center justify-center transition-all shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredModalProducts.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-12 italic">Aradığınız kriterde ürün bulunamadı.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-gray-50 text-right">
              <button 
                type="button" 
                onClick={() => setIsManageModalOpen(false)} 
                className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-orange-100 hover:bg-[#e66000] transition-all uppercase tracking-wider"
              >
                Kapat ve Değişiklikleri Kaydet
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}