import express from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import { validateLogin, validateUpdateProfile } from '../validations/auth.validation.js';

const router = express.Router();

// POST /api/admin/login - вход в админку
router.post('/login',
  validationMiddleware.validateBody(validateLogin),
  AuthController.login.bind(AuthController)
);

// POST /api/admin/logout - выход из админки
router.post('/logout', AuthController.logout.bind(AuthController));

// GET /api/admin/me - получить данные текущего админа
router.get('/me',
  authMiddleware.verifyToken.bind(authMiddleware),
  AuthController.me.bind(AuthController)
);

// PUT /api/admin/profile - обновить профиль (email и/или пароль)
router.put('/profile',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateBody(validateUpdateProfile),
  AuthController.updateProfile.bind(AuthController)
);

// GET /api/admin/verify - проверить токен
router.get('/verify',
  authMiddleware.verifyToken.bind(authMiddleware),
  AuthController.verifyToken.bind(AuthController)
);

// POST /api/admin/init - инициализация (создание дефолтного админа)
router.post('/init', AuthController.initializeAdmin.bind(AuthController));

export default router;