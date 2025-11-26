import mongoose from 'mongoose';
import logger from '../loggers/logger.js';

/**
 * Конфигурация подключения к MongoDB для beauty-сервера
 */

/**
 * Получение строки подключения к базе данных
 */
const getDatabaseUrl = () => {
  const mongoUrl = process.env.MONGO_DB;
  
  if (!mongoUrl) {
    throw new Error('MONGO_DB environment variable is not defined');
  }
  
  return mongoUrl;
};

/**
 * Опции подключения к MongoDB
 */
const getConnectionOptions = () => {
  const baseOptions = {
    // Настройки подключения
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
    maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 30000,
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    
    // Настройки буферизации
    bufferCommands: false,
    bufferMaxEntries: 0,
    
    // Heartbeat и мониторинг
    heartbeatFrequencyMS: 10000,
    
    // Настройки для работы с Atlas/реплика-сетами
    retryWrites: true,
    w: 'majority',
    readPreference: 'primary',
    
    // Автоматическое переподключение
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    
    // Настройки для production
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  // Дополнительные настройки для разных окружений
  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        ...baseOptions,
        maxPoolSize: 20,
        minPoolSize: 5,
        maxIdleTimeMS: 60000,
        serverSelectionTimeoutMS: 10000
      };
    
    case 'development':
      return {
        ...baseOptions,
        maxPoolSize: 5,
        minPoolSize: 1,
        maxIdleTimeMS: 15000
      };
    
    case 'test':
      return {
        ...baseOptions,
        maxPoolSize: 1,
        minPoolSize: 1,
        maxIdleTimeMS: 5000,
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 10000
      };
    
    default:
      return baseOptions;
  }
};

/**
 * Обработчики событий подключения
 */
const setupConnectionHandlers = () => {
  // Успешное подключение
  mongoose.connection.on('connected', () => {
    logger.system('MongoDB connected successfully', {
      database: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState
    });
  });

  // Ошибка подключения
  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', {
      error: error.message,
      stack: error.stack,
      type: 'DATABASE_CONNECTION_ERROR'
    });
  });

  // Отключение
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected', {
      timestamp: new Date().toISOString()
    });
  });

  // Переподключение
  mongoose.connection.on('reconnected', () => {
    logger.system('MongoDB reconnected', {
      database: mongoose.connection.db?.databaseName,
      readyState: mongoose.connection.readyState
    });
  });

  // Ошибка с индексами
  mongoose.connection.on('index', (error) => {
    if (error) {
      logger.error('MongoDB index error', {
        error: error.message,
        type: 'DATABASE_INDEX_ERROR'
      });
    } else {
      logger.database('MongoDB indexes built successfully');
    }
  });

  // Потеря соединения
  mongoose.connection.on('close', () => {
    logger.warn('MongoDB connection closed');
  });

  // Состояние "connecting"
  mongoose.connection.on('connecting', () => {
    logger.database('MongoDB connecting...');
  });

  // Переподключение после потери связи
  mongoose.connection.on('reconnectFailed', () => {
    logger.error('MongoDB reconnection failed', {
      type: 'DATABASE_RECONNECT_FAILED'
    });
  });
};

/**
 * Настройка глобальных опций Mongoose
 */
const configureMongoose = () => {
  // Отключаем строгий режим для гибкости
  mongoose.set('strict', true);
  
  // Включаем строгий режим для запросов
  mongoose.set('strictQuery', true);
  
  // Отключаем устаревшие предупреждения
  mongoose.set('strictPopulate', false);
  
  // Настройки для JSON
  mongoose.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });

  // Настройки для Object
  mongoose.set('toObject', {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });

  // Глобальные плагины
  mongoose.plugin((schema) => {
    // Автоматически добавляем метод toJSON для всех схем
    schema.set('toJSON', {
      virtuals: true,
      versionKey: false,
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    });
  });
};

/**
 * Проверка состояния соединения
 */
export const checkDatabaseConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[state],
    stateCode: state,
    isConnected: state === 1,
    database: mongoose.connection.db?.databaseName,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
};

/**
 * Получение статистики подключения
 */
export const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return { error: 'Database not connected' };
    }

    const admin = mongoose.connection.db.admin();
    const stats = await mongoose.connection.db.stats();
    const serverStatus = await admin.serverStatus();
    
    return {
      database: {
        name: mongoose.connection.db.databaseName,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        storageSize: stats.storageSize
      },
      server: {
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        connections: serverStatus.connections,
        memory: serverStatus.mem
      },
      connection: checkDatabaseConnection()
    };
  } catch (error) {
    logger.error('Failed to get database stats', {
      error: error.message,
      type: 'DATABASE_STATS_ERROR'
    });
    return { error: error.message };
  }
};

/**
 * Создание резервной копии (базовая версия)
 */
export const createBackupInfo = () => {
  const connection = checkDatabaseConnection();
  if (!connection.isConnected) {
    throw new Error('Database is not connected');
  }

  return {
    timestamp: new Date().toISOString(),
    database: connection.database,
    host: connection.host,
    port: connection.port,
    environment: process.env.NODE_ENV,
    note: 'Use mongodump for actual backup creation'
  };
};

/**
 * Основная функция подключения к базе данных
 */
export const connectDatabase = async () => {
  try {
    const databaseUrl = getDatabaseUrl();
    const options = getConnectionOptions();
    
    logger.database('Connecting to MongoDB...', {
      environment: process.env.NODE_ENV,
      url: databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') // Скрываем пароль в логах
    });

    // Настраиваем Mongoose
    configureMongoose();
    
    // Устанавливаем обработчики событий
    setupConnectionHandlers();

    // Подключаемся к базе данных
    await mongoose.connect(databaseUrl, options);
    
    // Проверяем подключение
    const connectionInfo = checkDatabaseConnection();
    
    if (!connectionInfo.isConnected) {
      throw new Error('Failed to establish database connection');
    }

    logger.system('Database connection established', connectionInfo);
    
    return connectionInfo;

  } catch (error) {
    logger.error('Failed to connect to database', {
      error: error.message,
      stack: error.stack,
      type: 'DATABASE_CONNECTION_FAILED'
    });
    
    throw error;
  }
};

/**
 * Graceful отключение от базы данных
 */
export const disconnectDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.database('Closing database connection...');
      await mongoose.connection.close();
      logger.system('Database connection closed successfully');
    }
  } catch (error) {
    logger.error('Error closing database connection', {
      error: error.message,
      type: 'DATABASE_DISCONNECT_ERROR'
    });
    throw error;
  }
};

/**
 * Проверка здоровья базы данных
 */
export const checkDatabaseHealth = async () => {
  try {
    const connection = checkDatabaseConnection();
    
    if (!connection.isConnected) {
      return {
        status: 'unhealthy',
        message: 'Database not connected',
        connection
      };
    }

    // Простой запрос для проверки
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      message: 'Database is accessible',
      connection,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Database health check failed', {
      error: error.message,
      type: 'DATABASE_HEALTH_CHECK_FAILED'
    });
    
    return {
      status: 'unhealthy',
      message: error.message,
      connection: checkDatabaseConnection(),
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Очистка базы данных (только для тестов!)
 */
export const clearDatabase = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearDatabase can only be used in test environment');
  }

  try {
    const collections = await mongoose.connection.db.collections();
    
    const clearPromises = collections.map(async (collection) => {
      await collection.deleteMany({});
    });
    
    await Promise.all(clearPromises);
    
    logger.database('Test database cleared');
  } catch (error) {
    logger.error('Failed to clear test database', {
      error: error.message
    });
    throw error;
  }
};

// Обработка graceful shutdown
process.on('SIGINT', async () => {
  logger.system('Received SIGINT, closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.system('Received SIGTERM, closing database connection...');
  await disconnectDatabase();
  process.exit(0);
});

// Обработка неперехваченных ошибок
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception, closing database connection', {
    error: error.message,
    stack: error.stack
  });
  await disconnectDatabase();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Unhandled rejection, closing database connection', {
    reason: reason?.toString(),
    promise: promise?.toString()
  });
  await disconnectDatabase();
  process.exit(1);
});

export default {
  connect: connectDatabase,
  disconnect: disconnectDatabase,
  checkHealth: checkDatabaseHealth,
  getStats: getDatabaseStats,
  checkConnection: checkDatabaseConnection,
  clearDatabase
};