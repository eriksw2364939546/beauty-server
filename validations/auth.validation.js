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
 * Схема валидации для обновления профиля (универсальная)
 * Можно менять email, пароль или оба сразу
 * Обязательно нужен текущий пароль для подтверждения
 */
export const validateUpdateProfile = Joi.object({
  // Текущий пароль — обязателен для любых изменений
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Текущий пароль обязателен для подтверждения',
      'string.empty': 'Текущий пароль не может быть пустым'
    }),

  // Новый email — опционально
  newEmail: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Некорректный формат email',
      'string.empty': 'Email не может быть пустым'
    }),

  // Новый пароль — опционально
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .optional()
    .messages({
      'string.min': 'Новый пароль должен содержать минимум 6 символов',
      'string.max': 'Новый пароль не должен превышать 128 символов',
      'string.empty': 'Новый пароль не может быть пустым'
    })
})
  // Проверяем что хотя бы одно из полей (newEmail или newPassword) указано
  .custom((value, helpers) => {
    if (!value.newEmail && !value.newPassword) {
      return helpers.error('custom.atLeastOne');
    }
    return value;
  })
  .messages({
    'custom.atLeastOne': 'Необходимо указать новый email или новый пароль'
  });

/**
 * Схема валидации для смены пароля (отдельная, если понадобится)
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
    .required()
    .messages({
      'string.min': 'Новый пароль должен содержать минимум 6 символов',
      'string.max': 'Новый пароль не должен превышать 128 символов',
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
 * Схема валидации для смены email (отдельная, если понадобится)
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

  currentPassword: Joi.string()
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
    .required()
    .messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'string.max': 'Пароль не должен превышать 128 символов',
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

// Экспорт всех схем как объект для удобства
export const authValidationSchemas = {
  login: validateLogin,
  updateProfile: validateUpdateProfile,
  changePassword: validateChangePassword,
  changeEmail: validateChangeEmail,
  createAdmin: validateCreateAdmin
};

export default authValidationSchemas;