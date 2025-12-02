import Joi from 'joi';

/**
 * Схема валидации для создания расценки
 */
export const validatePrice = Joi.object({
    title: Joi.string()
        .trim()
        .min(2)
        .max(200)
        .required()
        .messages({
            'string.min': 'Название должно содержать минимум 2 символа',
            'string.max': 'Название не должно превышать 200 символов',
            'any.required': 'Название расценки обязательно',
            'string.empty': 'Название расценки не может быть пустым'
        }),

    description: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Описание не должно превышать 500 символов'
        }),

    price: Joi.number()
        .min(0)
        .max(9999999)
        .required()
        .messages({
            'number.base': 'Цена должна быть числом',
            'number.min': 'Цена не может быть отрицательной',
            'number.max': 'Цена не должна превышать 9999999',
            'any.required': 'Цена обязательна'
        }),

    serviceId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'Некорректный формат ID услуги',
            'any.required': 'Услуга обязательна',
            'string.empty': 'Услуга не может быть пустой'
        }),

    sortOrder: Joi.number()
        .integer()
        .min(0)
        .max(9999)
        .default(0)
        .optional()
        .messages({
            'number.base': 'Порядок сортировки должен быть числом',
            'number.integer': 'Порядок сортировки должен быть целым числом',
            'number.min': 'Порядок сортировки не может быть отрицательным',
            'number.max': 'Порядок сортировки не должен превышать 9999'
        })
});

/**
 * Схема валидации для обновления расценки
 */
export const validatePriceUpdate = Joi.object({
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
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Описание не должно превышать 500 символов'
        }),

    price: Joi.number()
        .min(0)
        .max(9999999)
        .optional()
        .messages({
            'number.base': 'Цена должна быть числом',
            'number.min': 'Цена не может быть отрицательной',
            'number.max': 'Цена не должна превышать 9999999'
        }),

    serviceId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Некорректный формат ID услуги'
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
        })
}).min(1).messages({
    'object.min': 'Необходимо указать хотя бы одно поле для обновления'
});

/**
 * Схема валидации query параметров
 */
export const validatePriceQuery = Joi.object({
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

    search: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Поисковый запрос должен содержать минимум 2 символа',
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
        .default(50)
        .optional()
        .messages({
            'number.base': 'Лимит должен быть числом',
            'number.integer': 'Лимит должен быть целым числом',
            'number.min': 'Лимит должен быть больше 0',
            'number.max': 'Лимит не должен превышать 100'
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
            'string.pattern.base': 'Некорректный формат ID расценки',
            'any.required': 'ID расценки обязателен'
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

/**
 * Схема валидации для обновления порядка сортировки
 */
export const validateSortOrder = Joi.object({
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

// Экспорт всех схем как объект для удобства
export const priceValidationSchemas = {
    create: validatePrice,
    update: validatePriceUpdate,
    query: validatePriceQuery,
    idParam: validateIdParam,
    serviceIdParam: validateServiceIdParam,
    categoryIdParam: validateCategoryIdParam,
    sortOrder: validateSortOrder
};

export default priceValidationSchemas;