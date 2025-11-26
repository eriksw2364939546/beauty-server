import Joi from 'joi';

/**
 * Схема валидации для входа в систему
 */
export const validateLogin = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен',
      'string.empty': 'Email не может быть пустым'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'any.required': 'Пароль обязателен',
      'string.empty': 'Пароль не может быть пустым'
    })
});

/**
 * Схема валидации для смены пароля
 */
export const validateChangePassword = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Текущий пароль обязателен',
      'string.empty': 'Текущий пароль не может быть пустым'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Новый пароль должен содержать минимум 6 символов',
      'string.max': 'Новый пароль не должен превышать 128 символов',
      'string.pattern.base': 'Новый пароль должен содержать хотя бы одну букву и одну цифру',
      'any.required': 'Новый пароль обязателен',
      'string.empty': 'Новый пароль не может быть пустым'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Подтверждение пароля не совпадает с новым паролем',
      'any.required': 'Подтверждение пароля обязательно',
      'string.empty': 'Подтверждение пароля не может быть пустым'
    })
});

/**
 * Схема валидации для смены email
 */
export const validateChangeEmail = Joi.object({
  newEmail: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат нового email',
      'any.required': 'Новый email обязателен',
      'string.empty': 'Новый email не может быть пустым'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Пароль обязателен для подтверждения',
      'string.empty': 'Пароль не может быть пустым'
    })
});

/**
 * Схема валидации для создания нового администратора
 */
export const validateCreateAdmin = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен',
      'string.empty': 'Email не может быть пустым'
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'string.max': 'Пароль не должен превышать 128 символов',
      'string.pattern.base': 'Пароль должен содержать хотя бы одну букву и одну цифру',
      'any.required': 'Пароль обязателен',
      'string.empty': 'Пароль не может быть пустым'
    }),

  role: Joi.string()
    .valid('admin')
    .default('admin')
    .messages({
      'any.only': 'Роль может быть только admin'
    })
});

/**
 * Схема валидации для восстановления пароля (если понадобится)
 */
export const validatePasswordReset = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'any.required': 'Email обязателен',
      'string.empty': 'Email не может быть пустым'
    })
});

/**
 * Схема валидации для установки нового пароля после восстановления
 */
export const validatePasswordResetConfirm = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Токен восстановления обязателен',
      'string.empty': 'Токен не может быть пустым'
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'string.max': 'Пароль не должен превышать 128 символов',
      'string.pattern.base': 'Пароль должен содержать хотя бы одну букву и одну цифру',
      'any.required': 'Новый пароль обязателен',
      'string.empty': 'Пароль не может быть пустым'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Подтверждение пароля не совпадает с новым паролем',
      'any.required': 'Подтверждение пароля обязательно',
      'string.empty': 'Подтверждение пароля не может быть пустым'
    })
});

/**
 * Схема валидации refresh токена
 */
export const validateRefreshToken = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh токен обязателен',
      'string.empty': 'Refresh токен не может быть пустым'
    })
});

/**
 * Схема валидации для проверки токена
 */
export const validateTokenCheck = Joi.object({
  token: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Токен должен быть строкой'
    })
});

// Экспорт всех схем как объект для удобства
export const authValidationSchemas = {
  login: validateLogin,
  changePassword: validateChangePassword,
  changeEmail: validateChangeEmail,
  createAdmin: validateCreateAdmin,
  passwordReset: validatePasswordReset,
  passwordResetConfirm: validatePasswordResetConfirm,
  refreshToken: validateRefreshToken,
  tokenCheck: validateTokenCheck
};

export default authValidationSchemas;