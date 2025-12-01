import Joi from 'joi';

/**
 * Схема валидации для создания услуги
 */
export const validateService = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Название должно содержать минимум 2 символа',
      'string.max': 'Название не должно превышать 200 символов',
      'any.required': 'Название услуги обязательно',
      'string.empty': 'Название услуги не может быть пустым'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Описание должно содержать минимум 10 символов',
      'string.max': 'Описание не должно превышать 2000 символов',
      'any.required': 'Описание услуги обязательно',
      'string.empty': 'Описание услуги не может быть пустым'
    }),

  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории',
      'any.required': 'Категория услуги обязательна',
      'string.empty': 'Категория услуги не может быть пустой'
    })
  // Примечание: изображение обязательно, но валидируется в middleware uploadPhoto
});

/**
 * Схема валидации для обновления услуги
 */
export const validateServiceUpdate = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Название должно содержать минимум 2 символа',
      'string.max': 'Название не должно превышать 200 символов'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .optional()
    .messages({
      'string.min': 'Описание должно содержать минимум 10 символов',
      'string.max': 'Описание не должно превышать 2000 символов'
    }),

  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории'
    })
});

/**
 * Схема валидации параметров URL для услуг
 */
export const validateServiceParams = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID услуги'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(300)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат slug',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 300 символов'
    })
});

/**
 * Схема валидации query параметров для фильтрации услуг
 */
export const validateServiceQuery = Joi.object({
  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории'
    }),

  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Поисковый запрос должен содержать минимум 1 символ',
      'string.max': 'Поисковый запрос не должен превышать 100 символов'
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
    .max(100)
    .default(12)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 100'
    }),

  sort: Joi.string()
    .valid('title', '-title', 'createdAt', '-createdAt')
    .default('-createdAt')
    .optional()
    .messages({
      'any.only': 'Сортировка должна быть одной из: title, createdAt (с - для убывания)'
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

/**
 * Схема валидации slug параметра
 */
export const validateSlugParam = Joi.object({
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(300)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат slug',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 300 символов',
      'any.required': 'Slug обязателен'
    })
});

// Экспорт всех схем как объект для удобства
export const serviceValidationSchemas = {
  create: validateService,
  update: validateServiceUpdate,
  params: validateServiceParams,
  query: validateServiceQuery,
  idParam: validateIdParam,
  categoryIdParam: validateCategoryIdParam,
  slugParam: validateSlugParam
};

export default serviceValidationSchemas;