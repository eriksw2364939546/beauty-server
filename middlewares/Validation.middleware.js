/**
 * Middleware для валидации данных с использованием Joi
 */

class ValidationMiddleware {
  // Основной метод валидации с использованием Joi схем
  static validate(schema, source = 'body') {
    return (req, res, next) => {
      try {
        // Выбираем источник данных для валидации
        let dataToValidate;
        
        switch (source) {
          case 'body':
            dataToValidate = req.body;
            break;
          case 'params':
            dataToValidate = req.params;
            break;
          case 'query':
            dataToValidate = req.query;
            break;
          case 'headers':
            dataToValidate = req.headers;
            break;
          default:
            dataToValidate = req.body;
        }

        // Выполняем валидацию
        const { error, value } = schema.validate(dataToValidate, {
          abortEarly: false,
          allowUnknown: false,
          stripUnknown: true
        });

        if (error) {
          return res.status(400).json({
            ok: false,
            error: 'validation_error',
            message: 'Ошибка валидации данных',
            details: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value
            }))
          });
        }

        // Заменяем оригинальные данные на валидированные
        switch (source) {
          case 'body':
            req.body = value;
            break;
          case 'params':
            req.params = value;
            break;
          case 'query':
            req.query = value;
            break;
          case 'headers':
            req.headers = value;
            break;
        }

        next();
      } catch (validationError) {
        console.error('Validation middleware error:', validationError);
        return res.status(500).json({
          ok: false,
          error: 'validation_middleware_error',
          message: 'Ошибка в middleware валидации'
        });
      }
    };
  }

  // Валидация тела запроса
  static validateBody(schema) {
    return ValidationMiddleware.validate(schema, 'body');
  }

  // Валидация параметров URL
  static validateParams(schema) {
    return ValidationMiddleware.validate(schema, 'params');
  }

  // Валидация query параметров
  static validateQuery(schema) {
    return ValidationMiddleware.validate(schema, 'query');
  }

  // Валидация заголовков
  static validateHeaders(schema) {
    return ValidationMiddleware.validate(schema, 'headers');
  }

  // Комбинированная валидация нескольких источников
  static validateMultiple(schemas) {
    return async (req, res, next) => {
      try {
        const errors = [];

        if (schemas.body) {
          const { error, value } = schemas.body.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
          });
          
          if (error) {
            errors.push(...error.details.map(detail => ({
              source: 'body',
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value
            })));
          } else {
            req.body = value;
          }
        }

        if (schemas.params) {
          const { error, value } = schemas.params.validate(req.params, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
          });
          
          if (error) {
            errors.push(...error.details.map(detail => ({
              source: 'params',
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value
            })));
          } else {
            req.params = value;
          }
        }

        if (schemas.query) {
          const { error, value } = schemas.query.validate(req.query, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
          });
          
          if (error) {
            errors.push(...error.details.map(detail => ({
              source: 'query',
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value
            })));
          } else {
            req.query = value;
          }
        }

        if (errors.length > 0) {
          return res.status(400).json({
            ok: false,
            error: 'validation_error',
            message: 'Ошибка валидации данных',
            details: errors
          });
        }

        next();
      } catch (validationError) {
        console.error('Multiple validation middleware error:', validationError);
        return res.status(500).json({
          ok: false,
          error: 'validation_middleware_error',
          message: 'Ошибка в middleware валидации'
        });
      }
    };
  }

  // Проверка обязательных полей
  static requireFields(fields, source = 'body') {
    return (req, res, next) => {
      const data = req[source];
      const missingFields = [];

      fields.forEach(field => {
        if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        return res.status(400).json({
          ok: false,
          error: 'missing_required_fields',
          message: 'Отсутствуют обязательные поля',
          details: missingFields.map(field => ({
            field,
            message: `Поле '${field}' обязательно`
          }))
        });
      }

      next();
    };
  }
}

/**
 * Функция-обёртка для использования как validationMiddleware(schema)
 * По умолчанию валидирует body
 */
const validationMiddleware = (schema, source = 'body') => {
  return ValidationMiddleware.validate(schema, source);
};

// Добавляем статические методы к функции
validationMiddleware.validate = ValidationMiddleware.validate;
validationMiddleware.validateBody = ValidationMiddleware.validateBody;
validationMiddleware.validateParams = ValidationMiddleware.validateParams;
validationMiddleware.validateQuery = ValidationMiddleware.validateQuery;
validationMiddleware.validateHeaders = ValidationMiddleware.validateHeaders;
validationMiddleware.validateMultiple = ValidationMiddleware.validateMultiple;
validationMiddleware.requireFields = ValidationMiddleware.requireFields;

export default validationMiddleware;
export { ValidationMiddleware, validationMiddleware };