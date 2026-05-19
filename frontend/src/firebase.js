import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase Console'dan alınan gerçek ve doğrulanmış yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyAYswGFqv1lQ1puGbwiGKYnE8VTMXqKl0I",
  authDomain: "smart-etsy-optimizer-2dfaf.firebaseapp.com",
  projectId: "smart-etsy-optimizer-2dfaf",
  storageBucket: "smart-etsy-optimizer-2dfaf.firebasestorage.app",
  messagingSenderId: "307085619549",
  appId: "1:307085619549:web:64325e9f324262c3f3b8b4"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Uygulama içindeki diğer sayfalarda kullanabilmek için dışa aktar
export const db = getFirestore(app);
export const auth = getAuth(app);