import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ValidationMiddleware from '../middlewares/validation.middleware.js';
import { validateLogin, validateChangePassword, validateChangeEmail } from '../validations/auth.validation.js';

const router = express.Router();

// POST /api/admin/login - вход в админку
router.post('/login', 
  ValidationMiddleware.validateBody(validateLogin),
  AuthController.login
);

// POST /api/admin/logout - выход из админки
router.post('/logout', AuthController.logout);

// GET /api/admin/me - получить данные текущего админа
router.get('/me', 
  AuthMiddleware.verifyToken,
  AuthController.getProfile
);

// PATCH /api/admin/change-password - изменить пароль
router.patch('/change-password',
  AuthMiddleware.verifyToken,
  ValidationMiddleware.validateBody(validateChangePassword),
  AuthController.changePassword
);

// PATCH /api/admin/change-email - изменить email
router.patch('/change-email',
  AuthMiddleware.verifyToken,
  ValidationMiddleware.validateBody(validateChangeEmail),
  AuthController.changeEmail
);

// POST /api/admin/refresh - обновить токен
router.post('/refresh',
  AuthMiddleware.quickTokenCheck,
  AuthController.refreshToken
);

// GET /api/admin/check-auth - быстрая проверка авторизации
router.get('/check-auth',
  AuthMiddleware.optionalAuth,
  AuthController.checkAuth
);

export default router;