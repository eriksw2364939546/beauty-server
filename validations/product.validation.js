import Joi from 'joi';

/**
 * Схема валидации для создания товара
 */
export const validateProduct = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(300)
    .required()
    .messages({
      'string.min': 'Название товара должно содержать минимум 2 символа',
      'string.max': 'Название товара не должно превышать 300 символов',
      'any.required': 'Название товара обязательно',
      'string.empty': 'Название товара не может быть пустым'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(3000)
    .required()
    .messages({
      'string.min': 'Описание товара должно содержать минимум 10 символов',
      'string.max': 'Описание товара не должно превышать 3000 символов',
      'any.required': 'Описание товара обязательно',
      'string.empty': 'Описание товара не может быть пустым'
    }),

  price: Joi.number()
    .min(0)
    .max(999999.99)
    .precision(2)
    .required()
    .messages({
      'number.base': 'Цена должна быть числом',
      'number.min': 'Цена не может быть отрицательной',
      'number.max': 'Цена не должна превышать 999,999.99',
      'number.precision': 'Цена может иметь максимум 2 знака после запятой',
      'any.required': 'Цена товара обязательна'
    }),

  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9\-]{2,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Артикул должен содержать только заглавные буквы, цифры и дефисы (2-20 символов)',
      'any.required': 'Артикул товара обязателен',
      'string.empty': 'Артикул товара не может быть пустым'
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
      'any.required': 'Категория товара обязательна',
      'string.empty': 'Категория товара не может быть пустой'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(300)
    .optional()
    .messages({
      'string.pattern.base': 'Slug может содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 300 символов'
    })
  // Примечание: изображение обязательно, но валидируется в middleware uploadPhoto
});

/**
 * Схема валидации для обновления товара
 */
export const validateProductUpdate = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(300)
    .optional()
    .messages({
      'string.min': 'Название товара должно содержать минимум 2 символа',
      'string.max': 'Название товара не должно превышать 300 символов',
      'string.empty': 'Название товара не может быть пустым'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(3000)
    .optional()
    .messages({
      'string.min': 'Описание товара должно содержать минимум 10 символов',
      'string.max': 'Описание товара не должно превышать 3000 символов',
      'string.empty': 'Описание товара не может быть пустым'
    }),

  price: Joi.number()
    .min(0)
    .max(999999.99)
    .precision(2)
    .optional()
    .messages({
      'number.base': 'Цена должна быть числом',
      'number.min': 'Цена не может быть отрицательной',
      'number.max': 'Цена не должна превышать 999,999.99',
      'number.precision': 'Цена может иметь максимум 2 знака после запятой'
    }),

  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9\-]{2,20}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Артикул должен содержать только заглавные буквы, цифры и дефисы (2-20 символов)',
      'string.empty': 'Артикул товара не может быть пустым'
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
      'string.empty': 'Категория товара не может быть пустой'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(300)
    .optional()
    .messages({
      'string.pattern.base': 'Slug может содержать только строчные буквы, цифры и дефисы',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 300 символов'
    })
  // Примечание: изображение опциональное при обновлении
}).min(1).messages({
  'object.min': 'Необходимо указать хотя бы одно поле для обновления'
});

/**
 * Схема валидации параметров URL для товаров
 */
export const validateProductParams = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат ID товара'
    }),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(2)
    .max(300)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат slug товара',
      'string.min': 'Slug должен содержать минимум 2 символа',
      'string.max': 'Slug не должен превышать 300 символов'
    }),

  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9\-]{2,20}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Некорректный формат артикула',
      'string.empty': 'Артикул не может быть пустым'
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
 * Схема валидации query параметров для фильтрации товаров
 */
export const validateProductQuery = Joi.object({
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

  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Поисковый запрос должен содержать минимум 1 символ',
      'string.max': 'Поисковый запрос не должен превышать 100 символов'
    }),

  minPrice: Joi.number()
    .min(0)
    .max(999999.99)
    .optional()
    .messages({
      'number.base': 'Минимальная цена должна быть числом',
      'number.min': 'Минимальная цена не может быть отрицательной',
      'number.max': 'Минимальная цена не должна превышать 999,999.99'
    }),

  maxPrice: Joi.number()
    .min(0)
    .max(999999.99)
    .when('minPrice', {
      is: Joi.exist(),
      then: Joi.number().greater(Joi.ref('minPrice')),
      otherwise: Joi.number()
    })
    .optional()
    .messages({
      'number.base': 'Максимальная цена должна быть числом',
      'number.min': 'Максимальная цена не может быть отрицательной',
      'number.max': 'Максимальная цена не должна превышать 999,999.99',
      'number.greater': 'Максимальная цена должна быть больше минимальной'
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
    .valid('title', '-title', 'price', '-price', 'code', '-code', 'createdAt', '-createdAt')
    .default('-createdAt')
    .optional()
    .messages({
      'any.only': 'Сортировка должна быть одной из: title, price, code, createdAt (с - для убывания)'
    })
});

/**
 * Схема валидации для поиска товаров
 */
export const validateProductSearch = Joi.object({
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
    .default(12)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит не должен превышать 100'
    })
});

/**
 * Схема валидации для получения рекомендуемых товаров
 */
export const validateFeaturedProductsQuery = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .default(8)
    .optional()
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.integer': 'Лимит должен быть целым числом',
      'number.min': 'Лимит должен быть больше 0',
      'number.max': 'Лимит для рекомендуемых товаров не должен превышать 20'
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
    }),

  excludeIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Некорректный формат ID товара'
        })
    )
    .max(10)
    .optional()
    .messages({
      'array.max': 'Можно исключить максимум 10 товаров'
    })
});

/**
 * Схема валидации параметра артикула
 */
export const validateCodeParam = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9\-]{2,20}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат артикула',
      'any.required': 'Артикул обязателен',
      'string.empty': 'Артикул не может быть пустым'
    })
});

/**
 * Схема валидации параметра slug
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

/**
 * Схема валидации ID параметра
 */
export const validateIdParam = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID товара',
      'any.required': 'ID товара обязателен'
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

// Экспорт всех схем как объект для удобства
export const productValidationSchemas = {
  create: validateProduct,
  update: validateProductUpdate,
  params: validateProductParams,
  query: validateProductQuery,
  search: validateProductSearch,
  featured: validateFeaturedProductsQuery,
  codeParam: validateCodeParam,
  slugParam: validateSlugParam,
  idParam: validateIdParam,
  categorySlugParam: validateCategorySlugParam
};

export default productValidationSchemas;