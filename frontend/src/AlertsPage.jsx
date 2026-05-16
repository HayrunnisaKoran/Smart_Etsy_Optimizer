import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { AlertTriangle, Package, Filter, ArrowUpDown, Search, ShieldAlert } from 'lucide-react';

export default function AlertsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('stock_asc'); // Varsayılan: En düşük stok başa
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // 1. Ürünleri Firebase'den Canlı Çekme
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          stock: Number(data.stock || 0),
          price: Number(data.price || 0),
          // Eğer veritabanında özel bir threshold (eşik) yoksa, akıllı algoritma olarak 
          // ürün fiyatı veya genel duruma göre dinamik bir eşik değeri (5 veya 10) atıyoruz.
          threshold: data.threshold || (Number(data.price) > 30 ? 5 : 10)
        };
      }));
    });
    return () => unsubscribe();
  }, []);

  // --- LOW STOCK ALGORITHM (DÜŞÜK STOK TESPİT ALGORİTMASI) ---
  // Filtreleme motoru sadece stok seviyesi belirlenen threshold (eşik) değerinin altına düşenleri ayıklar.
  const activeAlerts = products.filter(p => {
    const isLowStock = p.stock <= p.threshold; // Algoritmanın kalbi
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return isLowStock && matchesSearch;
  });

  // --- SIRALAMA MOTORU ---
  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    if (sortBy === 'stock_asc') return a.stock - b.stock; // En acil olanlar üstte
    if (sortBy === 'stock_desc') return b.stock - a.stock;
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
          <ShieldAlert className="text-[#FF6B00] mr-3" size={32} /> System Alerts
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-1">
          Düşük stok tespit algoritması tarafından üretilen anlık kritik uyarılar
        </p>
      </header>

      {/* ÖZET DURUM BİLGİSİ PANELİ */}
      <div className="bg-red-50/40 border border-red-100 rounded-[2rem] p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center animate-pulse">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Kritik Envanter Riski</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Şu an mağazanızda tedarik edilmesi gereken <span className="text-red-500 font-black">{sortedAlerts.length} adet ürün</span> tespit edildi.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-100/50 px-4 py-2 rounded-xl">
          ALGORITHM ACTIVE
        </span>
      </div>

      {/* FİLTRELEME VE ARAMA ÇUBUĞU */}
      <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search alerts by Product Name or SKU..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* SİPARİŞLERDEKİ GİBİ ÇALIŞAN HUNİ SIRALAMA SİSTEMİ */}
          <div className="relative">
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
                <button type="button" onClick={() => { setSortBy('stock_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'stock_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Stok: En Düşük Başa</button>
                <button type="button" onClick={() => { setSortBy('stock_desc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'stock_desc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Stok: En Yüksek Başa</button>
                <button type="button" onClick={() => { setSortBy('name_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'name_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Ürün Adı: A - Z</button>
              </div>
            )}
          </div>
        </div>

        {/* GÖRSELDEKİ SÜTUNLARLA BİREBİR UYUMLU KRİTİK STOK TABLOSU */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-8 py-5">Product</th>
                <th className="px-4 py-5">SKU</th>
                <th className="px-4 py-5">Current Stock</th>
                <th className="px-4 py-5">Threshold</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {sortedAlerts.map((item) => (
                <tr key={item.id} className="hover:bg-red-50/10 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100">
                        <Package size={18} />
                      </div>
                      <span className="font-bold text-sm text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.sku}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-black text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                      {item.stock} units
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-sm text-gray-400">{item.threshold} units</span>
                  </td>
                  
                  {/* GÖRSELDEKİ ŞIK PASPAS "LOW" BADGE ROZETİ */}
                  <td className="px-8 py-4 text-right">
                    <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 border border-red-100">
                      Low
                    </span>
                  </td>
                </tr>
              ))}
              
              {sortedAlerts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-medium italic">
                    Harika! Kritik stok sınırının altına düşen hiçbir ürün bulunamadı. Tüm envanter sağlıklı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}