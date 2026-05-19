const express = require('express');
const router = express.Router();
const { fetchEtsySalesData, updateEtsyInventory } = require('../services/etsyService');

// GET /api/etsy/sales/fetch - Satış verisi çek (1. Fonksiyonu tetikler)
router.get('/sales/fetch', async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Tarihleri URL'den al
        
        // Şimdilik tarih filtrelemesini serviste yapmadık, ama parametreleri gönderiyoruz
        const data = await fetchEtsySalesData(startDate, endDate);
        
        res.status(200).json({
            message: "Satış verileri başarıyla çekildi",
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: "Veri çekilirken hata oluştu." });
    }
});

// POST /api/etsy/inventory/update - Stok güncelle (2. Fonksiyonu tetikler)
router.post('/inventory/update', async (req, res) => {
    try {
        const inventoryArray = req.body; // Güncellenecek stok dizisi
        
        if (!Array.isArray(inventoryArray)) {
            return res.status(400).json({ error: "Geçersiz veri formatı. Dizi bekleniyor." });
        }

        const result = await updateEtsyInventory(inventoryArray);
        
        res.status(200).json({
            message: "Stok güncelleme işlemi tamamlandı",
            result: result
        });
    } catch (error) {
        res.status(500).json({ error: "Stok güncellenirken hata oluştu." });
    }
});

module.exports = router;