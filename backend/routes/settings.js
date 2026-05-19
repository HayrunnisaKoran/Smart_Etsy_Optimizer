const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// 1. Ayarları Getir (GET /api/settings)
router.get('/', async (req, res) => {
    try {
        const docRef = db.collection('settings').doc('store_config');
        const doc = await docRef.get();
        if (!doc.exists) return res.status(200).json({});
        res.status(200).json(doc.data());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ayarlar getirilirken hata oluştu." });
    }
});

// 2. Ayarları Güncelle/Kaydet (POST /api/settings)
router.post('/', async (req, res) => {
    try {
        const docRef = db.collection('settings').doc('store_config');
        await docRef.set(req.body, { merge: true });
        res.status(200).json({ message: "Ayarlar başarıyla güncellendi!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ayarlar kaydedilirken hata oluştu." });
    }
});

// 3. Entegrasyon Ayarlarını Getir (GET /api/settings/integrations)
router.get('/integrations', async (req, res) => {
    try {
        const docRef = db.collection('settings').doc('integrations_config');
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(200).json({
                etsy: true,
                shopify: false,
                amazon: false,
                stripe: false,
                dhl: false
            });
        }
        res.status(200).json(doc.data());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Entegrasyon ayarları getirilirken hata oluştu." });
    }
});

// 4. Entegrasyon Ayarlarını Güncelle (POST /api/settings/integrations)
router.post('/integrations', async (req, res) => {
    try {
        const docRef = db.collection('settings').doc('integrations_config');
        await docRef.set(req.body, { merge: true });
        res.status(200).json({ message: "Entegrasyon ayarları başarıyla güncellendi!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Entegrasyon ayarları güncellenirken hata oluştu." });
    }
});

module.exports = router;