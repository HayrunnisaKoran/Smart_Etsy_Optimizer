import React, { useState, useEffect } from 'react';
import { Store, Sliders, Bell, Key, Shield, Save, Check, Globe, ShieldAlert, Radio, HelpCircle } from 'lucide-react';
import API from './api'; // Kendi yazdığımız API bağlandı
import { auth } from './firebase'; // Firebase Auth entegrasyonu sağlandı

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  // --- 1. GENERAL TAB STATE ---
  const [storeName, setStoreName] = useState('');
  const [storeURL, setStoreURL] = useState('');
  const [timezone, setTimezone] = useState('(UTC+03:00) Istanbul');
  const [autoSyncOrders, setAutoSyncOrders] = useState(true);
  const [autoUpdateInventory, setAutoUpdateInventory] = useState(true);
  const [lowStockNotifications, setLowStockNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  // --- 2. STORE SETTINGS TAB STATE ---
  const [shopStatus, setShopStatus] = useState('Active');
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [processingTime, setProcessingTime] = useState('1-3 Business Days');

  // --- 3. NOTIFICATIONS TAB STATE ---
  const [browserPush, setBrowserPush] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // --- 4. API SETTINGS TAB STATE ---
  const [etsyApiKey, setEtsyApiKey] = useState('');
  const [etsyApiSecret, setEtsyApiSecret] = useState('');
  const [apiStatus, setApiStatus] = useState('Connected');

  // --- 5. SECURITY TAB STATE ---
  // DİNAMİK SABİTLEME: Başlangıç değeri el yazısı yerine direkt aktif oturuma bağlandı
  const [accountEmail, setAccountEmail] = useState(auth.currentUser?.email || 'admin@gmail.com');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // BACKEND API ÜZERİNDEN AYARLARI OKUMA
  const fetchSettings = async () => {
    try {
      const response = await API.get('/settings');
      if (response.data) {
        const data = response.data;
        setStoreName(data.storeName || '');
        setStoreURL(data.storeURL || '');
        setTimezone(data.timezone || '(UTC+03:00) Istanbul');
        setAutoSyncOrders(data.autoSyncOrders ?? true);
        setAutoUpdateInventory(data.autoUpdateInventory ?? true);
        setLowStockNotifications(data.lowStockNotifications ?? true);
        setEmailNotifications(data.emailNotifications ?? false);
        setShopStatus(data.shopStatus || 'Active');
        setPrimaryCurrency(data.primaryCurrency || 'USD');
        setProcessingTime(data.processingTime || '1-3 Business Days');
        setBrowserPush(data.browserPush ?? true);
        setSoundAlerts(data.soundAlerts ?? true);
        setWeeklyDigest(data.weeklyDigest ?? false);
        setEtsyApiKey(data.etsyApiKey || '');
        setEtsyApiSecret(data.etsyApiSecret || '');
        setApiStatus(data.apiStatus || 'Connected');
        // Veritabanı boş dönse dahi aktif kullanıcının mail adresi ezilmez
        setAccountEmail(data.accountEmail || auth.currentUser?.email || 'admin@gmail.com');
        setTwoFactorAuth(data.twoFactorAuth ?? false);
      }
    } catch (err) {
      console.error("Ayarlar yüklenirken hata:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // TÜM DEĞİŞİKLİKLERİ BACKEND API ÜZERİNDEN BULUTA KAYDETME
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('Tüm ayarlar buluta işleniyor...');

    try {
      await API.post('/settings', {
        storeName, storeURL, timezone,
        autoSyncOrders, autoUpdateInventory, lowStockNotifications, emailNotifications,
        shopStatus, primaryCurrency, processingTime,
        browserPush, soundAlerts, weeklyDigest,
        etsyApiKey, etsyApiSecret, apiStatus,
        accountEmail, twoFactorAuth
      });

      setSaveMessage('Tüm sekmeler başarıyla kaydedildi! ✅');
      setTimeout(() => setSaveMessage(''), 2500);
    } catch (err) {
      console.error(err);
      setSaveMessage('Hata oluştu!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Manage your whole ecosystem configurations from cloud</p>
        </div>
        <div className="flex items-center space-x-4">
          {saveMessage && (
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-4 py-2.5 rounded-xl border border-orange-100 animate-pulse">
              {saveMessage}
            </span>
          )}
          <button 
            type="submit" 
            form="unified-settings-form"
            disabled={isSaving}
            className="bg-[#FF6B00] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-100 flex items-center hover:bg-[#e66000] transition-all disabled:opacity-70"
          >
            <Save size={14} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="border-b border-gray-100 flex space-x-6 text-sm font-bold text-gray-400">
        <TabButton label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
        <TabButton label="Store Settings" active={activeTab === 'store'} onClick={() => setActiveTab('store')} />
        <TabButton label="Notifications" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        <TabButton label="API Settings" active={activeTab === 'api'} onClick={() => setActiveTab('api')} />
        <TabButton label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm p-10 min-h-[400px]">
        <form id="unified-settings-form" onSubmit={handleSaveChanges}>
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-200">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center mb-2"><Store size={18} className="mr-2 text-gray-400" /> Store Information</h3>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Name</label>
                  <input type="text" required placeholder="e.g. My Etsy Store" className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-orange-500/10 text-gray-700" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store URL</label>
                  <input type="url" required placeholder="https://www.etsy.com/shop/mystore" className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-orange-500/10 text-gray-700" value={storeURL} onChange={(e) => setStoreURL(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"><Globe size={12} className="mr-1"/> Timezone</label>
                  <select className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-700 cursor-pointer" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    <option value="(UTC+03:00) Istanbul">(UTC+03:00) Istanbul</option>
                    <option value="(UTC+00:00) London">(UTC+00:00) London</option>
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center mb-2"><Sliders size={18} className="mr-2 text-gray-400" /> Preferences</h3>
                <ToggleItem label="Auto sync orders" checked={autoSyncOrders} onChange={() => setAutoSyncOrders(!autoSyncOrders)} />
                <ToggleItem label="Auto update inventory" checked={autoUpdateInventory} onChange={() => setAutoUpdateInventory(!autoUpdateInventory)} />
                <ToggleItem label="Low stock notifications" checked={lowStockNotifications} onChange={() => setLowStockNotifications(!lowStockNotifications)} />
                <ToggleItem label="Email notifications" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
              </div>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-200">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><Store size={18} className="mr-2 text-gray-400" /> Mağaza İşleyiş Ayarları</h3>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Shop Status</label>
                  <select className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-700" value={shopStatus} onChange={(e) => setShopStatus(e.target.value)}>
                    <option value="Active">Open / Active</option>
                    <option value="Vacation">Vacation Mode</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Currency</label>
                  <select className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-700" value={primaryCurrency} onChange={(e) => setPrimaryCurrency(e.target.value)}>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="TRY">TRY (₺) - Türk Lirası</option>
                  </select>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><Radio size={18} className="mr-2 text-gray-400" /> Tedarik & Gönderim</h3>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Processing Time</label>
                  <select className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-700" value={processingTime} onChange={(e) => setProcessingTime(e.target.value)}>
                    <option value="1-3 Business Days">1-3 Business Days</option>
                    <option value="3-5 Business Days">3-5 Business Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-xl space-y-6 animate-in fade-in duration-200">
              <h3 className="font-bold text-lg text-gray-800 flex items-center mb-2"><Bell size={18} className="mr-2 text-gray-400" /> Bildirim Kanalları</h3>
              <ToggleItem label="Browser Push Notifications (Anlık Sipariş Uyarıları)" checked={browserPush} onChange={() => setBrowserPush(!browserPush)} />
              <ToggleItem label="Kritik Sesli Uyarılar (Stok Tükenme Alarmları)" checked={soundAlerts} onChange={() => setSoundAlerts(!soundAlerts)} />
              <ToggleItem label="Haftalık Performans Özeti E-postası (Weekly Digest)" checked={weeklyDigest} onChange={() => setWeeklyDigest(!weeklyDigest)} />
            </div>
          )}

          {activeTab === 'api' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-200">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><Key size={18} className="mr-2 text-gray-400" /> Etsy API Credentials</h3>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Etsy Keystring (API Key)</label>
                  <input type="password" placeholder="v3_api_key_xxxxxxxx" className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-mono text-sm focus:ring-4 focus:ring-orange-500/10 text-gray-700" value={etsyApiKey} onChange={(e) => setEtsyApiKey(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Etsy Shared Secret</label>
                  <input type="password" placeholder="secret_xxxxxxx" className="mt-2 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-mono text-sm focus:ring-4 focus:ring-orange-500/10 text-gray-700" value={etsyApiSecret} onChange={(e) => setEtsyApiSecret(e.target.value)} />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><ShieldAlert size={18} className="mr-2 text-gray-400" /> Bağlantı Durumu</h3>
                <div className="p-6 border border-orange-100 bg-orange-50/20 rounded-[2rem] flex flex-col justify-between h-44">
                  <div>
                    <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                      API {apiStatus}
                    </span>
                    <p className="text-xs text-gray-400 font-medium mt-3 leading-relaxed">
                      Sisteminiz şu an simüle edilmiş Etsy API V3 protokolü üzerinden NoSQL Firestore kümesine veri akışı gerçekleştirmektedir.
                    </p>
                  </div>
                  <button type="button" onClick={() => setApiStatus(apiStatus === 'Connected' ? 'Disconnected' : 'Connected')} className="text-xs font-bold text-[#FF6B00] text-left underline">
                    {apiStatus === 'Connected' ? 'Bağlantıyı Kes' : 'API Yeniden Bağla'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-200">
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><Shield size={18} className="mr-2 text-gray-400" /> Hesap Güvenliği</h3>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                  <input type="email" disabled className="mt-2 w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl outline-none font-bold text-sm text-gray-400 cursor-not-allowed" value={accountEmail} />
                </div>
                <ToggleItem label="Two-Factor Authentication (2FA)" checked={twoFactorAuth} onChange={() => setTwoFactorAuth(!twoFactorAuth)} />
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-gray-800 flex items-center"><HelpCircle size={18} className="mr-2 text-gray-400" /> Şifre Değiştir</h3>
                <input type="password" placeholder="Current Password" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" />
                <input type="password" placeholder="New Password" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm" />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const TabButton = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} className={`pb-4 border-b-2 transition-all duration-200 outline-none ${active ? 'border-[#FF6B00] text-[#FF6B00]' : 'border-transparent hover:text-gray-600'}`}>
    {label}
  </button>
);

const ToggleItem = ({ label, checked, onChange }) => (
  <div className="flex justify-between items-center bg-gray-50/50 border border-gray-100 p-4 rounded-2xl transition-colors hover:bg-gray-50">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${checked ? 'bg-[#FF6B00]' : 'bg-gray-200'}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);