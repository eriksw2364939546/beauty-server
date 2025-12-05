import Joi from 'joi';

/**
 * Схема валидации для создания мастера
 */
export const validateMaster = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿА-Яа-яЁёІіЇїЄєҐґÇç\s\-\.\'’‘\-]+$/) // Поддержка латиницы с акцентами и кириллицы
    .required()
    .messages({
      'string.min': 'Полное имя должно содержать минимум 2 символа',
      'string.max': 'Полное имя не должно превышать 100 символов',
      'string.pattern.base': 'Имя может содержать только буквы, пробелы, дефисы, точки и апострофы',
      'any.required': 'Полное имя мастера обязательно',
      'string.empty': 'Полное имя мастера не может быть пустым'
    }),

  speciality: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .pattern(/^[a-zA-ZÀ-ÿА-Яа-яЁёІіЇїЄєҐґÇç0-9\s\-\.\,\'’‘:;&\+]+$/) // Буквы, цифры и основные знаки препинания
    .required()
    .messages({
      'string.min': 'Специальность должна содержать минимум 2 символа',
      'string.max': 'Специальность не должна превышать 200 символов',
      'string.pattern.base': 'Специальность может содержать буквы, цифры, пробелы и основные знаки препинания',
      'any.required': 'Специальность мастера обязательна',
      'string.empty': 'Специальность мастера не может быть пустой'
    })
});

/**
 * Схема валидации для обновления мастера
 */
export const validateMasterUpdate = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿА-Яа-яЁёІіЇїЄєҐґÇç\s\-\.\'’‘\-]+$/)
    .optional()
    .messages({
      'string.min': 'Полное имя должно содержать минимум 2 символа',
      'string.max': 'Полное имя не должно превышать 100 символов',
      'string.pattern.base': 'Имя может содержать только буквы, пробелы, дефисы, точки и апострофы'
    }),

  speciality: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .pattern(/^[a-zA-ZÀ-ÿА-Яа-яЁёІіЇїЄєҐґÇç0-9\s\-\.\,\'’‘:;&\+]+$/)
    .optional()
    .messages({
      'string.min': 'Специальность должна содержать минимум 2 символа',
      'string.max': 'Специальность не должна превышать 200 символов',
      'string.pattern.base': 'Специальность может содержать буквы, цифры, пробелы и основные знаки препинания'
    })
}).min(1).messages({
  'object.min': 'Необходимо указать хотя бы одно поле для обновления'
});

/**
 * Схема валидации для параметров мастера (ID)
 */
export const validateMasterParams = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Некорректный формат ID мастера',
      'any.required': 'ID мастера обязателен'
    })
});

/**
 * Схема валидации query параметров для фильтрации мастеров
 */
export const validateMasterQuery = Joi.object({
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
    .valid('fullName', '-fullName', 'speciality', '-speciality', 'createdAt', '-createdAt')
    .default('-createdAt')
    .optional()
    .messages({
      'any.only': 'Сортировка должна быть одной из: fullName, speciality, createdAt (с - для убывания)'
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
 * Схема валидации для получения мастеров по специальности
 */
export const validateSpecialityQuery = Joi.object({
  speciality: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Специальность должна содержать минимум 2 символа',
      'string.max': 'Специальность не должна превышать 200 символов',
      'any.required': 'Специальность обязательна',
      'string.empty': 'Специальность не может быть пустой'
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
 * Схема валидации для получения избранных мастеров (для главной страницы)
 */
export const validateFeaturedMastersQuery = Joi.object({
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
      'number.max': 'Лимит не должен превышать 12'
    })
});

/**
 * Схема валидации для поиска мастеров
 */
export const validateMasterSearch = Joi.object({
  q: Joi.string()
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
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(12)
    .optional()
});

/**
 * Схема валидации для статистики мастеров
 */
export const validateMasterStatsQuery = Joi.object({
  groupBy: Joi.string()
    .valid('speciality', 'date', 'both')
    .default('speciality')
    .optional()
    .messages({
      'any.only': 'Группировка должна быть одной из: speciality, date, both'
    }),

  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year', 'all')
    .default('all')
    .optional()
    .messages({
      'any.only': 'Период должен быть одним из: week, month, quarter, year, all'
    })
});

/**
 * Список распространенных специальностей для валидации (можно расширять)
 */
export const COMMON_SPECIALITIES = [
  'Парикмахер-стилист',
  'Мастер маникюра',
  'Мастер педикюра',
  'Визажист',
  'Бровист',
  'Лешмейкер',
  'Косметолог',
  'Массажист',
  'Колорист',
  'Барбер'
];

/**
 * Схема валидации специальности с предложениями
 */
export const validateSpecialityWithSuggestions = Joi.string()
  .trim()
  .min(2)
  .max(200)
  .custom((value, helpers) => {
    // Можно добавить логику для предложения исправлений
    const normalized = value.toLowerCase();
    const suggestions = COMMON_SPECIALITIES.filter(spec =>
      spec.toLowerCase().includes(normalized) ||
      normalized.includes(spec.toLowerCase())
    );

    if (suggestions.length > 0) {
      return value; // Валидное значение
    }

    return value; // Пропускаем любые значения, но можем логировать
  })
  .messages({
    'string.min': 'Специальность должна содержать минимум 2 символа',
    'string.max': 'Специальность не должна превышать 200 символов'
  });

// Экспорт всех схем как объект для удобства
export const masterValidationSchemas = {
  create: validateMaster,
  update: validateMasterUpdate,
  params: validateMasterParams,
  query: validateMasterQuery,
  specialityQuery: validateSpecialityQuery,
  featuredQuery: validateFeaturedMastersQuery,
  search: validateMasterSearch,
  statsQuery: validateMasterStatsQuery,
  specialityWithSuggestions: validateSpecialityWithSuggestions
};

export default masterValidationSchemas;