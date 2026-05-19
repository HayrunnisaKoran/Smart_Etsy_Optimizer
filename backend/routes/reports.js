const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// 1. Rapor Arşivini Getir (GET /api/reports)
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').get();
        const reports = [];
        snapshot.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Raporlar getirilemedi." });
    }
});

// 2. Yeni Rapor Kaydı Üret (POST /api/reports)
router.post('/', async (req, res) => {
    try {
        const reportData = req.body;
        reportData.createdAt = new Date();
        const docRef = await db.collection('reports').add(reportData);
        res.status(201).json({ id: docRef.id, ...reportData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Rapor oluşturulamadı." });
    }
});

module.exports = router;