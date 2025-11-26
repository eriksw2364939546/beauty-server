import morgan from 'morgan';
import logger from './logger.js';

/**
 * Кастомные токены для Morgan
 */

// Токен для ID пользователя
morgan.token('user-id', (req) => {
  return req.user?.id || 'anonymous';
});

// Токен для реального IP (учитывая прокси)
morgan.token('real-ip', (req) => {
  return req.ip || req.connection?.remoteAddress || 'unknown';
});

// Токен для размера ответа в человекочитаемом формате
morgan.token('response-size-formatted', (req, res) => {
  const size = morgan['response-size'](req, res);
  if (!size) return '0';
  
  const bytes = parseInt(size);
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
});

// Токен для времени ответа с подсветкой медленных запросов
morgan.token('response-time-colored', (req, res) => {
  const time = morgan['response-time'](req, res);
  if (!time) return '-';
  
  const ms = parseFloat(time);
  if (ms > 1000) return `${time}ms ⚠️`;
  if (ms > 500) return `${time}ms ⚡`;
  return `${time}ms`;
});

// Токен для типа контента ответа
morgan.token('response-type', (req, res) => {
  return res.get('Content-Type') || 'unknown';
});

// Токен для User-Agent (сокращенный)
morgan.token('user-agent-short', (req) => {
  const ua = req.get('User-Agent') || '';
  if (ua.includes('Postman')) return 'Postman';
  if (ua.includes('curl')) return 'curl';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('bot')) return 'Bot';
  return ua.substring(0, 20) + (ua.length > 20 ? '...' : '');
});

// Токен для метода с эмодзи
morgan.token('method-emoji', (req) => {
  const method = req.method;
  const emojis = {
    GET: '📥',
    POST: '📤',
    PUT: '🔄',
    PATCH: '✏️',
    DELETE: '🗑️',
    OPTIONS: '❓',
    HEAD: '👁️'
  };
  return `${emojis[method] || '❔'} ${method}`;
});

// Токен для статуса с цветовой индикацией
morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `${status} ❌`;
  if (status >= 400) return `${status} ⚠️`;
  if (status >= 300) return `${status} ↩️`;
  if (status >= 200) return `${status} ✅`;
  return `${status} ❔`;
});

/**
 * Функция определения цвета статуса для консоли
 */
const getStatusColor = (status) => {
  if (status >= 500) return 31; // красный
  if (status >= 400) return 33; // желтый
  if (status >= 300) return 36; // голубой
  if (status >= 200) return 32; // зеленый
  return 0; // белый
};

/**
 * Кастомные форматы логирования
 */

// Подробный формат для development
const developmentFormat = [
  ':method-emoji :url',
  ':status-colored',
  ':response-time-colored',
  ':response-size-formatted',
  '👤:user-id',
  '🌐:real-ip',
  '🔧:user-agent-short'
].join(' ');

// Краткий формат для production
const productionFormat = [
  ':real-ip',
  ':user-id',
  ':method :url',
  ':status',
  ':response-size',
  ':response-time ms',
  '":referrer"',
  '":user-agent"'
].join(' ');

// JSON формат для структурированных логов
const jsonFormat = (tokens, req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: parseInt(tokens.status(req, res)),
    responseTime: parseFloat(tokens['response-time'](req, res)),
    responseSize: parseInt(tokens['response-size'](req, res)) || 0,
    userAgent: tokens['user-agent'](req, res),
    ip: tokens['real-ip'](req, res),
    userId: tokens['user-id'](req, res),
    referrer: tokens.referrer(req, res),
    contentType: tokens['response-type'](req, res)
  });
};

/**
 * Функция для пропуска определенных запросов
 */
const skipFunction = (req, res) => {
  // Пропускаем health check в production
  if (process.env.NODE_ENV === 'production' && req.url === '/api/health') {
    return true;
  }
  
  // Пропускаем статичные файлы
  if (req.url.startsWith('/uploads/') || req.url.startsWith('/static/')) {
    return true;
  }
  
  // Пропускаем OPTIONS запросы в production
  if (process.env.NODE_ENV === 'production' && req.method === 'OPTIONS') {
    return true;
  }
  
  return false;
};

/**
 * Stream для записи в наш логгер
 */
const loggerStream = {
  write: (message) => {
    // Парсим JSON если это структурированный лог
    try {
      const logData = JSON.parse(message);
      const meta = {
        method: logData.method,
        url: logData.url,
        status: logData.status,
        responseTime: logData.responseTime,
        responseSize: logData.responseSize,
        ip: logData.ip,
        userId: logData.userId !== 'anonymous' ? logData.userId : undefined,
        userAgent: logData.userAgent,
        referrer: logData.referrer,
        contentType: logData.contentType
      };
      
      // Определяем уровень логирования по статусу
      if (logData.status >= 500) {
        logger.error(`${logData.method} ${logData.url} - ${logData.status}`, meta);
      } else if (logData.status >= 400) {
        logger.warn(`${logData.method} ${logData.url} - ${logData.status}`, meta);
      } else {
        logger.http(`${logData.method} ${logData.url} - ${logData.status}`, meta);
      }
    } catch (error) {
      // Если не JSON, логируем как есть
      logger.http(message.trim());
    }
  }
};

/**
 * Создание middleware логгера в зависимости от окружения
 */
const createHttpLogger = () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return morgan(developmentFormat, {
        skip: skipFunction
      });
    
    case 'production':
      return morgan(jsonFormat, {
        stream: loggerStream,
        skip: skipFunction
      });
    
    case 'test':
      return morgan('common', {
        skip: () => true // Отключаем логирование в тестах
      });
    
    default:
      return morgan('combined', {
        skip: skipFunction
      });
  }
};

/**
 * Middleware для добавления уникального ID запроса
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.set('X-Request-ID', req.id);
  next();
};

/**
 * Middleware для логирования начала обработки запроса
 */
const requestStartMiddleware = (req, res, next) => {
  req.startTime = process.hrtime();
  
  const meta = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  };
  
  logger.debug('Request started', meta);
  next();
};

/**
 * Middleware для логирования завершения запроса
 */
const requestEndMiddleware = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = req.startTime ? 
      Math.round((process.hrtime(req.startTime)[0] * 1000) + (process.hrtime(req.startTime)[1] / 1000000)) : 
      0;
    
    const meta = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration,
      responseSize: data ? Buffer.byteLength(data, 'utf8') : 0,
      userId: req.user?.id
    };
    
    // Логируем медленные запросы как предупреждения
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.url}`, meta);
    }
    
    logger.debug('Request completed', meta);
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware для логирования ошибок HTTP
 */
const errorLoggingMiddleware = (err, req, res, next) => {
  const meta = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
    errorCode: err.code,
    statusCode: err.statusCode || 500,
    stack: err.stack
  };
  
  if (err.statusCode >= 500 || !err.statusCode) {
    logger.error('HTTP Error', { message: err.message, ...meta });
  } else {
    logger.warn('HTTP Client Error', { message: err.message, ...meta });
  }
  
  next(err);
};

/**
 * Middleware для логирования медленных запросов
 */
const slowRequestMiddleware = (threshold = 1000) => {
  return (req, res, next) => {
    const start = process.hrtime();
    
    res.on('finish', () => {
      const duration = process.hrtime(start);
      const ms = Math.round((duration[0] * 1000) + (duration[1] / 1000000));
      
      if (ms > threshold) {
        logger.performance('Slow HTTP Request', ms, {
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          userId: req.user?.id,
          ip: req.ip
        });
      }
    });
    
    next();
  };
};

/**
 * Статистика HTTP запросов
 */
const HttpStats = {
  requests: 0,
  errors: 0,
  slowRequests: 0,
  totalResponseTime: 0,
  
  increment() {
    this.requests++;
  },
  
  incrementErrors() {
    this.errors++;
  },
  
  incrementSlow() {
    this.slowRequests++;
  },
  
  addResponseTime(time) {
    this.totalResponseTime += time;
  },
  
  getAverageResponseTime() {
    return this.requests > 0 ? Math.round(this.totalResponseTime / this.requests) : 0;
  },
  
  getStats() {
    return {
      totalRequests: this.requests,
      totalErrors: this.errors,
      slowRequests: this.slowRequests,
      averageResponseTime: this.getAverageResponseTime(),
      errorRate: this.requests > 0 ? ((this.errors / this.requests) * 100).toFixed(2) + '%' : '0%'
    };
  },
  
  reset() {
    this.requests = 0;
    this.errors = 0;
    this.slowRequests = 0;
    this.totalResponseTime = 0;
  }
};

/**
 * Middleware для сбора статистики
 */
const statsMiddleware = (req, res, next) => {
  const start = process.hrtime();
  HttpStats.increment();
  
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const ms = Math.round((duration[0] * 1000) + (duration[1] / 1000000));
    
    HttpStats.addResponseTime(ms);
    
    if (res.statusCode >= 400) {
      HttpStats.incrementErrors();
    }
    
    if (ms > 1000) {
      HttpStats.incrementSlow();
    }
  });
  
  next();
};

// Создаем и экспортируем основной HTTP logger
const httpLogger = createHttpLogger();

export default httpLogger;
export {
  httpLogger,
  requestIdMiddleware,
  requestStartMiddleware,
  requestEndMiddleware,
  errorLoggingMiddleware,
  slowRequestMiddleware,
  statsMiddleware,
  HttpStats
};