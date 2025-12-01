import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Логирование
import httpLogger, {
  requestIdMiddleware,
  statsMiddleware,
  errorLoggingMiddleware
} from '../loggers/httpLogger.js';
import logger from '../loggers/logger.js';

// Middlewares
import authMiddleware from '../middlewares/Auth.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import ErrorHandlerMiddleware from '../middlewares/ErrorHandler.middleware.js';

// Routes
import authRoutes from '../routes/auth.routes.js';
import categoryRoutes from '../routes/category.routes.js';
import serviceRoutes from '../routes/service.routes.js';
import workRoutes from '../routes/work.routes.js';
import masterRoutes from '../routes/master.routes.js';
import productRoutes from '../routes/product.routes.js';
import priceRoutes from '../routes/price.routes.js';
import indexRoutes from '../routes/index.js';

// Errors
import AppError from '../errors/AppError.js';

// Database
import database from './database.js';

// Получение __dirname в ES6 модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Создание и конфигурация Express приложения
 */
const createApp = () => {
  const app = express();

  // =============================================================================
  // БЕЗОПАСНОСТЬ И БАЗОВЫЕ НАСТРОЙКИ
  // =============================================================================

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // =============================================================================
  // CORS НАСТРОЙКИ
  // =============================================================================

  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5173'
      ];

      if (process.env.NODE_ENV === 'production') {
        const productionOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        allowedOrigins.push(...productionOrigins);
      }

      if (process.env.NODE_ENV === 'development') {
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS violation attempt', { origin });
        callback(new Error('CORS policy violation'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  };

  app.use(cors(corsOptions));

  // =============================================================================
  // БАЗОВЫЕ MIDDLEWARE
  // =============================================================================

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // =============================================================================
  // ЛОГИРОВАНИЕ И МЕТРИКИ
  // =============================================================================

  app.use(requestIdMiddleware);
  app.use(httpLogger);
  app.use(statsMiddleware);

  // =============================================================================
  // СТАТИЧЕСКИЕ ФАЙЛЫ
  // =============================================================================

  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  app.use('/uploads', express.static(path.join(publicPath, 'uploads')));

  // =============================================================================
  // СЛУЖЕБНЫЕ МАРШРУТЫ
  // =============================================================================

  app.get('/api/health', async (req, res) => {
    try {
      const dbHealth = await database.healthCheck();

      const healthData = {
        status: dbHealth.status === 'healthy' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: dbHealth,
        server: {
          memory: process.memoryUsage(),
          pid: process.pid,
          nodeVersion: process.version
        }
      };

      const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthData);

    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  app.get('/api/info', (req, res) => {
    res.json({
      name: 'Beauty Server API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  // =============================================================================
  // API МАРШРУТЫ
  // =============================================================================

  app.use('/api', indexRoutes);
  app.use('/api/admin', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/works', workRoutes);
  app.use('/api/masters', masterRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/prices', priceRoutes);

  // Админские маршруты (с префиксом /api/admin)
  app.use('/api/admin/categories', categoryRoutes);
  app.use('/api/admin/services', serviceRoutes);
  app.use('/api/admin/works', workRoutes);
  app.use('/api/admin/masters', masterRoutes);
  app.use('/api/admin/products', productRoutes);
  app.use('/api/admin/prices', priceRoutes);

  // =============================================================================
  // ОБРАБОТКА ОШИБОК 404
  // =============================================================================

  app.use((req, res, next) => {
    logger.warn('Route not found', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });

    res.status(404).json({
      ok: false,
      error: 'not_found',
      message: `Маршрут ${req.method} ${req.originalUrl} не найден`
    });
  });

  // =============================================================================
  // MIDDLEWARE ОБРАБОТКИ ОШИБОК
  // =============================================================================

  app.use(errorLoggingMiddleware);
  app.use(ErrorHandlerMiddleware.handle);

  return app;
};

/**
 * Конфигурация для разных окружений
 */
export const getAppConfig = () => {
  const baseConfig = {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  };

  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        ...baseConfig,
        port: parseInt(process.env.PORT) || 80,
        host: '0.0.0.0'
      };

    case 'test':
      return {
        ...baseConfig,
        port: parseInt(process.env.PORT) || 3001
      };

    default:
      return baseConfig;
  }
};

/**
 * Настройка graceful shutdown
 */
export const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    logger.info(`${signal} received, starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await database.disconnect();
        logger.info('Database connection closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
      }
    });

    // Форсированное завершение через 30 секунд
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

export default createApp;