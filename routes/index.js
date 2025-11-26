import express from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import serviceRoutes from './service.routes.js';
import workRoutes from './work.routes.js';
import masterRoutes from './master.routes.js';
import productRoutes from './product.routes.js';

const router = express.Router();

// Базовый маршрут для проверки API
router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Beauty Server API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check маршрут
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Подключение маршрутов

// Авторизация (админка)
router.use('/admin', authRoutes);

// Публичные маршруты (для витрины)
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/works', workRoutes);
router.use('/masters', masterRoutes);
router.use('/products', productRoutes);

// Админские маршруты (требуют авторизации)
router.use('/admin/categories', categoryRoutes);
router.use('/admin/services', serviceRoutes);
router.use('/admin/works', workRoutes);
router.use('/admin/masters', masterRoutes);
router.use('/admin/products', productRoutes);

export default router;