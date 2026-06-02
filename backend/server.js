require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const path = require('path');

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const siteConfigRoutes = require('./routes/site_config');
const statsRoutes = require('./routes/stats');
const categoriesRoutes = require('./routes/categories');
const addressRoutes = require('./routes/addresses');
const branchRoutes = require('./routes/branches');

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/site-config', siteConfigRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/branches', branchRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Stella Mobiles API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
