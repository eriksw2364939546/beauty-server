/**
 * Кастомный класс ошибок для приложения
 * Расширяет стандартный Error и добавляет специфичные для API поля
 */
class AppError extends Error {
  /**
   * Создание новой ошибки приложения
   * @param {string} message - Сообщение об ошибке
   * @param {number} statusCode - HTTP статус код
   * @param {string} code - Внутренний код ошибки
   * @param {boolean} isOperational - Является ли ошибка операционной (ожидаемой)
   * @param {Object} details - Дополнительные детали ошибки
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true, details = null) {
    super(message);

    // Основные свойства ошибки
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Определяем статус на основе кода
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Захватываем stack trace, исключая конструктор
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Создание ошибки валидации (400)
   */
  static badRequest(message = 'Некорректные данные', details = null, code = 'VALIDATION_ERROR') {
    return new AppError(message, 400, code, true, details);
  }

  /**
   * Создание ошибки авторизации (401)
   */
  static unauthorized(message = 'Необходима авторизация', code = 'UNAUTHORIZED') {
    return new AppError(message, 401, code, true);
  }

  /**
   * Создание ошибки доступа (403)
   */
  static forbidden(message = 'Доступ запрещен', code = 'FORBIDDEN') {
    return new AppError(message, 403, code, true);
  }

  /**
   * Создание ошибки "не найдено" (404)
   */
  static notFound(message = 'Ресурс не найден', code = 'NOT_FOUND') {
    return new AppError(message, 404, code, true);
  }

  /**
   * Создание ошибки конфликта (409)
   */
  static conflict(message = 'Конфликт данных', details = null, code = 'CONFLICT') {
    return new AppError(message, 409, code, true, details);
  }

  /**
   * Создание ошибки "слишком много запросов" (429)
   */
  static tooManyRequests(message = 'Слишком много запросов', code = 'RATE_LIMIT_EXCEEDED') {
    return new AppError(message, 429, code, true);
  }

  /**
   * Создание внутренней ошибки сервера (500)
   */
  static internal(message = 'Внутренняя ошибка сервера', code = 'INTERNAL_ERROR', details = null) {
    return new AppError(message, 500, code, false, details);
  }

  /**
   * Создание ошибки недоступности сервиса (503)
   */
  static serviceUnavailable(message = 'Сервис временно недоступен', code = 'SERVICE_UNAVAILABLE') {
    return new AppError(message, 503, code, true);
  }

  /**
   * Специфичные ошибки для beauty-сервера
   */

  /**
   * Ошибка загрузки файла
   */
  static fileUploadError(message = 'Ошибка загрузки файла', details = null) {
    return new AppError(message, 400, 'FILE_UPLOAD_ERROR', true, details);
  }

  /**
   * Ошибка обработки изображения
   */
  static imageProcessingError(message = 'Ошибка обработки изображения', details = null) {
    return new AppError(message, 400, 'IMAGE_PROCESSING_ERROR', true, details);
  }

  /**
   * Ошибка неподдерживаемого типа файла
   */
  static unsupportedFileType(message = 'Неподдерживаемый тип файла', allowedTypes = []) {
    const details = allowedTypes.length > 0 ? { allowedTypes } : null;
    return new AppError(message, 400, 'UNSUPPORTED_FILE_TYPE', true, details);
  }

  /**
   * Ошибка превышения размера файла
   */
  static fileTooLarge(message = 'Файл слишком большой', maxSize = null) {
    const details = maxSize ? { maxSize } : null;
    return new AppError(message, 400, 'FILE_TOO_LARGE', true, details);
  }

  /**
   * Ошибка JWT токена
   */
  static invalidToken(message = 'Недействительный токен') {
    return new AppError(message, 401, 'INVALID_TOKEN', true);
  }

  /**
   * Ошибка истекшего токена
   */
  static expiredToken(message = 'Токен истек') {
    return new AppError(message, 401, 'EXPIRED_TOKEN', true);
  }

  /**
   * Ошибка дублирования уникального поля
   */
  static duplicateField(field, value, message = null) {
    const defaultMessage = `${field} "${value}" уже используется`;
    const details = { field, value };
    return new AppError(message || defaultMessage, 409, 'DUPLICATE_FIELD', true, details);
  }

  /**
   * Ошибка недопустимого slug
   */
  static invalidSlug(slug, message = null) {
    const defaultMessage = `Недопустимый slug: ${slug}`;
    const details = { slug };
    return new AppError(message || defaultMessage, 400, 'INVALID_SLUG', true, details);
  }

  /**
   * Ошибка отсутствующей категории
   */
  static categoryNotFound(categorySlug) {
    const message = `Категория "${categorySlug}" не найдена`;
    const details = { categorySlug };
    return new AppError(message, 404, 'CATEGORY_NOT_FOUND', true, details);
  }

  /**
   * Ошибка удаления связанных данных
   */
  static hasRelatedData(entityType, relatedCount, relatedType) {
    const message = `Невозможно удалить ${entityType}. Найдено связанных ${relatedType}: ${relatedCount}`;
    const details = { entityType, relatedCount, relatedType };
    return new AppError(message, 409, 'HAS_RELATED_DATA', true, details);
  }

  /**
   * Ошибка неверного пароля
   */
  static wrongPassword(message = 'Неверный пароль') {
    return new AppError(message, 401, 'WRONG_PASSWORD', true);
  }

  /**
   * Ошибка пользователь уже существует
   */
  static userExists(email) {
    const message = `Пользователь с email "${email}" уже существует`;
    const details = { email };
    return new AppError(message, 409, 'USER_EXISTS', true, details);
  }

  /**
   * Ошибка пользователь не найден
   */
  static userNotFound(identifier = null) {
    const message = identifier 
      ? `Пользователь "${identifier}" не найден`
      : 'Пользователь не найден';
    const details = identifier ? { identifier } : null;
    return new AppError(message, 404, 'USER_NOT_FOUND', true, details);
  }

  /**
   * Ошибка превышения лимита запросов для пользователя
   */
  static userRateLimitExceeded(message = 'Превышен лимит запросов для пользователя') {
    return new AppError(message, 429, 'USER_RATE_LIMIT_EXCEEDED', true);
  }

  /**
   * Ошибка подключения к базе данных
   */
  static databaseConnectionError(message = 'Ошибка подключения к базе данных') {
    return new AppError(message, 500, 'DATABASE_CONNECTION_ERROR', false);
  }

  /**
   * Ошибка операции с базой данных
   */
  static databaseOperationError(operation, details = null) {
    const message = `Ошибка выполнения операции: ${operation}`;
    return new AppError(message, 500, 'DATABASE_OPERATION_ERROR', false, details);
  }

  /**
   * Преобразование в объект для JSON ответа
   */
  toJSON() {
    const result = {
      ok: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp
      }
    };

    // Добавляем детали только если они есть
    if (this.details) {
      result.error.details = this.details;
    }

    // В development режиме добавляем stack trace
    if (process.env.NODE_ENV === 'development') {
      result.error.stack = this.stack;
    }

    return result;
  }

  /**
   * Проверка является ли ошибка операционной
   */
  static isOperational(error) {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Создание AppError из стандартной ошибки
   */
  static fromError(error, statusCode = 500, code = 'INTERNAL_ERROR') {
    if (error instanceof AppError) {
      return error;
    }
    
    return new AppError(error.message, statusCode, code, false, {
      originalError: error.name,
      stack: error.stack
    });
  }

  /**
   * Обработка ошибок Mongoose
   */
  static fromMongooseError(error) {
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors).map(err => ({
        field: err.path,
        value: err.value,
        message: err.message
      }));
      return AppError.badRequest('Ошибка валидации данных', details, 'MONGOOSE_VALIDATION_ERROR');
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return AppError.duplicateField(field, value);
    }

    if (error.name === 'CastError') {
      const message = `Некорректный ${error.path}: ${error.value}`;
      return AppError.badRequest(message, { path: error.path, value: error.value }, 'MONGOOSE_CAST_ERROR');
    }

    return AppError.fromError(error);
  }
}

export default AppError;