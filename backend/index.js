require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const productsRoute = require('./routes/products');
const ordersRoute = require('./routes/orders');
const etsyRoute = require('./routes/etsy');
const settingsRoute = require('./routes/settings');
const reportsRoute = require('./routes/reports');
const usersRoute = require('./routes/users');
const alertsRoute = require('./routes/alerts'); // Yeni eklendi

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*'
}));
app.use(express.json());

app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/etsy', etsyRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/users', usersRoute);
app.use('/api/alerts', alertsRoute); // Yeni eklendi

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 [Sunucu] ${PORT} portu üzerinde aktif durumda.`);
});