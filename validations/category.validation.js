import Joi from 'joi';

/**
 * Схема валидации для создания категории
 */
export const validateCategory = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Название категории должно содержать минимум 2 символа',
      'string.max': 'Название категории не должно превышать 100 символов',
      'any.required': 'Название категории обязательно',
      'string.empty': 'Название категории не может быть пустым'
    }),

  section: Joi.string()
    .valid('service', 'price', 'product')
    .required()
    .messages({
      'any.only': 'Раздел должен быть одним из: service, price, product',
      'any.required': 'Раздел категории обязателен',
      'string.empty': 'Раздел категории не может быть пустым'
    }),

  sortOrder: Joi.number()
    .integer()
    .min(0)
    .max(9999)
    .default(0)
    .messages({
      'number.base': 'Порядок сортировки должен быть числом',
      'number.integer': 'Порядок сортировки должен быть целым числом',
      'number.min': 'Порядок сортировки не может быть отрицательным',
      'number.max': 'Порядок сортировки не должен превышать 9999'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Slug может содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 100 символов'
    })
});

/**
 * Схема валидации для обновления категории
 */
export const validateCategoryUpdate = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Название категории должно содержать минимум 2 символа',
      'string.max': 'Название категории не должно превышать 100 символов',
      'string.empty': 'Название категории не может быть пустым'
    }),

  section: Joi.string()
    .valid('service', 'price', 'product')
    .optional()
    .messages({
      'any.only': 'Раздел должен быть одним из: service, work, price, product',
      'string.empty': 'Раздел категории не может быть пустым'
    }),

  sortOrder: Joi.number()
    .integer()
    .min(0)
    .max(9999)
    .optional()
    .messages({
      'number.base': 'Порядок сортировки должен быть числом',
      'number.integer': 'Порядок сортировки должен быть целым числом',
      'number.min': 'Порядок сортировки не может быть отрицательным',
      'number.max': 'Порядок сортировки не должен превышать 9999'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Slug может содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 100 символов'
    })
}).min(1).messages({
  'object.min': 'Необходимо указать хотя бы одно поле для обновления'
});

/**
 * Схема валидации параметров URL (ID)
 */
export const validateCategoryParams = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID категории',
      'any.required': 'ID категории обязателен'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат slug',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 100 символов'
    })
});

/**
 * Схема валидации query параметров для фильтрации категорий
 */
export const validateCategoryQuery = Joi.object({
  section: Joi.string()
    .valid('service', 'price', 'product')
    .optional()
    .messages({
      'any.only': 'Раздел должен быть одним из: service, work, price, product'
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
    .valid('title', 'sortOrder', 'createdAt', '-title', '-sortOrder', '-createdAt')
    .default('sortOrder')
    .optional()
    .messages({
      'any.only': 'Сортировка должна быть одним из: title, sortOrder, createdAt (с - для убывания)'
    })
});

/**
 * Схема валидации для обновления порядка сортировки
 */
export const validateSortOrderUpdate = Joi.object({
  sortOrder: Joi.number()
    .integer()
    .min(0)
    .max(9999)
    .required()
    .messages({
      'number.base': 'Порядок сортировки должен быть числом',
      'number.integer': 'Порядок сортировки должен быть целым числом',
      'number.min': 'Порядок сортировки не может быть отрицательным',
      'number.max': 'Порядок сортировки не должен превышать 9999',
      'any.required': 'Порядок сортировки обязателен'
    })
});

/**
 * Схема валидации для массового обновления порядка сортировки
 */
export const validateBulkSortOrderUpdate = Joi.object({
  categories: Joi.array()
    .items(
      Joi.object({
        id: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            'string.pattern.base': 'Некорректный формат ID категории',
            'any.required': 'ID категории обязателен'
          }),
        sortOrder: Joi.number()
          .integer()
          .min(0)
          .max(9999)
          .required()
          .messages({
            'number.base': 'Порядок сортировки должен быть числом',
            'number.integer': 'Порядок сортировки должен быть целым числом',
            'number.min': 'Порядок сортировки не может быть отрицательным',
            'number.max': 'Порядок сортировки не должен превышать 9999',
            'any.required': 'Порядок сортировки обязателен'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'Необходимо указать хотя бы одну категорию',
      'any.required': 'Список категорий обязателен'
    })
});

/**
 * Схема валидации slug параметра
 */
export const validateSlugParam = Joi.object({
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат slug',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 100 символов',
      'any.required': 'Slug обязателен'
    })
});

// Экспорт всех схем как объект для удобства
export const categoryValidationSchemas = {
  create: validateCategory,
  update: validateCategoryUpdate,
  params: validateCategoryParams,
  query: validateCategoryQuery,
  sortOrder: validateSortOrderUpdate,
  bulkSortOrder: validateBulkSortOrderUpdate,
  slugParam: validateSlugParam
};

export default categoryValidationSchemas;