import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Создаем папку для логов, если её нет
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Кастомный формат для логов
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Добавляем метаданные, если есть
    if (Object.keys(meta).length > 0) {
      log += ` | Meta: ${JSON.stringify(meta)}`;
    }
    
    // Добавляем stack trace для ошибок
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

/**
 * Формат для консоли (цветной)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    
    // Добавляем метаданные в сокращенном виде для консоли
    if (meta.userId) log += ` [User: ${meta.userId}]`;
    if (meta.ip) log += ` [IP: ${meta.ip}]`;
    if (meta.method && meta.url) log += ` [${meta.method} ${meta.url}]`;
    if (meta.duration) log += ` [${meta.duration}ms]`;
    
    // Stack trace только в development
    if (stack && process.env.NODE_ENV === 'development') {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

/**
 * Определяем уровень логирования в зависимости от окружения
 */
const getLogLevel = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'warn';
    case 'test':
      return 'error';
    case 'development':
    default:
      return 'debug';
  }
};

/**
 * Конфигурация транспортов
 */
const transports = [];

// Консольный вывод (всегда включен в development)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_CONSOLE_LOGS === 'true') {
  transports.push(
    new winston.transports.Console({
      level: getLogLevel(),
      format: consoleFormat
    })
  );
}

// Файловые логи для production
if (process.env.NODE_ENV === 'production') {
  // Общий лог файл
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      level: 'info',
      format: customFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Лог ошибок
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );

  // Комбинированный лог (все уровни)
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: 'debug',
      format: customFormat,
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 3,
      tailable: true
    })
  );
}

// Файловые логи для development (опционально)
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_FILE_LOGS === 'true') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'dev.log'),
      level: 'debug',
      format: customFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 2
    })
  );
}

/**
 * Создание основного логгера
 */
const logger = winston.createLogger({
  level: getLogLevel(),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata()
  ),
  transports,
  // Обработка неперехваченных ошибок
  exceptionHandlers: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: customFormat
    })
  ] : [],
  // Обработка неперехваченных промисов
  rejectionHandlers: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: customFormat
    })
  ] : [],
  exitOnError: false
});

/**
 * Специализированные методы логирования для beauty-сервера
 */

/**
 * Логирование HTTP запросов
 */
logger.http = (message, meta = {}) => {
  logger.info(message, { type: 'HTTP', ...meta });
};

/**
 * Логирование операций с базой данных
 */
logger.database = (message, meta = {}) => {
  logger.info(message, { type: 'DATABASE', ...meta });
};

/**
 * Логирование операций с файлами
 */
logger.file = (message, meta = {}) => {
  logger.info(message, { type: 'FILE', ...meta });
};

/**
 * Логирование авторизации
 */
logger.auth = (message, meta = {}) => {
  logger.info(message, { type: 'AUTH', ...meta });
};

/**
 * Логирование бизнес-логики
 */
logger.business = (message, meta = {}) => {
  logger.info(message, { type: 'BUSINESS', ...meta });
};

/**
 * Логирование валидации
 */
logger.validation = (message, meta = {}) => {
  logger.warn(message, { type: 'VALIDATION', ...meta });
};

/**
 * Логирование системных событий
 */
logger.system = (message, meta = {}) => {
  logger.info(message, { type: 'SYSTEM', ...meta });
};

/**
 * Логирование ошибок с контекстом
 */
logger.errorWithContext = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode,
    type: 'ERROR',
    ...context
  };
  
  logger.error('Application Error', errorInfo);
};

/**
 * Логирование производительности
 */
logger.performance = (operation, duration, meta = {}) => {
  const level = duration > 1000 ? 'warn' : 'info'; // Предупреждение для медленных операций
  logger[level](`Performance: ${operation}`, {
    type: 'PERFORMANCE',
    duration,
    slow: duration > 1000,
    ...meta
  });
};

/**
 * Логирование безопасности
 */
logger.security = (event, meta = {}) => {
  logger.warn(`Security Event: ${event}`, {
    type: 'SECURITY',
    timestamp: new Date().toISOString(),
    ...meta
  });
};

/**
 * Создание дочернего логгера с контекстом
 */
logger.createChildLogger = (context) => {
  return {
    debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
    error: (message, meta = {}) => logger.error(message, { ...context, ...meta }),
    http: (message, meta = {}) => logger.http(message, { ...context, ...meta }),
    database: (message, meta = {}) => logger.database(message, { ...context, ...meta }),
    file: (message, meta = {}) => logger.file(message, { ...context, ...meta }),
    auth: (message, meta = {}) => logger.auth(message, { ...context, ...meta }),
    business: (message, meta = {}) => logger.business(message, { ...context, ...meta })
  };
};

/**
 * Утилиты для логирования
 */
const LoggerUtils = {
  /**
   * Создание метаданных запроса
   */
  createRequestMeta: (req) => ({
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    requestId: req.id // Если используется middleware для ID запросов
  }),

  /**
   * Безопасное логирование объекта (скрытие чувствительных данных)
   */
  sanitizeObject: (obj) => {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...obj };
    
    const sanitizeRecursive = (target) => {
      for (const key in target) {
        if (typeof target[key] === 'object' && target[key] !== null) {
          sanitizeRecursive(target[key]);
        } else if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          target[key] = '[REDACTED]';
        }
      }
    };
    
    sanitizeRecursive(sanitized);
    return sanitized;
  },

  /**
   * Форматирование времени выполнения
   */
  formatDuration: (start) => {
    const end = process.hrtime(start);
    return Math.round((end[0] * 1000) + (end[1] / 1000000));
  }
};

// Обработка graceful shutdown
process.on('SIGINT', () => {
  logger.system('Received SIGINT, shutting down gracefully');
  logger.end();
});

process.on('SIGTERM', () => {
  logger.system('Received SIGTERM, shutting down gracefully');
  logger.end();
});

// Информация о запуске
logger.system(`Logger initialized`, {
  environment: process.env.NODE_ENV,
  logLevel: getLogLevel(),
  transports: transports.length,
  logDir: path.resolve(logDir)
});

export default logger;
export { logger, LoggerUtils };