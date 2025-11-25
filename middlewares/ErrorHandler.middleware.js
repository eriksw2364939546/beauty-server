class ErrorHandlerMiddleware {
  // Основной обработчик ошибок
  static handle(error, req, res, next) {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString()
    });

    // Mongoose validation ошибки
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        ok: false,
        error: 'validation_error',
        message: 'Ошибка валидации данных',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }

    // Mongoose duplicate key ошибка
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        ok: false,
        error: 'duplicate_error',
        message: 'Запись с таким значением уже существует',
        details: {
          field,
          value: error.keyValue[field]
        }
      });
    }

    // Mongoose CastError (неверный ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        ok: false,
        error: 'invalid_id',
        message: 'Неверный формат ID',
        details: {
          field: error.path,
          value: error.value
        }
      });
    }

    // JWT ошибки
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        ok: false,
        error: 'invalid_token',
        message: 'Неверный токен'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        error: 'token_expired',
        message: 'Токен истек'
      });
    }

    // Multer ошибки (загрузка файлов)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        ok: false,
        error: 'file_too_large',
        message: 'Файл слишком большой'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        ok: false,
        error: 'unexpected_file',
        message: 'Неожиданный файл'
      });
    }

    // Кастомные ошибки приложения
    if (error.isCustomError) {
      return res.status(error.statusCode || 500).json({
        ok: false,
        error: error.code || 'custom_error',
        message: error.message
      });
    }

    // MongoDB connection ошибки
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(503).json({
        ok: false,
        error: 'database_connection_error',
        message: 'Ошибка подключения к базе данных'
      });
    }

    // Ошибки обработки изображений
    if (error.message && error.message.includes('Sharp')) {
      return res.status(400).json({
        ok: false,
        error: 'image_processing_error',
        message: 'Ошибка обработки изображения'
      });
    }

    // Ошибки файловой системы
    if (error.code === 'ENOENT') {
      return res.status(404).json({
        ok: false,
        error: 'file_not_found',
        message: 'Файл не найден'
      });
    }

    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return res.status(500).json({
        ok: false,
        error: 'file_permission_error',
        message: 'Ошибка доступа к файлу'
      });
    }

    // Синтаксические ошибки JSON
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_json',
        message: 'Неверный формат JSON'
      });
    }

    // Общая серверная ошибка
    return res.status(500).json({
      ok: false,
      error: 'internal_server_error',
      message: 'Внутренняя ошибка сервера'
    });
  }

  // Обработчик для маршрутов, которые не найдены
  static notFound(req, res, next) {
    const error = new Error(`Маршрут ${req.originalUrl} не найден`);
    error.statusCode = 404;
    error.code = 'route_not_found';
    error.isCustomError = true;
    
    next(error);
  }

  // Async wrapper для контроллеров
  static asyncWrapper(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Создание кастомной ошибки
  static createError(message, statusCode = 500, code = 'custom_error') {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.isCustomError = true;
    return error;
  }

  // Обработчик для необработанных rejection'ов
  static handleUnhandledRejection() {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // Логируем ошибку, но не завершаем процесс в продакшене
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    });
  }

  // Обработчик для необработанных исключений
  static handleUncaughtException() {
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }
}

export default ErrorHandlerMiddleware;