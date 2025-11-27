
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AuthService from './services/AuthService.js';
// Загружаем переменные окружения как можно раньше
dotenv.config();

// Импорты после загрузки .env
import logger from './loggers/logger.js';
import createApp, { setupGracefulShutdown, getAppConfig } from './config/app.js';
import database from './config/database.js';
import { 
  APP_CONFIG, 
  CURRENT_ENV, 
  ENVIRONMENTS,
  isProduction,
  isDevelopment 
} from './config/constants.js';

// Получение __dirname в ES6 модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Проверка критических переменных окружения
 */
const validateEnvironment = () => {
  const requiredEnvVars = [
    'MONGO_DB',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error('Missing required environment variables', {
      missing: missingVars,
      type: 'ENVIRONMENT_VALIDATION_FAILED'
    });
    
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    
    process.exit(1);
  }

  // Предупреждения для development
  if (isDevelopment()) {
    const optionalVars = ['JWT_REFRESH_SECRET', 'ALLOWED_ORIGINS'];
    const missingOptional = optionalVars.filter(varName => !process.env[varName]);
    
    if (missingOptional.length > 0) {
      logger.warn('Missing optional environment variables', {
        missing: missingOptional,
        environment: CURRENT_ENV
      });
    }
  }

  // Проверки для production
  if (isProduction()) {
    const productionVars = ['JWT_REFRESH_SECRET', 'ALLOWED_ORIGINS'];
    const missingProdVars = productionVars.filter(varName => !process.env[varName]);
    
    if (missingProdVars.length > 0) {
      logger.warn('Missing recommended production variables', {
        missing: missingProdVars,
        type: 'PRODUCTION_CONFIG_WARNING'
      });
    }

    // Проверка безопасности JWT секретов
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      logger.warn('JWT_SECRET should be at least 32 characters for security');
    }
  }
};

/**
 * Создание необходимых папок
 */
const createDirectories = async () => {
  const fs = await import('fs');
  const { promisify } = await import('util');
  const mkdir = promisify(fs.mkdir);
  
  const directories = [
    'public',
    'public/uploads',
    'public/uploads/categories',
    'public/uploads/services', 
    'public/uploads/works',
    'public/uploads/masters',
    'public/uploads/products',
    'public/uploads/temp',
    'logs'
  ];

  try {
    for (const dir of directories) {
      const dirPath = path.join(__dirname, dir);
      
      if (!fs.existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
        logger.file(`Created directory: ${dir}`);
      }
    }
    
    logger.system('All required directories verified/created');
    
  } catch (error) {
    logger.error('Failed to create directories', {
      error: error.message,
      type: 'DIRECTORY_CREATION_FAILED'
    });
    throw error;
  }
};

/**
 * Проверка состояния системы при запуске
 */
const performSystemChecks = () => {
  const checks = {
    nodeVersion: process.version,
    platform: process.platform,
    environment: CURRENT_ENV,
    workingDirectory: process.cwd(),
    processId: process.pid,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };

  logger.system('System checks completed', checks);

  // Проверка версии Node.js
  const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
  if (nodeVersion < 16) {
    logger.warn('Node.js version may be outdated', {
      current: process.version,
      recommended: '16.0.0+'
    });
  }

  return checks;
};

/**
 * Настройка обработчиков процесса
 */
const setupProcessHandlers = () => {
  // Увеличиваем лимит слушателей событий
  process.setMaxListeners(20);

  // Обработка предупреждений Node.js
  process.on('warning', (warning) => {
    logger.warn('Node.js warning', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack
    });
  });

  // Мониторинг памяти (каждые 30 секунд в production)
  if (isProduction()) {
    const memoryCheckInterval = setInterval(() => {
      const memory = process.memoryUsage();
      const memoryMB = {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024)
      };
      
      // Предупреждение при высоком потреблении памяти
      if (memoryMB.rss > 500) {
        logger.warn('High memory usage detected', {
          memory: memoryMB,
          type: 'MEMORY_WARNING'
        });
      }
      
      logger.debug('Memory usage check', { memory: memoryMB });
    }, 30000);

    // Очистка интервала при завершении
    process.on('beforeExit', () => {
      clearInterval(memoryCheckInterval);
    });
  }
};

/**
 * Отображение информации о запуске
 */
const displayStartupInfo = (config, server) => {
  const serverInfo = {
    name: APP_CONFIG.NAME,
    version: APP_CONFIG.VERSION,
    environment: CURRENT_ENV,
    port: config.port,
    host: config.host,
    processId: process.pid,
    nodeVersion: process.version
  };

  // Красивый вывод в консоль ВСЕГДА
  console.log('\n🚀 Beauty Server запущен!');
  console.log('═'.repeat(50));
  console.log(`📱 Приложение: ${serverInfo.name} v${serverInfo.version}`);
  console.log(`🌍 Окружение: ${serverInfo.environment}`);
  console.log(`🔗 URL: http://${serverInfo.host}:${serverInfo.port}`);
  console.log(`📊 Health Check: http://${serverInfo.host}:${serverInfo.port}/api/health`);
  console.log(`📋 Info: http://${serverInfo.host}:${serverInfo.port}/api/info`);
  console.log(`🆔 Process ID: ${serverInfo.processId}`);
  console.log(`⚡ Node.js: ${serverInfo.nodeVersion}`);
  console.log('═'.repeat(50));
  console.log('📝 Логи: смотрите в консоли и папке logs/');
  console.log('🛑 Остановка: Ctrl+C');
  console.log('');

  logger.system('Server started successfully', serverInfo);
};

/**
 * Обработка ошибок запуска
 */
const handleStartupError = (error, phase) => {
  logger.error(`Startup failed during ${phase}`, {
    error: error.message,
    stack: error.stack,
    phase,
    type: 'STARTUP_FAILED'
  });

  console.error(`\n❌ Ошибка запуска на этапе: ${phase}`);
  console.error(`Детали: ${error.message}`);
  
  if (isDevelopment()) {
    console.error('\nСтек ошибки:');
    console.error(error.stack);
  }
  
  console.error('\n🔍 Проверьте:');
  console.error('  - Переменные окружения в .env файле');
  console.error('  - Подключение к MongoDB');
  console.error('  - Доступность порта');
  console.error('  - Права на запись в папки logs/ и public/uploads/\n');

  process.exit(1);
};

/**
 * Главная функция запуска приложения
 */
const startServer = async () => {
  const startTime = process.hrtime();
  
  try {
    // Фаза 1: Проверка окружения
    logger.system('Starting server initialization...');
    validateEnvironment();
    
    // Фаза 2: Настройка процесса
    setupProcessHandlers();
    performSystemChecks();
    
    // Фаза 3: Создание папок
    await createDirectories();
    
    // Фаза 4: Подключение к базе данных
    logger.system('Connecting to database...');
    await database.connect();

    // Фаза 4.5: Создание дефолтного админа  ← ДОБАВИТЬ ЭТО!
    
    await AuthService.createDefaultAdmin();
    
    // Фаза 5: Создание приложения
    logger.system('Creating Express application...');
    const app = createApp();
    const config = getAppConfig();
    
    // Фаза 6: Запуск сервера
    logger.system('Starting HTTP server...');
    const server = app.listen(config.port, config.host, () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const startupTime = Math.round((seconds * 1000) + (nanoseconds / 1000000));
      
      displayStartupInfo(config, server);
      
      logger.system('Server startup completed', {
        startupTime: `${startupTime}ms`,
        port: config.port,
        host: config.host
      });
    });

    // Настройка graceful shutdown
    setupGracefulShutdown(server);
    
    // Обработка ошибок сервера
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`, {
          port: config.port,
          type: 'PORT_IN_USE'
        });
        console.error(`❌ Порт ${config.port} уже используется`);
        console.error('💡 Попробуйте изменить PORT в .env файле или остановите другое приложение');
      } else {
        logger.error('Server error', { 
          error: error.message,
          code: error.code,
          type: 'SERVER_ERROR'
        });
      }
      process.exit(1);
    });

    // Логирование подключений (только в development)
    if (isDevelopment()) {
      server.on('connection', (socket) => {
        logger.debug('New connection established', {
          remoteAddress: socket.remoteAddress,
          remotePort: socket.remotePort
        });
      });
    }
    
    return server;
    
  } catch (error) {
    let phase = 'unknown';
    
    if (error.message?.includes('MONGO')) {
      phase = 'database connection';
    } else if (error.message?.includes('EADDRINUSE')) {
      phase = 'port binding';
    } else if (error.message?.includes('environment')) {
      phase = 'environment validation';
    } else if (error.message?.includes('directory') || error.message?.includes('EACCES')) {
      phase = 'directory creation';
    } else {
      phase = 'application initialization';
    }
    
    handleStartupError(error, phase);
  }
};

// =============================================================================
// ЗАПУСК СЕРВЕРА (исправлено для Windows)
// =============================================================================

// Просто запускаем сервер напрямую
startServer().catch((error) => {
  handleStartupError(error, 'startup process');
});

// Экспорты для тестирования
export default startServer;
export { 
  startServer, 
  validateEnvironment, 
  createDirectories, 
  performSystemChecks 
};