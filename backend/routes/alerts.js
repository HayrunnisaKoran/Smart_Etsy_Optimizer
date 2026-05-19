const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Kritik stok seviyesindeki ürünleri ayıklayan akıllı algoritma kapısı
router.get('/', async (req, res) => {
    try {
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();
        
        const alerts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const stock = Number(data.stock || 0);
            const threshold = Number(data.threshold || (Number(data.price) > 30 ? 5 : 10));
            
            // Stok eşik değerine eşit veya küçükse listeye ekle
            if (stock <= threshold) {
                alerts.push({ id: doc.id, ...data, stock, threshold });
            }
        });
        
        res.status(200).json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kritik stok uyarısı hesaplanırken hata oluştu." });
    }
});

module.exports = router;