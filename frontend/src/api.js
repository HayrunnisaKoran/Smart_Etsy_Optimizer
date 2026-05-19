import axios from 'axios';

// Vite ortam değişkenlerini kullanarak URL'i dinamik yapıyoruz. 
// Canlı sunucuya (Vercel vb.) yüklediğinde oradaki URL'i otomatik alır.
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default API;