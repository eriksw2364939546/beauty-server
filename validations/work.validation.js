import Joi from 'joi';

/**
 * Схема валидации для создания работы
 */
export const validateWork = Joi.object({
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории',
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

  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории'
    })
});

/**
 * Схема валидации query параметров для фильтрации работ
 */
export const validateWorkQuery = Joi.object({
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
    }),

  sort: Joi.string()
    .valid('createdAt', '-createdAt')
    .default('-createdAt')
    .optional()
    .messages({
      'any.only': 'Сортировка должна быть одной из: createdAt (с - для убывания)'
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
 * Схема валидации для получения последних работ
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
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории'
    })
});

/**
 * Схема валидации для получения случайных работ
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

  category: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории'
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

// Экспорт всех схем как объект для удобства
export const workValidationSchemas = {
  create: validateWork,
  params: validateWorkParams,
  query: validateWorkQuery,
  idParam: validateIdParam,
  categoryIdParam: validateCategoryIdParam,
  latestQuery: validateLatestWorksQuery,
  randomQuery: validateRandomWorksQuery
};

export default workValidationSchemas;