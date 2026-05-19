const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// 1. Tüm Ürünleri Getir (GET /api/products)
router.get('/', async (req, res) => {
    try {
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();
        
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ürünler getirilirken bir hata oluştu." });
    }
});

// 2. Tek Bir Ürünün Detayını Getir (GET /api/products/:id)
router.get('/:id', async (req, res) => {
    try {
        const productRef = db.collection('products').doc(req.params.id);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Ürün bulunamadı." });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ürün detayı getirilirken hata oluştu." });
    }
});

// 3. Yeni Ürün Ekle (POST /api/products)
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        productData.createdAt = new Date(); 
        productData.status = productData.stock > 0 ? "In Stock" : "Out of Stock";
        
        const docRef = await db.collection('products').add(productData);
        res.status(201).json({ id: docRef.id, message: "Ürün başarıyla eklendi!", ...productData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ürün eklenirken bir hata oluştu." });
    }
});

// 4. Ürün Stoğunu ve Durumunu Güncelleme (PATCH /api/products/:id)
router.patch('/:id', async (req, res) => {
    try {
        const productId = req.params.id; 
        const { stock } = req.body; 

        const productRef = db.collection('products').doc(productId);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Güncellenmek istenen ürün bulunamadı." });
        }

        const productData = doc.data();
        let newStatus = "In Stock";

        if (stock === 0) {
            newStatus = "Out of Stock";
        } else if (stock < (productData.threshold || 5)) { 
            newStatus = "Low Stock";
        }

        await productRef.update({
            stock: Number(stock),
            status: newStatus,
            updatedAt: new Date()
        });

        res.json({ 
            message: "Stok ve ürün durumu başarıyla güncellendi", 
            id: productId, 
            newStock: stock, 
            status: newStatus 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Stok güncellenirken bir hata oluştu." });
    }
});

// 5. Ürünü Sil (DELETE /api/products/:id)
router.delete('/:id', async (req, res) => {
    try {
        const productRef = db.collection('products').doc(req.params.id);
        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Silinmek istenen ürün bulunamadı." });
        }

        await productRef.delete();
        res.status(200).json({ message: "Ürün başarıyla veritabanından silindi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ürün silinirken bir hata oluştu." });
    }
});

module.exports = router;