const admin = require('firebase-admin');
// İndirdiğin gizli anahtar dosyasını projeye dahil ediyoruz
const serviceAccount = require('./serviceAccountKey.json');

// Firebase Admin SDK'yı başlatıyoruz
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Veritabanı (Firestore) objesini oluşturuyoruz
const db = admin.firestore();

// Diğer dosyalarda kullanabilmek için dışarı aktarıyoruz
module.exports = { admin, db };