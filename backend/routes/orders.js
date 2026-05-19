const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// 1. Tüm Siparişleri Getir (GET /api/orders)
router.get('/', async (req, res) => {
    try {
        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef.get();
        
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Siparişler getirilirken bir hata oluştu." });
    }
});

// 2. Tek Bir Siparişin Detayını Getir (GET /api/orders/:id)
router.get('/:id', async (req, res) => {
    try {
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Sipariş bulunamadı." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sipariş detayı getirilirken hata oluştu." });
    }
});

// 3. Yeni Sipariş Ekle (POST /api/orders) - [KRİTİK TARİH DÜZELTMESİ BURADA]
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        
        // EĞER SİSTEME DIŞARIDAN VEYA ETSY'DEN GEÇMİŞ BİR TARİH GELDİYSE ONU KORU, YOKSA BUGÜNÜ AL!
        orderData.timestamp = orderData.timestamp ? new Date(orderData.timestamp) : new Date(); 
        
        const docRef = await db.collection('orders').add(orderData);
        res.status(201).json({ id: docRef.id, message: "Sipariş başarıyla eklendi!", ...orderData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sipariş eklenirken bir hata oluştu." });
    }
});

// 4. Sipariş Durumunu Güncelle (PATCH /api/orders/:id/status)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // pending, completed, shipped, cancelled durumları
        const orderRef = db.collection('orders').doc(req.params.id);
        
        const doc = await orderRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: "Sipariş bulunamadı." });
        }

        await orderRef.update({
            status: status,
            updatedAt: new Date()
        });

        res.status(200).json({ message: "Sipariş durumu başarıyla güncellendi.", id: req.params.id, status: status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Sipariş durumu güncellenirken hata oluştu." });
    }
});

module.exports = router;