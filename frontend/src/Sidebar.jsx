import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom'; // Sayfa geçişleri için
import { 
  LayoutDashboard, ShoppingBag, ClipboardList, Box, 
  BarChart3, FileText, ShieldAlert, Settings, Users, LogOut, X, Save 
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- AKTİF ADMİN PROFİL STATE'LERİ ---
  const [adminName, setAdminName] = useState('Hayrünnisa Koran');
  const [adminEmail, setAdminEmail] = useState('admin@gmail.com');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Profil düzenleme kontrolü
  const [isSaving, setIsSaving] = useState(false);

  // Sol Menü Elemanları (Integrations tamamen silindi, Users duruyor)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'products', label: 'Products', icon: ShoppingBag, path: '/products' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/orders' },
    { id: 'inventory', label: 'Inventory', icon: Box, path: '/inventory' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, path: '/alerts' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'users', label: 'Users', icon: Users, path: '/users' },
  ];

  // 1. ADMİN BİLGİLERİNİ FIREBASE'DEN CANLI OKUMA (READ)
  useEffect(() => {
    const docRef = doc(db, "settings", "admin_profile");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdminName(data.name || 'Hayrünnisa Koran');
        setAdminEmail(data.email || 'admin@gmail.com');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. PROFİL DEĞİŞİKLİKLERİNİ FIREBASE'E KAYDETME (WRITE)
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
      console.error("Profil güncellenirken hata:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Çıkış Simülasyonu
  const handleLogout = () => {
    if (window.confirm("Sistemden çıkış yapmak istediğinize emin misiniz?")) {
      alert("Oturum güvenli bir şekilde kapatıldı.");
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between py-8 shrink-0 select-none">
      
      {/* LOGO ALANI */}
      <div className="px-6 mb-8 flex items-center space-x-3">
        <div className="w-9 h-9 bg-[#FF6B00] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-100">
          E
        </div>
        <span className="text-xl font-black text-gray-900 tracking-tight">EtsySync</span>
      </div>

      {/* MENÜ LİSTESİ */}
      <nav className="flex-1 space-y-1.5 px-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
                isActive 
                  ? 'bg-orange-50/60 text-[#FF6B00]' 
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <Icon size={18} className={`mr-3.5 ${isActive ? 'text-[#FF6B00]' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* --- ALT PROFIL VE LOGOUT ALANI (%100 AKTİF EDİLDİ) --- */}
      <div className="px-4 mt-auto space-y-5 pt-4 border-t border-gray-50">
        
        {/* Logout Butonu */}
        <button 
          type="button" 
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2.5 rounded-xl font-bold text-xs text-gray-400 hover:text-red-500 hover:bg-red-50/40 transition-all text-left"
        >
          <LogOut size={16} className="mr-3" />
          <span>Logout</span>
        </button>

        {/* ETKİLEŞİMLİ PROFİL KARTI (Tıklanınca Modal Açar) */}
        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-gray-50/80 cursor-pointer transition-all border border-transparent hover:border-gray-100 group"
        >
          <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF6B00] font-black text-sm flex items-center justify-center border border-orange-200 shadow-sm shrink-0 transition-transform group-hover:scale-105">
            {adminName ? adminName.charAt(0).toUpperCase() : 'H'}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-black text-gray-800 tracking-tight truncate group-hover:text-[#FF6B00] transition-colors">
              {adminName || 'Hayrünnisa Koran'}
            </h4>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase truncate mt-0.5 font-mono">
              {adminEmail || 'admin@gmail.com'}
            </p>
          </div>
        </div>

      </div>

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
}