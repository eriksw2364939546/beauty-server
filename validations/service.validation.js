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
      'string.min': 'Название услуги должно содержать минимум 2 символа',
      'string.max': 'Название услуги не должно превышать 200 символов',
      'any.required': 'Название услуги обязательно',
      'string.empty': 'Название услуги не может быть пустым'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Описание услуги должно содержать минимум 10 символов',
      'string.max': 'Описание услуги не должно превышать 2000 символов',
      'any.required': 'Описание услуги обязательно',
      'string.empty': 'Описание услуги не может быть пустым'
    }),

  categorySlug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Категория должна содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов',
      'any.required': 'Категория услуги обязательна',
      'string.empty': 'Категория услуги не может быть пустой'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.pattern.base': 'Slug может содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 200 символов'
    })
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
      'string.min': 'Название услуги должно содержать минимум 2 символа',
      'string.max': 'Название услуги не должно превышать 200 символов',
      'string.empty': 'Название услуги не может быть пустым'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .optional()
    .messages({
      'string.min': 'Описание услуги должно содержать минимум 10 символов',
      'string.max': 'Описание услуги не должно превышать 2000 символов',
      'string.empty': 'Описание услуги не может быть пустым'
    }),

  categorySlug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Категория должна содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов',
      'string.empty': 'Категория услуги не может быть пустой'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.pattern.base': 'Slug может содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 200 символов'
    })
}).min(1).messages({
  'object.min': 'Необходимо указать хотя бы одно поле для обновления'
});

/**
 * Схема валидации параметров URL
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
    .max(200)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат slug услуги',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 200 символов'
    }),

  categorySlug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат slug категории',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов'
    })
});

/**
 * Схема валидации query параметров для фильтрации услуг
 */
export const validateServiceQuery = Joi.object({
  category: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Категория должна содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов'
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
    .default(20)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 100'
    }),

  sort: Joi.string()
    .valid('title', 'createdAt', '-title', '-createdAt')
    .default('-createdAt')
    .optional()
    .messages({
      'any.only': 'Сортировка должна быть одним из: title, createdAt (с - для убывания)'
    }),

  search: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Поисковый запрос должен содержать минимум 2 символа',
      'string.max': 'Поисковый запрос не должен превышать 100 символов'
    })
});

/**
 * Схема валидации slug параметра для получения услуги по slug
 */
export const validateSlugParam = Joi.object({
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат slug',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 200 символов',
      'any.required': 'Slug обязателен'
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
 * Схема валидации categorySlug параметра
 */
export const validateCategorySlugParam = Joi.object({
  categorySlug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат slug категории',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов',
      'any.required': 'Slug категории обязателен'
    })
});

/**
 * Схема валидации для поиска услуг
 */
export const validateServiceSearch = Joi.object({
  query: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Поисковый запрос должен содержать минимум 2 символа',
      'string.max': 'Поисковый запрос не должен превышать 100 символов',
      'any.required': 'Поисковый запрос обязателен',
      'string.empty': 'Поисковый запрос не может быть пустым'
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
    .default(20)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 100'
    })
});

// Экспорт всех схем как объект для удобства
export const serviceValidationSchemas = {
  create: validateService,
  update: validateServiceUpdate,
  params: validateServiceParams,
  query: validateServiceQuery,
  slugParam: validateSlugParam,
  idParam: validateIdParam,
  categorySlugParam: validateCategorySlugParam,
  search: validateServiceSearch
};

export default serviceValidationSchemas;