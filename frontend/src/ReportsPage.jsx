import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { FileText, Download, TrendingUp, Package, Users, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [generatedReports, setGeneratedReports] = useState([]); // Firebase'den gelecek arşiv

  // --- GERÇEK ZAMANLI FIREBASE BAĞLANTILARI ---
  useEffect(() => {
    // 1. Ürünleri Çek
    const unsubProd = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // 2. Siparişleri Çek
    const unsubOrd = onSnapshot(query(collection(db, "orders"), orderBy("timestamp", "desc")), (snap) => {
      setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    // 3. Üretilen Rapor Arşivini Canlı Çek (Yeniden eskiye sıralı)
    const qReports = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const unsubReports = onSnapshot(qReports, (snap) => {
      setGeneratedReports(snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          // Firestore tarihini okunabilir formata çevirme
          date: data.createdAt?.toDate().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }) || 'Generating...'
        };
      }));
    });

    return () => { unsubProd(); unsubOrd(); unsubReports(); };
  }, []);

  // --- FİREBASE'E RAPOR KAYDETME MOTORU (CREATE) ---
  const handleGenerateReport = async (reportType) => {
    let reportName = '';
    if (reportType === 'Sales') reportName = `Dynamic Sales Report (${products.length} Products Scanned)`;
    if (reportType === 'Orders') reportName = `Fulfillment & Orders Log (${orders.length} Active Orders)`;
    if (reportType === 'Inventory') reportName = `Live Catalog Inventory Count`;
    if (reportType === 'Customer') reportName = `Customer Retention & CRM Analysis`;

    try {
      // Doğrudan Firestore'da "reports" koleksiyonuna ekliyoruz
      await addDoc(collection(db, "reports"), {
        name: reportName,
        type: reportType,
        createdAt: serverTimestamp() // Bulut saatiyle kayıt
      });
      alert(`${reportType} Raporu başarıyla buluta (Firebase) kaydedildi!`);
    } catch (err) {
      console.error("Rapor veritabanına kaydedilirken hata oluştu:", err);
      alert("Rapor kaydedilemedi, Firebase bağlantısını kontrol edin.");
    }
  };

  // --- VERİTABANINDAN ÇEKİLEN VERİLERLE EXCEL/CSV İNDİRME SİSTEMİ ---
  const handleDownloadReport = (e, report) => {
    e.preventDefault();
    e.stopPropagation(); 

    let headers = [];
    let rows = [];

    // Rapora tıklandığı an veritabanındaki güncel veriler CSV'ye dökülür
    if (report.type === 'Sales' || report.type === 'Customer') {
      headers = ["Order ID", "Customer Name", "Amount ($)", "Status", "Items Sold"];
      rows = orders.map(o => [
        o.id || '#', 
        o.customerName || o.customer || 'Customer', 
        `$${o.amount || 0}`, 
        o.status || 'Completed', 
        `${o.itemCount || 1} pcs`
      ]);
    } else if (report.type === 'Inventory') {
      headers = ["Product Name", "SKU", "Category", "Stock Count", "Price ($)"];
      rows = products.map(p => [
        p.name || 'Product', 
        p.sku || 'SKU', 
        p.category || 'Uncategorized', 
        p.stock || 0, 
        `$${p.price || 0}`
      ]);
    } else {
      headers = ["Log ID", "Report Type", "Execution Date", "Status"];
      rows = [[report.id, report.type, report.date, "SUCCESS_OPERATIONAL"]];
    }

    const fullCsv = [headers, ...rows].map(row => row.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${report.type}_Report_${report.id.slice(0,5)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reports</h1>
        <p className="text-gray-400 text-sm font-medium mt-1">Generate and download detailed store reports from Firebase</p>
      </header>

      {/* 4 ADET DİNAMİK RAPOR KARTI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ReportCard title="Sales Report" desc="Detailed sales performance & charts data" icon={TrendingUp} onGenerate={() => handleGenerateReport('Sales')} />
        <ReportCard title="Orders Report" desc="Orders fulfillment and shipping status" icon={FileText} onGenerate={() => handleGenerateReport('Orders')} />
        <ReportCard title="Inventory Report" desc="Catalog audit, stock levels and categories" icon={Package} onGenerate={() => handleGenerateReport('Inventory')} />
        <ReportCard title="Customer Report" desc="Customer CRM metrics and lifecycles" icon={Users} onGenerate={() => handleGenerateReport('Customer')} />
      </div>

      {/* FIREBASE'DEN GELEN RAPORLAR LİSTESİ (ARŞİV) */}
      <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm p-8 flex flex-col min-h-[350px]">
        <h3 className="font-bold text-xl text-gray-800 mb-6 tracking-tight flex items-center">
          <CheckCircle2 size={20} className="text-green-500 mr-2" /> Cloud Reports Archive
        </h3>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/40 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4 rounded-tl-2xl">Report Name / Cloud ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date Generated</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {generatedReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-gray-50/40 transition-all animate-in fade-in duration-300">
                  <td className="px-6 py-5 flex flex-col">
                    <span className="font-bold text-sm text-gray-800">{rep.name}</span>
                    <span className="text-[10px] text-gray-300 font-mono mt-0.5">ID: {rep.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      rep.type === 'Sales' ? 'text-green-600 bg-green-50' : rep.type === 'Inventory' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                    }`}>
                      {rep.type}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-gray-400">{rep.date}</td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      type="button"
                      onClick={(e) => handleDownloadReport(e, rep)}
                      className="inline-flex items-center space-x-2 text-[#FF6B00] hover:text-orange-700 font-bold text-xs transition-colors ml-auto bg-orange-50/30 px-3 py-2 rounded-xl border border-orange-100/50"
                    >
                      <Download size={14} /> <span>Download CSV</span>
                    </button>
                  </td>
                </tr>
              ))}
              {generatedReports.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium italic">
                    Henüz bulutta üretilmiş bir rapor bulunmuyor. Yukarıdan yeni bir rapor üretebilirsiniz.
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

const ReportCard = ({ title, desc, icon: Icon, onGenerate }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col justify-between h-52 hover:shadow-md transition-shadow">
    <div>
      <div className="w-11 h-11 bg-orange-50 text-[#FF6B00] rounded-2xl flex items-center justify-center mb-4 border border-orange-100/30"><Icon size={22} /></div>
      <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>
      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{desc}</p>
    </div>
    <button 
      type="button" 
      onClick={onGenerate}
      className="mt-4 w-full border border-gray-100 text-[#FF6B00] font-black text-xs py-3 rounded-xl hover:bg-orange-50 transition-all uppercase tracking-widest text-center shadow-sm"
    >
      Generate
    </button>
  </div>
);