const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// 1. Tüm Kullanıcıları Getir (GET /api/users)
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kullanıcılar getirilemedi." });
    }
});

// 2. Yeni Kullanıcı Ekle (POST /api/users)
router.post('/', async (req, res) => {
    try {
        const userData = req.body;
        userData.createdAt = new Date();
        const docRef = await db.collection('users').add(userData);
        res.status(201).json({ id: docRef.id, ...userData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kullanıcı eklenemedi." });
    }
});

// 3. Kullanıcı Yetkilerini Güncelle (PATCH /api/users/:id)
router.patch('/:id', async (req, res) => {
    try {
        const docRef = db.collection('users').doc(req.params.id);
        await docRef.update(req.body);
        res.status(200).json({ message: "Kullanıcı başarıyla güncellendi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kullanıcı güncellenemedi." });
    }
});

// 4. Kullanıcı Sil (DELETE /api/users/:id)
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('users').doc(req.params.id).delete();
        res.status(200).json({ message: "Kullanıcı başarıyla silindi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Kullanıcı silinemedi." });
    }
});

// 5. Admin Profili Getir (GET /api/users/admin_profile)
router.get('/admin_profile', async (req, res) => {
    try {
        const doc = await db.collection('settings').doc('admin_profile').get();
        if (doc.exists) {
            res.status(200).json(doc.data());
        } else {
            // Varsayılan admin profili
            res.status(200).json({
                name: "System Admin",
                email: "admin@etsy-optimizer.com",
                role: "admin"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Admin profili getirilemedi." });
    }
});

// 6. Admin Profili Güncelle (POST /api/users/admin_profile)
router.post('/admin_profile', async (req, res) => {
    try {
        const profileData = req.body;
        profileData.updatedAt = new Date();
        await db.collection('settings').doc('admin_profile').set(profileData, { merge: true });
        res.status(200).json({ message: "Admin profili başarıyla güncellendi!", data: profileData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Admin profili güncellenemedi." });
    }
});

module.exports = router;