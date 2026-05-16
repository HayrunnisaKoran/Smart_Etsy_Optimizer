import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
// FIREBASE BAĞLANTILARI: db ve Firestore metotları eklendi
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  LayoutDashboard, Package, ShoppingCart, BarChart3, 
  Settings, Bell, LogOut, Users, FileText, Box, X, Save // X ve Save ikonları eklendi, Layers silindi
} from 'lucide-react';

// Sayfalarımızı içe aktarıyoruz
import Login from './Login';
import DashboardPage from './DashboardPage';
import ProductsPage from './ProductsPage';
import OrdersPage from './OrdersPage';
import AnalyticsPage from './AnalyticsPage';
import InventoryPage from './InventoryPage'; 
import SettingsPage from './SettingsPage';
import ReportsPage from './ReportsPage';
import AlertsPage from './AlertsPage';
import UsersPage from './UsersPage';

// --- SIDEBAR ITEM BİLEŞENİ ---
const SidebarItem = ({ icon: Icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${
      isActive ? 'bg-orange-50 text-[#FF6B00] shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
    }`}>
      <Icon size={20} className={isActive ? 'text-[#FF6B00]' : 'text-gray-400'} />
      <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-bold'}`}>{label}</span>
    </Link>
  );
};

// --- ANA YERLEŞİM (SIDEBAR VE CANLI PROFİL BURADA) ---
const Layout = ({ children }) => {
  const user = auth.currentUser;

  // --- ADMİN PROFİL YÖNETİMİ STATE'LERİ ---
  const [adminName, setAdminName] = useState('Hayrünnisa Koran');
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@gmail.com');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Modal kontrolü
  const [isSaving, setIsSaving] = useState(false);

  // 1. ADMİN BİLGİLERİNİ FIREBASE'DEN CANLI DİNLEME (READ)
  useEffect(() => {
    const docRef = doc(db, "settings", "admin_profile");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdminName(data.name || 'Hayrünnisa Koran');
        setAdminEmail(data.email || user?.email || 'admin@gmail.com');
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. PROFİL DEĞİŞİKLİKLERİNİ FIREBASE'E KALICI KAYDETME (WRITE)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "admin_profile"), {
        name: adminName,
        email: adminEmail
      }, { merge: true });
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error("Profil buluta kaydedilirken hata:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Sistemden çıkış yapmak istediğinize emin misiniz?")) {
      signOut(auth);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col fixed h-full z-20 shadow-sm select-none">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#FF6B00] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 text-white font-bold text-xl italic">E</div>
          <span className="text-xl font-black tracking-tighter text-gray-800">EtsySync</span>
        </div>
        
        {/* --- İNTEGRATİONS TAMAMEN SİLİNDİ, USERS KORUNDU --- */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
             <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
             <SidebarItem icon={Package} label="Products" to="/products" />
             <SidebarItem icon={ShoppingCart} label="Orders" to="/orders" />
             <SidebarItem icon={Box} label="Inventory" to="/inventory" />
             <SidebarItem icon={BarChart3} label="Analytics" to="/analytics" />
             <SidebarItem icon={FileText} label="Reports" to="/reports" />
             <SidebarItem icon={Bell} label="Alerts" to="/alerts" />
             <SidebarItem icon={Settings} label="Settings" to="/settings" />
             <SidebarItem icon={Users} label="Users" to="/users" />
        </nav>

        {/* --- ALT ALAN: ÇIKISH VE %100 İŞLEVSEL PROFİL KARTI --- */}
        <div className="pt-6 border-t border-gray-50 mt-4 space-y-4">
          <button 
            type="button"
            onClick={handleLogout} 
            className="flex items-center space-x-3 p-3 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 w-full transition-all group"
          >
            <LogOut size={20} /> <span className="font-bold text-sm">Logout</span>
          </button>
          
          {/* TIKLANABİLİR ETKİLEŞİMLİ PROFİL KARTI */}
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center space-x-3 mt-4 px-2 cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all border border-transparent hover:border-gray-100 group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-[#FF6B00] font-black text-sm shrink-0 transition-transform group-hover:scale-105">
              {adminName ? adminName.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-black text-gray-800 truncate group-hover:text-[#FF6B00] transition-colors">{adminName}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase truncate font-mono">{adminEmail}</p>
            </div>
          </div>
        </div>
      </aside>
      
      <div className="flex-1 ml-64 bg-[#FDFDFD]">{children}</div>

      {/* --- ADMİN PROFİL DÜZENLEME PANELİ (MODAL) --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-200 border border-gray-50">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Profile Settings</h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Sol altta görünecek sistem yöneticisi bilgileri</p>
              </div>
              <button type="button" onClick={() => setIsProfileModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Full Name</label>
                <input 
                  type="text" 
                  required 
                  className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-orange-500/10 text-gray-700" 
                  value={adminName} 
                  onChange={(e) => setAdminName(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin System Email</label>
                <input 
                  type="email" 
                  required 
                  className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-orange-500/10 text-gray-700" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-[#FF6B00] text-white py-4 rounded-2xl font-bold shadow-xl shadow-orange-200 flex items-center justify-center">
                  <Save size={14} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white font-bold text-[#FF6B00]">EtsySync Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        {/* Tüm Korunan Rotalar */}
        <Route path="/" element={user ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/products" element={user ? <Layout><ProductsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/orders" element={user ? <Layout><OrdersPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/inventory" element={user ? <Layout><InventoryPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/analytics" element={user ? <Layout><AnalyticsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Layout><SettingsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/reports" element={user ? <Layout><ReportsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/alerts" element={user ? <Layout><AlertsPage /></Layout> : <Navigate to="/login" />} />
        <Route path="/users" element={user ? <Layout><UsersPage /></Layout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}