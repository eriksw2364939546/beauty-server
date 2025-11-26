import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Логирование
import httpLogger, { 
  requestIdMiddleware, 
  statsMiddleware,
  errorLoggingMiddleware 
} from '../loggers/httpLogger.js';
import logger from '../loggers/logger.js';

import errorHandlerMiddleware from '../middlewares/ErrorHandler.middleware.js';


// Routes
import authRoutes from '../routes/authRoutes.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import serviceRoutes from '../routes/serviceRoutes.js';
import workRoutes from '../routes/workRoutes.js';
import masterRoutes from '../routes/masterRoutes.js';
import productRoutes from '../routes/productRoutes.js';
import indexRoutes from '../routes/index.js';

// Errors
import AppError from '../errors/AppError.js';
import {HTTP_ERRORS} from '../errors/ErrorCodes.js'

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

  // Отключаем X-Powered-By заголовок для безопасности
  app.disable('x-powered-by');

  // Доверяем прокси (важно для получения реального IP)
  app.set('trust proxy', 1);

  // Настройка представлений (если понадобится)
  app.set('view engine', 'html');

  // =============================================================================
  // CORS НАСТРОЙКИ
  // =============================================================================

  const corsOptions = {
    origin: function (origin, callback) {
      // Разрешенные домены
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ];

      // В production добавляем домены из переменных окружения
      if (process.env.NODE_ENV === 'production') {
        const productionOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
        allowedOrigins.push(...productionOrigins);
      }

      // В development разрешаем все localhost порты
      if (process.env.NODE_ENV === 'development') {
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          return callback(null, true);
        }
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.security('CORS violation attempt', { 
          origin, 
          allowedOrigins 
        });
        callback(new AppError('CORS policy violation', 403, 'CORS_VIOLATION'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With', 
      'Content-Type', 
      'Accept', 
      'Authorization',
      'X-Request-ID'
    ],
    credentials: true, // Разрешаем отправку cookies
    optionsSuccessStatus: 200, // Для старых браузеров
    maxAge: 86400 // Кешируем preflight запросы на 24 часа
  };

  app.use(cors(corsOptions));

  // =============================================================================
  // ПАРСИНГ ТЕЛА ЗАПРОСОВ
  // =============================================================================

  // JSON парсер с ограничением размера
  app.use(express.json({ 
    limit: process.env.JSON_LIMIT || '10mb',
    strict: true,
    type: 'application/json'
  }));

  // URL-encoded парсер
  app.use(express.urlencoded({ 
    extended: true, 
    limit: process.env.URL_ENCODED_LIMIT || '10mb',
    type: 'application/x-www-form-urlencoded'
  }));

  // Обработка raw данных (если нужно)
  app.use(express.raw({
    limit: process.env.RAW_LIMIT || '50mb',
    type: 'application/octet-stream'
  }));

  // =============================================================================
  // ЛОГИРОВАНИЕ И МОНИТОРИНГ
  // =============================================================================

  // Уникальный ID для каждого запроса
  app.use(requestIdMiddleware);

  // HTTP логирование
  app.use(httpLogger);

  // Сбор статистики запросов
  app.use(statsMiddleware);

  // =============================================================================
  // СТАТИЧНЫЕ ФАЙЛЫ
  // =============================================================================

  // Обслуживание загруженных файлов
  app.use('/uploads', express.static(
    path.join(__dirname, '../public/uploads'), 
    {
      maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Устанавливаем правильные MIME типы для изображений
        if (path.endsWith('.webp')) {
          res.setHeader('Content-Type', 'image/webp');
        }
        
        // Безопасность для загруженных файлов
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
      }
    }
  ));

  // =============================================================================
  // ДОПОЛНИТЕЛЬНЫЕ ЗАГОЛОВКИ БЕЗОПАСНОСТИ
  // =============================================================================

  app.use((req, res, next) => {
    // Основные заголовки безопасности
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy (базовый)
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      "font-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'"
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    next();
  });

  // =============================================================================
  // HEALTH CHECK И СИСТЕМНЫЕ МАРШРУТЫ
  // =============================================================================

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const { checkDatabaseHealth, getDatabaseStats } = await import('../config/database.js');
      
      const [dbHealth, dbStats] = await Promise.all([
        checkDatabaseHealth(),
        getDatabaseStats().catch(() => ({ error: 'Stats unavailable' }))
      ]);

      const { HttpStats } = await import('../loggers/httpLogger.js');
      
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        database: dbHealth,
        server: {
          memory: process.memoryUsage(),
          pid: process.pid,
          platform: process.platform,
          nodeVersion: process.version
        },
        stats: HttpStats.getStats()
      };

      // Определяем общий статус
      const overallStatus = dbHealth.status === 'healthy' ? 'healthy' : 'degraded';
      const statusCode = overallStatus === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        ...healthData,
        status: overallStatus
      });
      
    } catch (error) {
      logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // Информация о сервере
  app.get('/api/info', (req, res) => {
    res.json({
      name: 'Beauty Server API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/admin/*',
        categories: '/api/categories/*',
        services: '/api/services/*',
        works: '/api/works/*',
        masters: '/api/masters/*',
        products: '/api/products/*',
        health: '/api/health',
        docs: '/api/docs'
      }
    });
  });

  // =============================================================================
  // API МАРШРУТЫ
  // =============================================================================

  // Основные маршруты API
  app.use('/api', indexRoutes);
  app.use('/api/admin', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/works', workRoutes);
  app.use('/api/masters', masterRoutes);
  app.use('/api/products', productRoutes);

  // =============================================================================
  // ОБРАБОТКА ОШИБОК 404
  // =============================================================================

  // Обработчик для несуществующих маршрутов
  app.all('*', (req, res, next) => {
    logger.warn('Route not found', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const error = AppError.notFound(
      `Маршрут ${req.method} ${req.originalUrl} не найден`,
      'ROUTE_NOT_FOUND'
    );
    
    next(error);
  });

  // =============================================================================
  // MIDDLEWARE ОБРАБОТКИ ОШИБОК
  // =============================================================================

  // Логирование ошибок
  app.use(errorLoggingMiddleware);

  // Основной обработчик ошибок (должен быть последним!)
  app.use(errorHandlerMiddleware);

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
        host: '0.0.0.0', // Слушаем все интерфейсы в production
        logging: {
          level: 'warn',
          enableConsole: false,
          enableFile: true
        }
      };
    
    case 'development':
      return {
        ...baseConfig,
        logging: {
          level: 'debug',
          enableConsole: true,
          enableFile: process.env.ENABLE_FILE_LOGS === 'true'
        }
      };
    
    case 'test':
      return {
        ...baseConfig,
        port: parseInt(process.env.TEST_PORT) || 3001,
        logging: {
          level: 'error',
          enableConsole: false,
          enableFile: false
        }
      };
    
    default:
      return baseConfig;
  }
};

/**
 * Функция для graceful shutdown
 */
export const setupGracefulShutdown = (server) => {
  const gracefulShutdown = (signal) => {
    logger.system(`Received ${signal}, shutting down gracefully...`);
    
    server.close(async () => {
      logger.system('HTTP server closed');
      
      try {
        // Закрываем подключение к БД
        const { disconnectDatabase } = await import('../config/database.js');
        await disconnectDatabase();
        
        logger.system('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', { 
          error: error.message 
        });
        process.exit(1);
      }
    });

    // Принудительное завершение через 30 секунд
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  };

  // Обработчики сигналов
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Обработка неперехваченных ошибок
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { 
      error: error.message, 
      stack: error.stack 
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { 
      reason: reason?.toString(), 
      promise: promise?.toString() 
    });
    process.exit(1);
  });
};

/**
 * Middleware для проверки готовности приложения
 */
export const readinessMiddleware = (req, res, next) => {
  // Проверяем готовность критических сервисов
  const { checkDatabaseConnection } = require('../config/database.js');
  const dbStatus = checkDatabaseConnection();
  
  if (!dbStatus.isConnected) {
    return res.status(503).json({
      ok: false,
      error: {
        message: 'Сервис не готов',
        code: 'SERVICE_NOT_READY',
        details: { database: 'disconnected' }
      }
    });
  }
  
  next();
};

export default createApp;
