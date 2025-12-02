import Joi from 'joi';

/**
 * Схема валидации для создания работы
 */
export const validateWork = Joi.object({
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID услуги',
      'any.required': 'Услуга обязательна',
      'string.empty': 'Услуга не может быть пустой'
    })
  // Примечание: изображение обязательно, но валидируется в middleware uploadPhoto
});

/**
 * Схема валидации query параметров для фильтрации работ
 */
export const validateWorkQuery = Joi.object({
  service: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID услуги'
    }),

  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.base': 'Номер страницы должен быть числом',
      'number.integer': 'Номер страницы должен быть целым числом',
      'number.min': 'Номер страницы должен быть больше 0'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(12)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 50'
    })
});

/**
 * Схема валидации query параметров для последних работ
 */
export const validateLatestWorksQuery = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(6)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 20'
    })
});

/**
 * Схема валидации ID параметра
 */
export const validateIdParam = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID работы',
      'any.required': 'ID работы обязателен'
    })
});

/**
 * Схема валидации serviceId параметра
 */
export const validateServiceIdParam = Joi.object({
  serviceId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID услуги',
      'any.required': 'ID услуги обязателен'
    })
});

/**
 * Схема валидации categoryId параметра
 */
export const validateCategoryIdParam = Joi.object({
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории',
      'any.required': 'ID категории обязателен'
    })
});

// Экспорт всех схем как объект для удобства
export const workValidationSchemas = {
  create: validateWork,
  query: validateWorkQuery,
  latestQuery: validateLatestWorksQuery,
  idParam: validateIdParam,
  serviceIdParam: validateServiceIdParam,
  categoryIdParam: validateCategoryIdParam
};

export default workValidationSchemas;