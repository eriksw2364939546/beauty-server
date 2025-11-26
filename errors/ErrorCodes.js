/**
 * Централизованные коды ошибок и сообщения для beauty-сервера
 * Позволяет легко управлять всеми ошибками из одного места
 */

// Общие HTTP ошибки
export const HTTP_ERRORS = {
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    statusCode: 400,
    message: 'Некорректный запрос'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    statusCode: 401,
    message: 'Необходима авторизация'
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    statusCode: 403,
    message: 'Доступ запрещен'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    statusCode: 404,
    message: 'Ресурс не найден'
  },
  CONFLICT: {
    code: 'CONFLICT',
    statusCode: 409,
    message: 'Конфликт данных'
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
    message: 'Превышен лимит запросов'
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    statusCode: 500,
    message: 'Внутренняя ошибка сервера'
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    statusCode: 503,
    message: 'Сервис временно недоступен'
  }
};

// Ошибки валидации
export const VALIDATION_ERRORS = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    statusCode: 400,
    message: 'Ошибка валидации данных'
  },
  REQUIRED_FIELD_MISSING: {
    code: 'REQUIRED_FIELD_MISSING',
    statusCode: 400,
    message: 'Отсутствует обязательное поле'
  },
  INVALID_FORMAT: {
    code: 'INVALID_FORMAT',
    statusCode: 400,
    message: 'Неверный формат данных'
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    statusCode: 400,
    message: 'Неверный формат email'
  },
  INVALID_PASSWORD: {
    code: 'INVALID_PASSWORD',
    statusCode: 400,
    message: 'Пароль не соответствует требованиям'
  },
  INVALID_ID: {
    code: 'INVALID_ID',
    statusCode: 400,
    message: 'Некорректный ID'
  },
  INVALID_SLUG: {
    code: 'INVALID_SLUG',
    statusCode: 400,
    message: 'Некорректный slug'
  },
  INVALID_PRICE: {
    code: 'INVALID_PRICE',
    statusCode: 400,
    message: 'Некорректная цена'
  },
  INVALID_PAGINATION: {
    code: 'INVALID_PAGINATION',
    statusCode: 400,
    message: 'Некорректные параметры пагинации'
  }
};

// Ошибки авторизации и аутентификации
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    statusCode: 401,
    message: 'Неверный email или пароль'
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    statusCode: 401,
    message: 'Недействительный токен'
  },
  EXPIRED_TOKEN: {
    code: 'EXPIRED_TOKEN',
    statusCode: 401,
    message: 'Токен истек'
  },
  MISSING_TOKEN: {
    code: 'MISSING_TOKEN',
    statusCode: 401,
    message: 'Токен не предоставлен'
  },
  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    statusCode: 401,
    message: 'Недействительный refresh токен'
  },
  TOKEN_VERIFICATION_FAILED: {
    code: 'TOKEN_VERIFICATION_FAILED',
    statusCode: 401,
    message: 'Ошибка проверки токена'
  },
  WRONG_PASSWORD: {
    code: 'WRONG_PASSWORD',
    statusCode: 401,
    message: 'Неверный текущий пароль'
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    statusCode: 401,
    message: 'Сессия истекла'
  }
};

// Ошибки пользователей
export const USER_ERRORS = {
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    statusCode: 404,
    message: 'Пользователь не найден'
  },
  USER_EXISTS: {
    code: 'USER_EXISTS',
    statusCode: 409,
    message: 'Пользователь уже существует'
  },
  EMAIL_ALREADY_TAKEN: {
    code: 'EMAIL_ALREADY_TAKEN',
    statusCode: 409,
    message: 'Email уже используется'
  },
  INVALID_USER_ROLE: {
    code: 'INVALID_USER_ROLE',
    statusCode: 403,
    message: 'Недостаточно прав доступа'
  },
  USER_RATE_LIMIT_EXCEEDED: {
    code: 'USER_RATE_LIMIT_EXCEEDED',
    statusCode: 429,
    message: 'Превышен лимит запросов для пользователя'
  }
};

// Ошибки категорий
export const CATEGORY_ERRORS = {
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    statusCode: 404,
    message: 'Категория не найдена'
  },
  CATEGORY_EXISTS: {
    code: 'CATEGORY_EXISTS',
    statusCode: 409,
    message: 'Категория уже существует'
  },
  CATEGORY_SLUG_TAKEN: {
    code: 'CATEGORY_SLUG_TAKEN',
    statusCode: 409,
    message: 'Slug категории уже используется'
  },
  INVALID_CATEGORY_SECTION: {
    code: 'INVALID_CATEGORY_SECTION',
    statusCode: 400,
    message: 'Недопустимый раздел категории'
  },
  CATEGORY_HAS_SERVICES: {
    code: 'CATEGORY_HAS_SERVICES',
    statusCode: 409,
    message: 'Невозможно удалить категорию. Найдены связанные услуги'
  },
  CATEGORY_HAS_WORKS: {
    code: 'CATEGORY_HAS_WORKS',
    statusCode: 409,
    message: 'Невозможно удалить категорию. Найдены связанные работы'
  },
  CATEGORY_HAS_PRODUCTS: {
    code: 'CATEGORY_HAS_PRODUCTS',
    statusCode: 409,
    message: 'Невозможно удалить категорию. Найдены связанные товары'
  }
};

// Ошибки услуг
export const SERVICE_ERRORS = {
  SERVICE_NOT_FOUND: {
    code: 'SERVICE_NOT_FOUND',
    statusCode: 404,
    message: 'Услуга не найдена'
  },
  SERVICE_EXISTS: {
    code: 'SERVICE_EXISTS',
    statusCode: 409,
    message: 'Услуга уже существует'
  },
  SERVICE_SLUG_TAKEN: {
    code: 'SERVICE_SLUG_TAKEN',
    statusCode: 409,
    message: 'Slug услуги уже используется'
  },
  SERVICE_CATEGORY_INVALID: {
    code: 'SERVICE_CATEGORY_INVALID',
    statusCode: 400,
    message: 'Недопустимая категория для услуги'
  }
};

// Ошибки работ (портфолио)
export const WORK_ERRORS = {
  WORK_NOT_FOUND: {
    code: 'WORK_NOT_FOUND',
    statusCode: 404,
    message: 'Работа не найдена'
  },
  WORK_CATEGORY_INVALID: {
    code: 'WORK_CATEGORY_INVALID',
    statusCode: 400,
    message: 'Недопустимая категория для работы'
  }
};

// Ошибки мастеров
export const MASTER_ERRORS = {
  MASTER_NOT_FOUND: {
    code: 'MASTER_NOT_FOUND',
    statusCode: 404,
    message: 'Мастер не найден'
  },
  MASTER_EXISTS: {
    code: 'MASTER_EXISTS',
    statusCode: 409,
    message: 'Мастер уже существует'
  },
  INVALID_SPECIALITY: {
    code: 'INVALID_SPECIALITY',
    statusCode: 400,
    message: 'Недопустимая специальность'
  }
};

// Ошибки товаров
export const PRODUCT_ERRORS = {
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    statusCode: 404,
    message: 'Товар не найден'
  },
  PRODUCT_EXISTS: {
    code: 'PRODUCT_EXISTS',
    statusCode: 409,
    message: 'Товар уже существует'
  },
  PRODUCT_SLUG_TAKEN: {
    code: 'PRODUCT_SLUG_TAKEN',
    statusCode: 409,
    message: 'Slug товара уже используется'
  },
  PRODUCT_CODE_TAKEN: {
    code: 'PRODUCT_CODE_TAKEN',
    statusCode: 409,
    message: 'Артикул товара уже используется'
  },
  PRODUCT_CATEGORY_INVALID: {
    code: 'PRODUCT_CATEGORY_INVALID',
    statusCode: 400,
    message: 'Недопустимая категория для товара'
  },
  INVALID_PRODUCT_CODE: {
    code: 'INVALID_PRODUCT_CODE',
    statusCode: 400,
    message: 'Недопустимый артикул товара'
  }
};

// Ошибки файлов и изображений
export const FILE_ERRORS = {
  FILE_UPLOAD_ERROR: {
    code: 'FILE_UPLOAD_ERROR',
    statusCode: 400,
    message: 'Ошибка загрузки файла'
  },
  FILE_NOT_PROVIDED: {
    code: 'FILE_NOT_PROVIDED',
    statusCode: 400,
    message: 'Файл не предоставлен'
  },
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    statusCode: 400,
    message: 'Файл слишком большой'
  },
  UNSUPPORTED_FILE_TYPE: {
    code: 'UNSUPPORTED_FILE_TYPE',
    statusCode: 400,
    message: 'Неподдерживаемый тип файла'
  },
  IMAGE_PROCESSING_ERROR: {
    code: 'IMAGE_PROCESSING_ERROR',
    statusCode: 400,
    message: 'Ошибка обработки изображения'
  },
  IMAGE_REQUIRED: {
    code: 'IMAGE_REQUIRED',
    statusCode: 400,
    message: 'Изображение обязательно'
  },
  INVALID_IMAGE_FORMAT: {
    code: 'INVALID_IMAGE_FORMAT',
    statusCode: 400,
    message: 'Недопустимый формат изображения'
  },
  IMAGE_UPLOAD_FAILED: {
    code: 'IMAGE_UPLOAD_FAILED',
    statusCode: 500,
    message: 'Не удалось сохранить изображение'
  }
};

// Ошибки базы данных
export const DATABASE_ERRORS = {
  DATABASE_CONNECTION_ERROR: {
    code: 'DATABASE_CONNECTION_ERROR',
    statusCode: 500,
    message: 'Ошибка подключения к базе данных'
  },
  DATABASE_OPERATION_ERROR: {
    code: 'DATABASE_OPERATION_ERROR',
    statusCode: 500,
    message: 'Ошибка операции с базой данных'
  },
  MONGOOSE_VALIDATION_ERROR: {
    code: 'MONGOOSE_VALIDATION_ERROR',
    statusCode: 400,
    message: 'Ошибка валидации Mongoose'
  },
  MONGOOSE_CAST_ERROR: {
    code: 'MONGOOSE_CAST_ERROR',
    statusCode: 400,
    message: 'Ошибка преобразования типов Mongoose'
  },
  DUPLICATE_FIELD: {
    code: 'DUPLICATE_FIELD',
    statusCode: 409,
    message: 'Дублирование уникального поля'
  },
  HAS_RELATED_DATA: {
    code: 'HAS_RELATED_DATA',
    statusCode: 409,
    message: 'Невозможно удалить. Найдены связанные данные'
  }
};

// Системные ошибки
export const SYSTEM_ERRORS = {
  MAINTENANCE_MODE: {
    code: 'MAINTENANCE_MODE',
    statusCode: 503,
    message: 'Сервис находится в режиме обслуживания'
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    statusCode: 502,
    message: 'Ошибка внешнего сервиса'
  },
  TIMEOUT_ERROR: {
    code: 'TIMEOUT_ERROR',
    statusCode: 504,
    message: 'Превышено время ожидания'
  },
  CONFIGURATION_ERROR: {
    code: 'CONFIGURATION_ERROR',
    statusCode: 500,
    message: 'Ошибка конфигурации'
  }
};

// Коллекция всех ошибок
export const ALL_ERRORS = {
  ...HTTP_ERRORS,
  ...VALIDATION_ERRORS,
  ...AUTH_ERRORS,
  ...USER_ERRORS,
  ...CATEGORY_ERRORS,
  ...SERVICE_ERRORS,
  ...WORK_ERRORS,
  ...MASTER_ERRORS,
  ...PRODUCT_ERRORS,
  ...FILE_ERRORS,
  ...DATABASE_ERRORS,
  ...SYSTEM_ERRORS
};

/**
 * Получение информации об ошибке по коду
 * @param {string} code - Код ошибки
 * @returns {Object|null} Информация об ошибке или null
 */
export const getErrorByCode = (code) => {
  return ALL_ERRORS[code] || null;
};

/**
 * Проверка существования кода ошибки
 * @param {string} code - Код ошибки
 * @returns {boolean} Существует ли код
 */
export const isValidErrorCode = (code) => {
  return code in ALL_ERRORS;
};

/**
 * Получение всех ошибок по статус коду
 * @param {number} statusCode - HTTP статус код
 * @returns {Array} Массив ошибок с данным статус кодом
 */
export const getErrorsByStatusCode = (statusCode) => {
  return Object.values(ALL_ERRORS).filter(error => error.statusCode === statusCode);
};

/**
 * Получение списка всех кодов ошибок
 * @returns {Array} Массив всех кодов ошибок
 */
export const getAllErrorCodes = () => {
  return Object.keys(ALL_ERRORS);
};

/**
 * Категории ошибок для группировки
 */
export const ERROR_CATEGORIES = {
  HTTP: 'HTTP ошибки',
  VALIDATION: 'Ошибки валидации',
  AUTH: 'Ошибки авторизации',
  USER: 'Ошибки пользователей',
  CATEGORY: 'Ошибки категорий',
  SERVICE: 'Ошибки услуг',
  WORK: 'Ошибки работ',
  MASTER: 'Ошибки мастеров',
  PRODUCT: 'Ошибки товаров',
  FILE: 'Ошибки файлов',
  DATABASE: 'Ошибки базы данных',
  SYSTEM: 'Системные ошибки'
};

/**
 * Маппинг кодов ошибок к категориям
 */
export const ERROR_CODE_TO_CATEGORY = {
  // HTTP ошибки
  ...Object.fromEntries(Object.keys(HTTP_ERRORS).map(key => [key, 'HTTP'])),
  // Валидация
  ...Object.fromEntries(Object.keys(VALIDATION_ERRORS).map(key => [key, 'VALIDATION'])),
  // Авторизация
  ...Object.fromEntries(Object.keys(AUTH_ERRORS).map(key => [key, 'AUTH'])),
  // Пользователи
  ...Object.fromEntries(Object.keys(USER_ERRORS).map(key => [key, 'USER'])),
  // Категории
  ...Object.fromEntries(Object.keys(CATEGORY_ERRORS).map(key => [key, 'CATEGORY'])),
  // Услуги
  ...Object.fromEntries(Object.keys(SERVICE_ERRORS).map(key => [key, 'SERVICE'])),
  // Работы
  ...Object.fromEntries(Object.keys(WORK_ERRORS).map(key => [key, 'WORK'])),
  // Мастера
  ...Object.fromEntries(Object.keys(MASTER_ERRORS).map(key => [key, 'MASTER'])),
  // Товары
  ...Object.fromEntries(Object.keys(PRODUCT_ERRORS).map(key => [key, 'PRODUCT'])),
  // Файлы
  ...Object.fromEntries(Object.keys(FILE_ERRORS).map(key => [key, 'FILE'])),
  // База данных
  ...Object.fromEntries(Object.keys(DATABASE_ERRORS).map(key => [key, 'DATABASE'])),
  // Система
  ...Object.fromEntries(Object.keys(SYSTEM_ERRORS).map(key => [key, 'SYSTEM']))
};

/**
 * Получение категории ошибки по коду
 * @param {string} code - Код ошибки
 * @returns {string|null} Категория ошибки или null
 */
export const getErrorCategory = (code) => {
  return ERROR_CODE_TO_CATEGORY[code] || null;
};

export default ALL_ERRORS;