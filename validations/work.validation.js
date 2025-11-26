import Joi from 'joi';

/**
 * Схема валидации для создания работы
 */
export const validateWork = Joi.object({
  categorySlug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Категория должна содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов',
      'any.required': 'Категория работы обязательна',
      'string.empty': 'Категория работы не может быть пустой'
    })
  // Примечание: изображение обязательно, но валидируется в middleware uploadPhoto
});

/**
 * Схема валидации параметров URL для работ
 */
export const validateWorkParams = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID работы'
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
 * Схема валидации query параметров для фильтрации работ
 */
export const validateWorkQuery = Joi.object({
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
    .max(50)
    .default(12)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 50 (для работ рекомендуется меньше)'
    }),

  sort: Joi.string()
    .valid('createdAt', '-createdAt', 'categorySlug', '-categorySlug')
    .default('-createdAt')
    .optional()
    .messages({
      'any.only': 'Сортировка должна быть одним из: createdAt, categorySlug (с - для убывания)'
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
 * Схема валидации для получения последних работ (для главной страницы)
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
      'number.max': 'Лимит для последних работ не должен превышать 20'
    }),

  category: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Категория должна содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов'
    })
});

/**
 * Схема валидации для получения случайных работ (для рекомендаций)
 */
export const validateRandomWorksQuery = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .default(4)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит для случайных работ не должен превышать 12'
    }),

  excludeCategory: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Категория должна содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug категории должен содержать минимум 2 символа',
      'string.max': 'Slug категории не должен превышать 100 символов'
    }),

  excludeIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Некорректный формат ID работы'
        })
    )
    .max(10)
    .optional()
    .messages({
      'array.max': 'Можно исключить максимум 10 работ'
    })
});

/**
 * Схема валидации для статистики работ по категориям
 */
export const validateWorkStatsQuery = Joi.object({
  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year', 'all')
    .default('month')
    .optional()
    .messages({
      'any.only': 'Период должен быть одним из: week, month, quarter, year, all'
    }),

  groupBy: Joi.string()
    .valid('category', 'date', 'both')
    .default('category')
    .optional()
    .messages({
      'any.only': 'Группировка должна быть одной из: category, date, both'
    })
});

// Экспорт всех схем как объект для удобства
export const workValidationSchemas = {
  create: validateWork,
  params: validateWorkParams,
  query: validateWorkQuery,
  idParam: validateIdParam,
  categorySlugParam: validateCategorySlugParam,
  latestQuery: validateLatestWorksQuery,
  randomQuery: validateRandomWorksQuery,
  statsQuery: validateWorkStatsQuery
};

export default workValidationSchemas;