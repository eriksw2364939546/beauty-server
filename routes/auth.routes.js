import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import { validateLogin, validateChangePassword, validateChangeEmail } from '../validations/auth.validation.js';

const router = express.Router();

// POST /api/admin/login - вход в админку
router.post('/login', 
  validationMiddleware.validateBody(validateLogin),
  AuthController.login
);

// POST /api/admin/logout - выход из админки
router.post('/logout', AuthController.logout);

// GET /api/admin/me - получить данные текущего админа
router.get('/me', 
  authMiddleware.verifyToken,
  AuthController.getProfile
);

// PATCH /api/admin/change-password - изменить пароль
router.patch('/change-password',
  authMiddleware.verifyToken,
  validationMiddleware.validateBody(validateChangePassword),
  AuthController.changePassword
);

// PATCH /api/admin/change-email - изменить email
router.patch('/change-email',
  authMiddleware.verifyToken,
  validationMiddleware.validateBody(validateChangeEmail),
  AuthController.changeEmail
);

// POST /api/admin/refresh - обновить токен
router.post('/refresh',
  authMiddleware.quickTokenCheck,
  AuthController.refreshToken
);

// GET /api/admin/check-auth - быстрая проверка авторизации
router.get('/check-auth',
  authMiddleware.optionalAuth,
  AuthController.checkAuth
);

export default router;