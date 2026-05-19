import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, BarChart3, Filter, ArrowUpDown, ChevronDown, CalendarDays, Package, Check } from 'lucide-react';
import API from './api'; 

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('price_desc'); 
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false); 
  const [dateRange, setDateRange] = useState('This Week (Mon-Sun)'); 

  const [showCurrentLine, setShowCurrentLine] = useState(true);
  const [showPreviousLine, setShowPreviousLine] = useState(true);

  // 1. FIREBASE'DEN GERÇEK VERİLERİ ÇEKME
  const fetchAnalyticsData = async () => {
    try {
      const prodRes = await API.get('/products');
      const uniqueProducts = Array.from(new Map(prodRes.data.map(item => [item.sku, item])).values());
      setProducts(uniqueProducts);

      const ordRes = await API.get('/orders');
      setOrders(ordRes.data.map(order => {
        let validDate = new Date();
        if (order.timestamp) {
          if (order.timestamp._seconds) validDate = new Date(order.timestamp._seconds * 1000);
          else if (order.timestamp.seconds) validDate = new Date(order.timestamp.seconds * 1000);
          else validDate = new Date(order.timestamp);
        }
        return {
          ...order,
          amount: Number(order.amount || order.total || 0),
          dateObj: validDate
        };
      }));
    } catch (err) {
      console.error("Analiz verileri yüklenemedi:", err);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const totalOrders = orders.length;
  const aov = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
  const totalProducts = products.length;

  // =========================================================================
  // %100 GERÇEK: PAZARTESİDEN PAZARA (MON-SUN) TAKVİM ALGORİTMASI
  // =========================================================================
  const generateThisWeekAnalytics = () => {
    const dynamicData = [];
    const today = new Date();
    
    const dayOfWeek = today.getDay(); 
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const daysTR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

    for (let i = 0; i < 7; i++) {
      // Geçerli Gün
      const currentCalendarDate = new Date(monday);
      currentCalendarDate.setDate(monday.getDate() + i);
      
      // Önceki Haftanın Aynı Günü (Geçen haftayla gerçekçi kıyaslama için)
      const previousCalendarDate = new Date(currentCalendarDate);
      previousCalendarDate.setDate(currentCalendarDate.getDate() - 7);
      
      const dateStr = currentCalendarDate.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }); 
      const dayLabel = `${daysTR[i]} (${dateStr})`;
      
      // SADECE FIREBASE'DEKİ GERÇEK SİPARİŞLERİ TOPLA (GÜNCEL HAFTA)
      const currentDaySales = orders
        .filter(o => o.dateObj && o.dateObj.toDateString() === currentCalendarDate.toDateString())
        .reduce((sum, o) => sum + o.amount, 0);

      // SADECE FIREBASE'DEKİ GERÇEK SİPARİŞLERİ TOPLA (GEÇEN HAFTA)
      const previousDaySales = orders
        .filter(o => o.dateObj && o.dateObj.toDateString() === previousCalendarDate.toDateString())
        .reduce((sum, o) => sum + o.amount, 0);
        
      dynamicData.push({
        name: dayLabel,
        Current: currentDaySales, // Uydurma yok, satış yoksa 0 kalır!
        Previous: previousDaySales // Geçen hafta da satış yoksa 0 kalır!
      });
    }
    return dynamicData;
  };

  // =========================================================================
  // %100 GERÇEK: 4 HAFTALIK (PAZARTESİ-PAZAR) TAKVİM ALGORİTMASI
  // =========================================================================
  const generateThirtyDaysAnalytics = () => {
    const dynamicData = [];
    const today = new Date();

    const dayOfWeek = today.getDay(); 
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - distanceToMonday);
    currentMonday.setHours(0, 0, 0, 0);

    for (let i = 3; i >= 0; i--) {
      // GÜNCEL HAFTA ARALIĞI
      const startCurrent = new Date(currentMonday);
      startCurrent.setDate(currentMonday.getDate() - (i * 7));
      startCurrent.setHours(0, 0, 0, 0);
      
      const endCurrent = new Date(startCurrent);
      endCurrent.setDate(startCurrent.getDate() + 6);
      endCurrent.setHours(23, 59, 59, 999);

      // BİR ÖNCEKİ AYIN AYNI HAFTASI ARALIĞI (Kıyaslama çizgisi için)
      const startPrevious = new Date(startCurrent);
      startPrevious.setDate(startCurrent.getDate() - 28);
      const endPrevious = new Date(endCurrent);
      endPrevious.setDate(endCurrent.getDate() - 28);

      const startDay = startCurrent.getDate();
      const startMonth = startCurrent.toLocaleDateString('tr-TR', { month: 'short' });
      const endDay = endCurrent.getDate();
      const endMonth = endCurrent.toLocaleDateString('tr-TR', { month: 'short' });

      let weekLabel = startMonth === endMonth
          ? `${startDay} - ${endDay} ${startMonth}`
          : `${startDay} ${startMonth} - ${endDay} ${endMonth}`;

      // O HAFTADAKİ GERÇEK SİPARİŞLER (GÜNCEL)
      const currentWeekSales = orders
        .filter(o => o.dateObj && o.dateObj >= startCurrent && o.dateObj <= endCurrent)
        .reduce((sum, o) => sum + o.amount, 0);

      // O HAFTADAKİ GERÇEK SİPARİŞLER (ÖNCEKİ DÖNEM)
      const previousWeekSales = orders
        .filter(o => o.dateObj && o.dateObj >= startPrevious && o.dateObj <= endPrevious)
        .reduce((sum, o) => sum + o.amount, 0);

      dynamicData.push({
        name: weekLabel,
        Current: currentWeekSales, // Uydurma orantı YOK!
        Previous: previousWeekSales // Uydurma orantı YOK!
      });
    }
    return dynamicData;
  };

  const activeChartData = dateRange === 'This Week (Mon-Sun)' ? generateThisWeekAnalytics() : generateThirtyDaysAnalytics();

  // KATEGORİ DAĞILIMI
  const categoryData = products.reduce((acc, p) => {
    const cat = p.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const formattedPieData = Object.keys(categoryData).map(name => ({ name, value: categoryData[name] }));
  const COLORS = ['#FF6B00', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F472B6'];

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
    if (sortBy === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center relative">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Gelişmiş mağaza performansı ve satış analizleri</p>
        </div>
        
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className={`border px-5 py-3 rounded-2xl font-bold text-xs shadow-sm flex items-center transition-all ${
              isDateMenuOpen ? 'bg-orange-50 text-[#FF6B00] border-orange-200' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <CalendarDays size={16} className="mr-2" />
            {dateRange} <ChevronDown size={14} className="ml-2 opacity-60" />
          </button>

          {isDateMenuOpen && (
            <div className="absolute right-0 top-14 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button 
                type="button" 
                onClick={() => { setDateRange('This Week (Mon-Sun)'); setIsDateMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between ${dateRange === 'This Week (Mon-Sun)' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                This Week (Mon-Sun) {dateRange === 'This Week (Mon-Sun)' && <Check size={14} />}
              </button>
              <button 
                type="button" 
                onClick={() => { setDateRange('Last 4 Weeks'); setIsDateMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between ${dateRange === 'Last 4 Weeks' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Last 4 Weeks {dateRange === 'Last 4 Weeks' && <Check size={14} />}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* KPI KARTLARI (SAHTE YÜZDELER KALDIRILDI) */}
      <div className="grid grid-cols-4 gap-6">
        <KPIItem title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={Target} />
        <KPIItem title="AOV (Ortalama Sepet)" value={`$${aov}`} icon={TrendingUp} />
        <KPIItem title="Total Orders" value={totalOrders} icon={BarChart3} />
        <KPIItem title="Active Products" value={totalProducts} icon={Package} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* GRAFİK BÖLÜMÜ */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[480px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-gray-800 tracking-tight">Revenue Comparison</h3>
            <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setShowCurrentLine(!showCurrentLine)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${showCurrentLine ? 'bg-orange-50/50 border-orange-100 opacity-100' : 'bg-gray-50 border-gray-100 opacity-40'}`}
                >
                  <span className="w-2.5 h-2.5 bg-[#FF6B00] rounded-full"></span>
                  <span className="text-[11px] font-black text-gray-600">Current Trend</span>
                </button>
                <button 
                  onClick={() => setShowPreviousLine(!showPreviousLine)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${showPreviousLine ? 'bg-gray-50 border border-gray-200 opacity-100' : 'bg-gray-50 border-gray-100 opacity-40'}`}
                >
                  <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
                  <span className="text-[11px] font-black text-gray-600">Previous Trend</span>
                </button>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600}} />
                <Tooltip cursor={{stroke: '#FF6B00', strokeWidth: 1}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                {showPreviousLine && (
                  <Line type="monotone" dataKey="Previous" stroke="#E5E7EB" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                )}
                {showCurrentLine && (
                  <Line type="monotone" dataKey="Current" stroke="#FF6B00" strokeWidth={4} dot={{stroke: '#FF6B00', strokeWidth: 3, r: 5, fill: 'white'}} activeDot={{r: 7}} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KATEGORİ DAĞILIMI */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[480px] flex flex-col">
          <h3 className="font-bold text-xl text-gray-800 mb-8 tracking-tight">Category Distribution</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formattedPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {formattedPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-3xl font-black text-gray-800">{totalProducts}</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Items</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-8 overflow-y-auto max-h-24 custom-scrollbar pr-1">
            {formattedPieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-xs">
                    <span className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                    <span className="font-bold text-gray-800 truncate">{entry.name}</span>
                    <span className="ml-auto text-gray-400 font-bold">{entry.value}</span>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP PERFORMING PRODUCTS */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm">
        <div className="flex justify-between items-center mb-8 relative">
          <h3 className="font-bold text-xl text-gray-800 tracking-tight">Top Performing Products</h3>
          <div className="relative">
            <button 
                type="button" 
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} 
                className={`w-10 h-10 rounded-xl border transition-all flex items-center justify-center shadow-sm ${isSortMenuOpen ? 'bg-orange-50 text-[#FF6B00] border-orange-100' : 'bg-white text-gray-400 border-gray-100 hover:text-gray-600'}`}
            >
              <Filter size={18} />
            </button>
            {isSortMenuOpen && (
              <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 w-52 z-40">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-4 py-1.5 border-b border-gray-50 flex items-center"><ArrowUpDown size={10} className="mr-1"/> Sıralama Seçenekleri</p>
                <button type="button" onClick={() => { setSortBy('name_asc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'name_asc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Ürün Adı: A - Z</button>
                <button type="button" onClick={() => { setSortBy('price_desc'); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-xs font-bold ${sortBy === 'price_desc' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-600 hover:bg-gray-50'}`}>Ciro Potansiyeli (Fiyat)</button>
              </div>
            )}
          </div>
        </div>

        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-5">Product Name</th><th className="px-6 py-5">SKU</th><th className="px-6 py-5">Category</th><th className="px-6 py-5">Unit Price</th><th className="px-6 py-5 text-right">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedProducts.slice(0, 5).map((p) => {
                const stock = Number(p.stock);
                const isOutOfStock = stock === 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5"><span className="font-bold text-sm text-gray-800">{p.name}</span></td>
                    <td className="px-6 py-5"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.sku}</span></td>
                    <td className="px-6 py-5"><span className="text-xs font-bold text-gray-500">{p.category || 'Uncategorized'}</span></td>
                    <td className="px-6 py-5"><span className="font-black text-sm text-gray-800">${p.price}</span></td>
                    <td className="px-6 py-5 text-right">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${isOutOfStock ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50'}`}>
                            {isOutOfStock ? 'Out of Stock' : `${stock} Left`}
                        </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>
    </div>
  );
}

const KPIItem = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-36">
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
    <div className="flex items-center justify-between mt-2">
      <h3 className="text-3xl font-black text-gray-800 tracking-tighter">{value}</h3>
      <div className="w-10 h-10 bg-orange-50 text-[#FF6B00] rounded-xl flex items-center justify-center"><Icon size={20} /></div>
    </div>
    <p className="text-[9px] text-gray-300 font-bold italic">Firebase Data <span className="text-green-500 ml-1 font-black">Live</span></p>
  </div>
);