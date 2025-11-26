/**
 * Константы и конфигурационные значения для beauty-сервера
 * Централизованное хранение всех магических чисел и настроек
 */

// =============================================================================
// ОБЩИЕ КОНСТАНТЫ ПРИЛОЖЕНИЯ
// =============================================================================

export const APP_CONFIG = {
  NAME: 'Beauty Server API',
  VERSION: process.env.npm_package_version || '1.0.0',
  DESCRIPTION: 'API для сайта салона красоты',
  AUTHOR: 'Erik Yeghiazaryan'
};

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production', 
  TEST: 'test'
};

export const CURRENT_ENV = process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;

// =============================================================================
// НАСТРОЙКИ СЕРВЕРА
// =============================================================================

export const SERVER_CONFIG = {
  DEFAULT_PORT: 3000,
  TEST_PORT: 3001,
  PRODUCTION_PORT: 80,
  DEFAULT_HOST: 'localhost',
  PRODUCTION_HOST: '0.0.0.0',
  TIMEOUT: 30000, // 30 секунд
  KEEP_ALIVE_TIMEOUT: 65000, // 65 секунд
  HEADERS_TIMEOUT: 66000, // 66 секунд
  MAX_CONNECTIONS: 1000
};

// =============================================================================
// НАСТРОЙКИ БАЗЫ ДАННЫХ
// =============================================================================

export const DATABASE_CONFIG = {
  // Настройки пула подключений
  POOL_SIZE: {
    DEVELOPMENT: { MIN: 1, MAX: 5 },
    PRODUCTION: { MIN: 5, MAX: 20 },
    TEST: { MIN: 1, MAX: 1 }
  },
  
  // Таймауты (в миллисекундах)
  TIMEOUTS: {
    SERVER_SELECTION: 5000,
    SOCKET: 45000,
    CONNECT: 10000,
    IDLE: {
      DEVELOPMENT: 15000,
      PRODUCTION: 60000,
      TEST: 5000
    }
  },
  
  // Имена коллекций
  COLLECTIONS: {
    USERS: 'users',
    CATEGORIES: 'categories', 
    SERVICES: 'services',
    WORKS: 'works',
    MASTERS: 'masters',
    PRODUCTS: 'products'
  },
  
  // Префиксы индексов
  INDEX_PREFIXES: {
    UNIQUE: 'unq_',
    TEXT: 'txt_',
    COMPOUND: 'cmp_',
    SPARSE: 'spr_'
  }
};

// =============================================================================
// НАСТРОЙКИ JWT И АВТОРИЗАЦИИ
// =============================================================================

export const AUTH_CONFIG = {
  // Время жизни токенов (в секундах)
  TOKEN_EXPIRY: {
    ACCESS: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    PASSWORD_RESET: '15m',
    EMAIL_VERIFICATION: '24h'
  },
  
  // Время жизни токенов в секундах (для расчетов)
  TOKEN_EXPIRY_SECONDS: {
    ACCESS: 24 * 60 * 60, // 24 часа
    REFRESH: 7 * 24 * 60 * 60, // 7 дней
    PASSWORD_RESET: 15 * 60, // 15 минут
    EMAIL_VERIFICATION: 24 * 60 * 60 // 24 часа
  },
  
  // Настройки паролей
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    SALT_ROUNDS: 12,
    PATTERN: /^(?=.*[A-Za-z])(?=.*\d)/,
    PATTERN_MESSAGE: 'Пароль должен содержать минимум одну букву и одну цифру'
  },
  
  // Настройки cookies
  COOKIE: {
    HTTP_ONLY: true,
    SECURE: CURRENT_ENV === ENVIRONMENTS.PRODUCTION,
    SAME_SITE: 'strict',
    MAX_AGE: 7 * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах
  },
  
  // Роли пользователей
  ROLES: {
    ADMIN: 'admin'
  }
};

// =============================================================================
// НАСТРОЙКИ ФАЙЛОВ И ИЗОБРАЖЕНИЙ
// =============================================================================

export const FILE_CONFIG = {
  // Размеры изображений
  IMAGE_SIZES: {
    THUMB: { WIDTH: 150, HEIGHT: 150 },
    MEDIUM: { WIDTH: 400, HEIGHT: 400 },
    LARGE: { WIDTH: 800, HEIGHT: 800 }
  },
  
  // Качество изображений
  IMAGE_QUALITY: {
    DEVELOPMENT: { WEBP: 80, JPEG: 85 },
    PRODUCTION: { WEBP: 75, JPEG: 80 }
  },
  
  // Лимиты размера файлов (в байтах)
  SIZE_LIMITS: {
    IMAGE: 5 * 1024 * 1024, // 5 MB
    JSON: 10 * 1024 * 1024, // 10 MB
    URL_ENCODED: 10 * 1024 * 1024, // 10 MB
    RAW: 50 * 1024 * 1024 // 50 MB
  },
  
  // Разрешенные типы файлов
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ],
  
  // Расширения файлов
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // Папки для загрузки
  UPLOAD_DIRS: {
    BASE: 'public/uploads',
    CATEGORIES: 'public/uploads/categories',
    SERVICES: 'public/uploads/services',
    WORKS: 'public/uploads/works',
    MASTERS: 'public/uploads/masters',
    PRODUCTS: 'public/uploads/products',
    TEMP: 'public/uploads/temp'
  },
  
  // URL префиксы
  URL_PREFIXES: {
    BASE: '/uploads',
    CATEGORIES: '/uploads/categories',
    SERVICES: '/uploads/services',
    WORKS: '/uploads/works',
    MASTERS: '/uploads/masters',
    PRODUCTS: '/uploads/products'
  }
};

// =============================================================================
// НАСТРОЙКИ ВАЛИДАЦИИ
// =============================================================================

export const VALIDATION_CONFIG = {
  // Общие лимиты
  COMMON_LIMITS: {
    SHORT_TEXT: { MIN: 2, MAX: 100 },
    MEDIUM_TEXT: { MIN: 2, MAX: 300 },
    LONG_TEXT: { MIN: 10, MAX: 3000 },
    DESCRIPTION: { MIN: 10, MAX: 2000 },
    SLUG: { MIN: 2, MAX: 100 },
    EMAIL: { MIN: 5, MAX: 254 },
    SEARCH: { MIN: 1, MAX: 100 },
    CODE: { MIN: 2, MAX: 20 }
  },
  
  // Специфичные лимиты для сущностей
  ENTITY_LIMITS: {
    CATEGORY: {
      TITLE: { MIN: 2, MAX: 100 },
      SLUG: { MIN: 2, MAX: 100 },
      SORT_ORDER: { MIN: 0, MAX: 9999 }
    },
    
    SERVICE: {
      TITLE: { MIN: 2, MAX: 200 },
      DESCRIPTION: { MIN: 10, MAX: 2000 },
      SLUG: { MIN: 2, MAX: 200 }
    },
    
    MASTER: {
      FULL_NAME: { MIN: 2, MAX: 100 },
      SPECIALITY: { MIN: 2, MAX: 200 }
    },
    
    PRODUCT: {
      TITLE: { MIN: 2, MAX: 300 },
      DESCRIPTION: { MIN: 10, MAX: 3000 },
      PRICE: { MIN: 0, MAX: 999999.99 },
      CODE: { MIN: 2, MAX: 20 },
      SLUG: { MIN: 2, MAX: 300 }
    }
  },
  
  // Регулярные выражения
  PATTERNS: {
    MONGODB_ID: /^[0-9a-fA-F]{24}$/,
    SLUG: /^[a-z0-9-]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    CYRILLIC_NAME: /^[А-Яа-яЁё\s\-\.]+$/,
    PRODUCT_CODE: /^[A-Z0-9\-]{2,20}$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)/
  },
  
  // Сообщения об ошибках
  ERROR_MESSAGES: {
    REQUIRED: 'Поле обязательно для заполнения',
    MIN_LENGTH: 'Минимальная длина: {min} символов',
    MAX_LENGTH: 'Максимальная длина: {max} символов',
    INVALID_FORMAT: 'Неверный формат',
    INVALID_EMAIL: 'Неверный формат email',
    INVALID_SLUG: 'Slug может содержать только строчные буквы, цифры и дефисы',
    INVALID_ID: 'Некорректный формат ID'
  }
};

// =============================================================================
// НАСТРОЙКИ ПАГИНАЦИИ
// =============================================================================

export const PAGINATION_CONFIG = {
  // Лимиты по умолчанию
  DEFAULT_LIMITS: {
    CATEGORIES: 20,
    SERVICES: 20,
    WORKS: 12,
    MASTERS: 12,
    PRODUCTS: 12,
    SEARCH: 20
  },
  
  // Максимальные лимиты
  MAX_LIMITS: {
    CATEGORIES: 100,
    SERVICES: 100,
    WORKS: 50,
    MASTERS: 50,
    PRODUCTS: 100,
    SEARCH: 100,
    FEATURED: 20,
    RANDOM: 12
  },
  
  // Настройки по умолчанию
  DEFAULT_PAGE: 1,
  MIN_PAGE: 1,
  MIN_LIMIT: 1
};

// =============================================================================
// НАСТРОЙКИ СОРТИРОВКИ
// =============================================================================

export const SORTING_CONFIG = {
  // Направления сортировки
  DIRECTIONS: {
    ASC: 1,
    DESC: -1
  },
  
  // Доступные поля для сортировки
  ALLOWED_FIELDS: {
    CATEGORIES: ['title', 'sortOrder', 'createdAt', 'section'],
    SERVICES: ['title', 'createdAt'],
    WORKS: ['createdAt', 'categorySlug'],
    MASTERS: ['fullName', 'speciality', 'createdAt'],
    PRODUCTS: ['title', 'price', 'code', 'createdAt']
  },
  
  // Сортировка по умолчанию
  DEFAULT_SORT: {
    CATEGORIES: { sortOrder: 1, title: 1 },
    SERVICES: { createdAt: -1 },
    WORKS: { createdAt: -1 },
    MASTERS: { createdAt: -1 },
    PRODUCTS: { createdAt: -1 }
  }
};

// =============================================================================
// НАСТРОЙКИ ЛОГИРОВАНИЯ
// =============================================================================

export const LOGGING_CONFIG = {
  // Уровни логирования
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn', 
    INFO: 'info',
    HTTP: 'http',
    DEBUG: 'debug'
  },
  
  // Уровни по окружениям
  ENV_LEVELS: {
    [ENVIRONMENTS.PRODUCTION]: 'warn',
    [ENVIRONMENTS.DEVELOPMENT]: 'debug',
    [ENVIRONMENTS.TEST]: 'error'
  },
  
  // Размеры файлов логов
  FILE_SIZES: {
    MAX_SIZE: 10 * 1024 * 1024, // 10 MB
    MAX_FILES: 5,
    COMBINED_MAX_SIZE: 50 * 1024 * 1024, // 50 MB для combined.log
    COMBINED_MAX_FILES: 3
  },
  
  // Типы логов
  LOG_TYPES: {
    HTTP: 'HTTP',
    DATABASE: 'DATABASE', 
    FILE: 'FILE',
    AUTH: 'AUTH',
    BUSINESS: 'BUSINESS',
    VALIDATION: 'VALIDATION',
    SYSTEM: 'SYSTEM',
    SECURITY: 'SECURITY',
    PERFORMANCE: 'PERFORMANCE',
    ERROR: 'ERROR'
  }
};

// =============================================================================
// НАСТРОЙКИ ПРОИЗВОДИТЕЛЬНОСТИ
// =============================================================================

export const PERFORMANCE_CONFIG = {
  // Пороги для предупреждений (в миллисекундах)
  SLOW_THRESHOLDS: {
    HTTP_REQUEST: 1000,
    DATABASE_QUERY: 100,
    FILE_OPERATION: 500,
    IMAGE_PROCESSING: 2000
  },
  
  // Лимиты памяти (в байтах)
  MEMORY_LIMITS: {
    WARNING: 500 * 1024 * 1024, // 500 MB
    CRITICAL: 800 * 1024 * 1024 // 800 MB
  },
  
  // Настройки кеширования
  CACHE: {
    STATIC_FILES_MAX_AGE: 365 * 24 * 60 * 60, // 1 год в секундах
    API_CACHE_MAX_AGE: 5 * 60, // 5 минут
    IMAGE_CACHE_MAX_AGE: 30 * 24 * 60 * 60 // 30 дней
  }
};

// =============================================================================
// НАСТРОЙКИ БЕЗОПАСНОСТИ
// =============================================================================

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITING: {
    WINDOW_MS: 15 * 60 * 1000, // 15 минут
    MAX_REQUESTS: 100,
    AUTH_MAX_REQUESTS: 5,
    UPLOAD_MAX_REQUESTS: 10
  },
  
  // CORS настройки
  CORS: {
    DEFAULT_ORIGINS: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ],
    MAX_AGE: 86400 // 24 часа
  },
  
  // CSP директивы
  CSP: {
    DEFAULT_SRC: ["'self'"],
    IMG_SRC: ["'self'", 'data:', 'blob:'],
    SCRIPT_SRC: ["'self'"],
    STYLE_SRC: ["'self'", "'unsafe-inline'"],
    CONNECT_SRC: ["'self'"],
    FONT_SRC: ["'self'"],
    OBJECT_SRC: ["'none'"],
    MEDIA_SRC: ["'self'"],
    FRAME_SRC: ["'none'"]
  },
  
  // Чувствительные поля для логирования
  SENSITIVE_FIELDS: [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session'
  ]
};

// =============================================================================
// СПРАВОЧНИКИ И ЭНУМЫ
// =============================================================================

export const CATEGORY_SECTIONS = {
  SERVICE: 'service',
  WORK: 'work', 
  PRICE: 'price',
  PRODUCT: 'product'
};

export const USER_ROLES = {
  ADMIN: 'admin'
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD'
};

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
  HTML: 'text/html'
};

export const IMAGE_FORMATS = {
  JPEG: 'jpeg',
  PNG: 'png',
  WEBP: 'webp'
};

// =============================================================================
// СПЕЦИАЛЬНОСТИ МАСТЕРОВ
// =============================================================================

export const MASTER_SPECIALITIES = [
  'Парикмахер-стилист',
  'Мастер маникюра',
  'Мастер педикюра', 
  'Визажист',
  'Бровист',
  'Лешмейкер',
  'Косметолог',
  'Массажист',
  'Колорист',
  'Барбер'
];

// =============================================================================
// УТИЛИТАРНЫЕ ФУНКЦИИ
// =============================================================================

/**
 * Получение конфигурации по текущему окружению
 */
export const getEnvConfig = (configObject) => {
  return configObject[CURRENT_ENV] || configObject.default || configObject;
};

/**
 * Проверка является ли окружение продакшеном
 */
export const isProduction = () => CURRENT_ENV === ENVIRONMENTS.PRODUCTION;

/**
 * Проверка является ли окружение разработкой
 */
export const isDevelopment = () => CURRENT_ENV === ENVIRONMENTS.DEVELOPMENT;

/**
 * Проверка является ли окружение тестом
 */
export const isTest = () => CURRENT_ENV === ENVIRONMENTS.TEST;

/**
 * Получение лимита пагинации для сущности
 */
export const getPaginationLimit = (entity, customLimit = null) => {
  if (customLimit) {
    const maxLimit = PAGINATION_CONFIG.MAX_LIMITS[entity.toUpperCase()];
    return Math.min(customLimit, maxLimit);
  }
  return PAGINATION_CONFIG.DEFAULT_LIMITS[entity.toUpperCase()] || 20;
};

/**
 * Получение настроек размера изображения
 */
export const getImageSize = (size) => {
  return FILE_CONFIG.IMAGE_SIZES[size.toUpperCase()] || FILE_CONFIG.IMAGE_SIZES.MEDIUM;
};

/**
 * Получение качества изображения для текущего окружения
 */
export const getImageQuality = () => {
  return FILE_CONFIG.IMAGE_QUALITY[CURRENT_ENV] || FILE_CONFIG.IMAGE_QUALITY.DEVELOPMENT;
};

/**
 * Проверка разрешенного MIME типа
 */
export const isAllowedMimeType = (mimeType) => {
  return FILE_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType);
};

/**
 * Проверка разрешенного расширения файла
 */
export const isAllowedExtension = (extension) => {
  return FILE_CONFIG.ALLOWED_EXTENSIONS.includes(extension.toLowerCase());
};

// Экспорт по умолчанию
export default {
  APP_CONFIG,
  ENVIRONMENTS,
  CURRENT_ENV,
  SERVER_CONFIG,
  DATABASE_CONFIG,
  AUTH_CONFIG,
  FILE_CONFIG,
  VALIDATION_CONFIG,
  PAGINATION_CONFIG,
  SORTING_CONFIG,
  LOGGING_CONFIG,
  PERFORMANCE_CONFIG,
  SECURITY_CONFIG,
  CATEGORY_SECTIONS,
  USER_ROLES,
  HTTP_METHODS,
  CONTENT_TYPES,
  IMAGE_FORMATS,
  MASTER_SPECIALITIES
};