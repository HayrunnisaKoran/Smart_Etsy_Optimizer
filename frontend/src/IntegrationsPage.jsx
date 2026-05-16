import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Cable, CheckCircle2, XCircle, RefreshCw, ShoppingBag, Truck, CreditCard, Link2 } from 'lucide-react';

export default function IntegrationsPage() {
  // Entegrasyon durumlarını tutan tek bir merkezi state
  const [integrations, setIntegrations] = useState({
    etsy: true,
    shopify: false,
    amazon: false,
    stripe: false,
    dhl: false
  });

  // Hangi platformun şu an bağlandığını/optimizasyon sürecinde olduğunu tutan animasyon state'i
  const [loadingPlatform, setLoadingPlatform] = useState(null);

  // 1. FIREBASE'DEN BAĞLANTI DURUMLARINI CANLI OKUMA (READ)
  useEffect(() => {
    const docRef = doc(db, "settings", "integrations_config");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIntegrations({
          etsy: data.etsy ?? true,
          shopify: data.shopify ?? false,
          amazon: data.amazon ?? false,
          stripe: data.stripe ?? false,
          dhl: data.dhl ?? false
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. DOĞRUDAN FIREBASE'DE BAĞLANTIYI AÇMA / KAPATMA (WRITE)
  const handleToggleIntegration = (platformId, currentStatus) => {
    setLoadingPlatform(platformId); // Animasyonu başlat

    // Gerçekçi bir API / OAuth token doğrulama süresi simülasyonu (1.2 saniye)
    setTimeout(async () => {
      try {
        const nextStatus = !currentStatus;
        
        // Firestore dökümanını güncelliyoruz
        await setDoc(doc(db, "settings", "integrations_config"), {
          [platformId]: nextStatus
        }, { merge: true });

        alert(`${platformId.toUpperCase()} entegrasyon durumu başarıyla güncellendi!`);
      } catch (err) {
        console.error("Entegrasyon bulut hatası:", err);
        alert("Bağlantı güncellenemedi.");
      } finally {
        setLoadingPlatform(null); // Animasyonu bitir
      }
    }, 1200);
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
          <Cable className="text-[#FF6B00] mr-3" size={32} /> Integrations & Apps
        </h1>
        <p className="text-gray-400 text-sm font-medium mt-1">
          Connect your EtsySync ecosystem with external marketplaces, payment gateways and carriers
        </p>
      </header>

      {/* SEKMELİ KATEGORİ BAŞLIKLARI (Premium Tasarım) */}
      <div className="bg-white rounded-[3rem] border border-gray-50 shadow-sm p-10 space-y-10">
        
        {/* SECTION 1: MARKETPLACES (PAZAR YERLERİ) */}
        <div className="space-y-6">
          <div className="border-b border-gray-50 pb-3">
            <h3 className="font-bold text-lg text-gray-800 flex items-center tracking-tight">
              <ShoppingBag size={18} className="mr-2 text-gray-400" /> E-Commerce Marketplaces
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Ürün ve sipariş senkronizasyonu yapılan pazar yerleri</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* ETSY CARD */}
            <IntegrationCard 
              name="Etsy Marketplace"
              desc="Etsy dükkanınızdaki ürün, stok ve sipariş verilerini gerçek zamanlı NoSQL Firestore mimarisiyle eşitler."
              badge="v3 API Connected"
              logo="E"
              logoBg="bg-orange-50 text-[#FF6B00] border-orange-100"
              isConnected={integrations.etsy}
              isLoading={loadingPlatform === 'etsy'}
              onToggle={() => handleToggleIntegration('etsy', integrations.etsy)}
            />

            {/* SHOPIFY CARD */}
            <IntegrationCard 
              name="Shopify Store"
              desc="Etsy envanterinizi Shopify mağazanıza köprüleyerek çok kanallı (Omnichannel) satış optimizasyonu sağlar."
              badge="GraphQL Webhook"
              logo="S"
              logoBg="bg-green-50 text-green-600 border-green-100"
              isConnected={integrations.shopify}
              isLoading={loadingPlatform === 'shopify'}
              onToggle={() => handleToggleIntegration('shopify', integrations.shopify)}
            />

            {/* AMAZON CARD */}
            <IntegrationCard 
              name="Amazon Seller"
              desc="Amazon FBA veya FBM siparişlerinizi ve kritik stok alarmlarınızı tek bir akıllı panelden yönetmenizi sağlar."
              badge="SP-API Available"
              logo="A"
              logoBg="bg-gray-50 text-gray-800 border-gray-200"
              isConnected={integrations.amazon}
              isLoading={loadingPlatform === 'amazon'}
              onToggle={() => handleToggleIntegration('amazon', integrations.amazon)}
            />

          </div>
        </div>

        {/* SECTION 2: PAYMENTS & SHIPPING (ÖDEME VE KARGO) */}
        <div className="space-y-6">
          <div className="border-b border-gray-50 pb-3">
            <h3 className="font-bold text-lg text-gray-800 flex items-center tracking-tight">
              <CreditCard size={18} className="mr-2 text-gray-400" /> Payments & Fulfillment
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Finansal raporlama ve lojistik entegrasyon ağları</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* STRIPE CARD */}
            <IntegrationCard 
              name="Stripe Financials"
              desc="Etsy Payments dışındaki harici faturalandırma ve ciro analizlerinizi otomatik olarak grafiklere döker."
              badge="Webhooks v2"
              logo="S"
              logoBg="bg-blue-50 text-blue-600 border-blue-100"
              isConnected={integrations.stripe}
              isLoading={loadingPlatform === 'stripe'}
              onToggle={() => handleToggleIntegration('stripe', integrations.stripe)}
            />

            {/* DHL CARD */}
            <IntegrationCard 
              name="DHL Express Cargo"
              desc="Siparişler sayfasında durumu 'Shipped' yaptığınız an otomatik DHL takip kodu (Tracking) üretir."
              badge="REST Logistics"
              logo="D"
              logoBg="bg-amber-50 text-amber-600 border-amber-200"
              isConnected={integrations.dhl}
              isLoading={loadingPlatform === 'dhl'}
              onToggle={() => handleToggleIntegration('dhl', integrations.dhl)}
            />

          </div>
        </div>

      </div>

    </div>
  );
}

// PREMIUM ENTEGRASYON KARTI BİLEŞENİ (Tasarım Detayları Eksiksiz)
const IntegrationCard = ({ name, desc, badge, logo, logoBg, isConnected, isLoading, onToggle }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-64 hover:shadow-md transition-shadow">
    <div>
      {/* Kart Üst Alanı (Logo ve Durum Rozeti) */}
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 ${logoBg} rounded-2xl flex items-center justify-center text-xl font-black border shadow-sm`}>
          {logo}
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
          isConnected ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'
        }`}>
          {isConnected ? 'Active' : 'Available'}
        </span>
      </div>

      {/* Kart Metin Alanı */}
      <h3 className="font-bold text-base text-gray-800 mt-4 tracking-tight">{name}</h3>
      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed line-clamp-3">{desc}</p>
    </div>

    {/* Kart Alt Buton Alanı (OAuth / Bağlantı Tetikleyicisi) */}
    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-mono">
        {badge}
      </span>
      
      <button
        type="button"
        disabled={isLoading}
        onClick={onToggle}
        className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center min-w-[100px] justify-center ${
          isLoading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isConnected
              ? 'bg-gray-50 text-red-500 border border-gray-100 hover:bg-red-50 hover:text-red-600'
              : 'bg-white text-[#FF6B00] border border-orange-100 hover:bg-orange-50/40'
        }`}
      >
        {isLoading ? (
          <RefreshCw size={12} className="animate-spin" />
        ) : isConnected ? (
          'Disconnect'
        ) : (
          'Connect'
        )}
      </button>
    </div>
  </div>
);