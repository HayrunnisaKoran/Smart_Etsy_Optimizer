import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, Plus, RefreshCw, Clock } from 'lucide-react';
import API from './api';

const DashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', stock: '', price: '' });
  
  const [chartPeriod, setChartPeriod] = useState('daily');
  const [activityTab, setActivityTab] = useState('general');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  
  const [etsyApiLogs, setEtsyApiLogs] = useState([]);

  // 1. FIREBASE'DEN GERÇEK VERİLERİ ÇEKME
  const loadDashboardData = async () => {
    try {
      const prodRes = await API.get('/products');
      const uniqueProducts = Array.from(new Map(prodRes.data.map(item => [item.sku, item])).values());
      setProducts(uniqueProducts);

      const ordRes = await API.get('/orders');
      const cleanOrders = ordRes.data.map(o => {
        let parsedTime = 'Yeni';
        let validDate = new Date();
        if (o.timestamp) {
          validDate = o.timestamp._seconds ? new Date(o.timestamp._seconds * 1000) : new Date(o.timestamp);
          parsedTime = isNaN(validDate.getTime()) ? 'Yeni' : validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return {
          ...o,
          id: o.id || 'UNKNOWN',
          customerName: typeof o.customerName === 'object' ? JSON.stringify(o.customerName) : (o.customerName || o.customer || 'Bilinmeyen Müşteri'),
          amount: Number(o.amount || o.total || 0),
          itemCount: Number(o.itemCount || (o.items ? o.items.length : 1)),
          status: o.status || 'Completed',
          timeString: parsedTime,
          dateObj: validDate
        };
      });
      setOrders(cleanOrders);
    } catch (err) {
      console.error("Dashboard veri yükleme hatası:", err);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  const getDashboardProductThreshold = (p) => Number(p.threshold || (Number(p.price) > 30 ? 5 : 10));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage('Etsy ile senkronize ediliyor...');
    
    try {
      const newLogs = [];

      const salesRes = await API.get('/etsy/sales/fetch?startDate=2026-05-01&endDate=2026-05-30');
      const fetchedSales = salesRes.data.data;
      
      for (const sale of fetchedSales) {
          newLogs.push({
            text: `Etsy'den Satış Çekildi: SKU ${sale.sku}, ${sale.quantitySold} Adet`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Fetched',
            type: 'api'
          });

          await API.post('/orders', {
            customerName: `Etsy Buyer (${sale.sku})`,
            amount: Number(sale.amount || 550),
            itemCount: Number(sale.quantitySold || 1),
            status: 'Completed',
            timestamp: new Date()
          });
      }

      if (products.length > 0) {
        const productsToUpdate = products.filter(p => Number(p.stock) <= getDashboardProductThreshold(p));
        
        if(productsToUpdate.length > 0) {
            const mockInventoryUpdate = productsToUpdate.map(p => ({ 
                sku: p.sku || 'UNKNOWN', 
                newStock: Number(p.stock) + 10
            }));

            const updateRes = await API.post('/etsy/inventory/update', mockInventoryUpdate);
            
            for (const p of productsToUpdate) {
               await API.patch(`/products/${p.id}`, { stock: Number(p.stock) + 10 });
            }

            updateRes.data.result.success.forEach(item => {
                newLogs.push({
                    text: `Stok Entegrasyonu Gönderildi: SKU ${item.sku} -> Yeni Yerel/Uzak Stok: ${item.newStock}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'Synced',
                    type: 'api'
                });
            });
        } else {
            newLogs.push({
                text: "Kritik seviyenin altında ürün bulunamadı. Stoklar sağlıklı.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Skipped',
                type: 'api'
            });
        }
      }

      setEtsyApiLogs(newLogs);
      setRefreshMessage('Mağaza verileri başarıyla senkronize edildi!');
      await loadDashboardData();

    } catch (error) {
      console.error("API Bağlantı Hatası:", error);
      setRefreshMessage('Senkronizasyon başarısız oldu!');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setRefreshMessage('');
      }, 3000); 
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await API.post('/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        stock: Number(newProduct.stock),
        price: Number(newProduct.price)
      });
      setNewProduct({ name: '', sku: '', stock: '', price: '' });
      setIsModalOpen(false);
      loadDashboardData();
    } catch (err) { console.error("Ürün ekleme hatası:", err); }
  };

  const itemsSold = orders.reduce((acc, curr) => acc + Number(curr.itemCount || 1), 0);
  const inventoryValue = products.reduce((acc, curr) => acc + (Number(curr.price || 0) * Number(curr.stock || 0)), 0);

  const generateGeneralActivities = () => {
    const orderActivities = orders.map(o => ({
      text: `${o.customerName} isimli kullanıcıdan $${o.amount} tutarında sipariş alındı.`,
      time: o.timeString || 'Yeni',
      status: o.status,
      type: 'order'
    }));

    const productActivities = products.map(p => ({
      text: `"${p.name}" ürünü envantere eklendi. (Stok: ${p.stock})`,
      time: 'Güncel',
      status: 'Success',
      type: 'product'
    }));

    return [...orderActivities, ...productActivities].slice(0, 5);
  };

  const activeActivities = activityTab === 'general' 
    ? generateGeneralActivities() 
    : (etsyApiLogs.length > 0 ? etsyApiLogs : [{ text: "Henüz senkronizasyon yapılmadı. 'Refresh Data' butonuna tıklayın.", time: "-", status: "Waiting", type: "api" }]);

  // =========================================================================
  // %100 GERÇEK: PAZARTESİDEN PAZARA (MON-SUN) TAKVİM ALGORİTMASI
  // =========================================================================
  const generateDynamicDailyData = () => {
    const dynamicData = [];
    const today = new Date();
    
    const dayOfWeek = today.getDay(); 
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);
    
    const daysTR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    
    for (let i = 0; i < 7; i++) {
      const calendarDate = new Date(monday);
      calendarDate.setDate(monday.getDate() + i); 
      
      const dateStr = calendarDate.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }); 
      const dayLabel = `${daysTR[i]} (${dateStr})`;
      
      // SADECE FIREBASE'DEKİ GERÇEK SİPARİŞLERİ TOPLA
      const dayOrdersSum = orders
        .filter(o => o.dateObj && o.dateObj.toDateString() === calendarDate.toDateString())
        .reduce((sum, o) => sum + o.amount, 0);
        
      dynamicData.push({ name: dayLabel, sales: dayOrdersSum }); // YALANCI VERİ YOK, SATIŞ YOKSA 0!
    }
    return dynamicData;
  };

  // =========================================================================
  // %100 GERÇEK: 4 HAFTALIK (PAZARTESİ-PAZAR) TAKVİM ALGORİTMASI
  // =========================================================================
  const generateDynamicWeeklyData = () => {
    const dynamicWeeks = [];
    const today = new Date();

    const dayOfWeek = today.getDay(); 
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - distanceToMonday);
    currentMonday.setHours(0, 0, 0, 0);
    
    for (let i = 3; i >= 0; i--) {
      const startDate = new Date(currentMonday);
      startDate.setDate(currentMonday.getDate() - (i * 7));
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      const startDay = startDate.getDate();
      const startMonth = startDate.toLocaleDateString('tr-TR', { month: 'short' });
      const endDay = endDate.getDate();
      const endMonth = endDate.toLocaleDateString('tr-TR', { month: 'short' });

      let weekLabel = startMonth === endMonth
          ? `${startDay} - ${endDay} ${startMonth}`
          : `${startDay} ${startMonth} - ${endDay} ${endMonth}`;

      // O HAFTADAKİ GERÇEK SİPARİŞLER
      const weekOrdersSum = orders
        .filter(o => o.dateObj && o.dateObj >= startDate && o.dateObj <= endDate)
        .reduce((sum, o) => sum + o.amount, 0);
        
      dynamicWeeks.push({ name: weekLabel, sales: weekOrdersSum }); // YALANCI VERİ YOK, SATIŞ YOKSA 0!
    }
    return dynamicWeeks;
  };

  const dailyChartData = generateDynamicDailyData(); 
  const weeklyChartData = generateDynamicWeeklyData();
  const activeChartData = chartPeriod === 'daily' ? dailyChartData : weeklyChartData;

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-700">
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Anlık mağaza performansı</p>
        </div>
        <div className="flex items-center space-x-3">
            {refreshMessage && (
              <span className={`text-xs font-bold px-3 py-2 rounded-xl animate-pulse ${refreshMessage.includes('başarısız') ? 'text-red-500 bg-red-50' : 'text-orange-500 bg-orange-50'}`}>
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

      {/* KPI KARTLARI (SAHTE YÜZDELER SİLİNDİ) */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Total Products" value={products.length} />
        <StatCard title="Total Orders" value={orders.length} />
        <StatCard title="Items Sold" value={itemsSold} />
        <StatCard title="Inventory Value" value={`$${inventoryValue.toLocaleString()}`} />
      </div>

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

        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col h-[450px]">
          <h3 className="font-bold text-xl text-gray-800 mb-8 tracking-tight">Top Selling Products</h3>
          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {products.slice(0, 5).map(p => {
                const stockPercentage = Math.min(100, ((p.stock || 0) / 150) * 100);
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

        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm h-[400px] flex flex-col justify-between">
          <h3 className="font-bold text-xl text-gray-800 tracking-tight">Inventory Health</h3>
          <div className="flex space-x-4 items-end h-full mt-4">
            {[
              { label: 'In Stock', value: products.filter(p => Number(p.stock) > getDashboardProductThreshold(p)).length, color: 'bg-green-500' },
              { label: 'Low Stock', value: products.filter(p => { const s = Number(p.stock); return s > 0 && s <= getDashboardProductThreshold(p); }).length, color: 'bg-amber-500' },
              { label: 'Out of Stock', value: products.filter(p => Number(p.stock) === 0).length, color: 'bg-red-500' }
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

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
    <div className="flex items-center justify-between mt-2">
      <h3 className="text-3xl font-black text-gray-800 tracking-tighter">{value}</h3>
    </div>
    <p className="text-[9px] text-gray-300 font-bold mt-2 italic">Firebase Data <span className="text-green-500 ml-1 font-black">Live</span></p>
  </div>
);

export default DashboardPage;