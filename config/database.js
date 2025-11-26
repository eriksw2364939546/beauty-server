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
 * Опции подключения к MongoDB (для Mongoose 8.x)
 */
const getConnectionOptions = () => {
  const baseOptions = {
    // Настройки пула подключений
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
    
    // Таймауты
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    
    // Heartbeat
    heartbeatFrequencyMS: 10000,
    
    // Настройки для Atlas
    retryWrites: true,
    w: 'majority'
  };

  // Настройки для разных окружений
  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        ...baseOptions,
        maxPoolSize: 20,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 10000
      };
    
    case 'development':
      return {
        ...baseOptions,
        maxPoolSize: 5,
        minPoolSize: 1
      };
    
    case 'test':
      return {
        ...baseOptions,
        maxPoolSize: 1,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 3000
      };
    
    default:
      return baseOptions;
  }
};

/**
 * Обработчики событий подключения
 */
const setupConnectionHandlers = () => {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully', {
      database: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port
    });
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', {
      error: error.message,
      stack: error.stack
    });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  mongoose.connection.on('connecting', () => {
    logger.info('MongoDB connecting...');
  });
};

/**
 * Настройка глобальных опций Mongoose
 */
const configureMongoose = () => {
  mongoose.set('strict', true);
  mongoose.set('strictQuery', true);
  mongoose.set('strictPopulate', false);
  
  mongoose.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });

  mongoose.set('toObject', {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
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
    
    return {
      database: {
        name: mongoose.connection.db.databaseName,
        collections: stats.collections,
        objects: stats.objects,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        storageSize: stats.storageSize
      },
      connection: checkDatabaseConnection()
    };
  } catch (error) {
    logger.error('Failed to get database stats', { error: error.message });
    return { error: error.message };
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

    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      message: 'Database is accessible',
      connection,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    
    return {
      status: 'unhealthy',
      message: error.message,
      connection: checkDatabaseConnection(),
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Основная функция подключения к базе данных
 */
export const connectDatabase = async () => {
  try {
    const databaseUrl = getDatabaseUrl();
    const options = getConnectionOptions();
    
    logger.info('Connecting to MongoDB...', {
      environment: process.env.NODE_ENV,
      url: databaseUrl.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
    });

    configureMongoose();
    setupConnectionHandlers();

    await mongoose.connect(databaseUrl, options);
    
    const connectionInfo = checkDatabaseConnection();
    
    if (!connectionInfo.isConnected) {
      throw new Error('Failed to establish database connection');
    }

    logger.info('Database connection established', connectionInfo);
    
    return connectionInfo;

  } catch (error) {
    logger.error('Failed to connect to database', {
      error: error.message,
      stack: error.stack
    });
    
    throw error;
  }
};

/**
 * Отключение от базы данных
 */
export const disconnectDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info('Closing database connection...');
      await mongoose.connection.close();
      logger.info('Database connection closed successfully');
    }
  } catch (error) {
    logger.error('Error closing database connection', { error: error.message });
    throw error;
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
    
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    
    logger.info('Test database cleared');
  } catch (error) {
    logger.error('Failed to clear test database', { error: error.message });
    throw error;
  }
};

export default {
  connect: connectDatabase,
  disconnect: disconnectDatabase,
  checkHealth: checkDatabaseHealth,
  getStats: getDatabaseStats,
  checkConnection: checkDatabaseConnection,
  clearDatabase
};