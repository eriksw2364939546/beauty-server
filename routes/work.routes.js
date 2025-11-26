import express from 'express';
import WorkController from '../controllers/work.controller.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ValidationMiddleware from '../middlewares/validation.middleware.js';
import UploadPhotoMiddleware from '../middlewares/uploadPhoto.middleware.js';
import { 
  validateWork, 
  validateWorkParams,
  validateWorkQuery 
} from '../validations/work.validation.js';

const router = express.Router();

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/works - получить все работы
router.get('/', 
  ValidationMiddleware.validateQuery(validateWorkQuery),
  WorkController.getAll
);

// GET /api/works/:id - получить работу по ID
router.get('/:id', 
  ValidationMiddleware.validateParams(validateWorkParams),
  WorkController.getById
);

// GET /api/works/by-category/:categorySlug - работы по категории
router.get('/by-category/:categorySlug', 
  ValidationMiddleware.validateQuery(validateWorkQuery),
  WorkController.getByCategory
);

// GET /api/works/latest - получить последние работы (для главной страницы)
router.get('/latest', 
  ValidationMiddleware.validateQuery(validateWorkQuery),
  WorkController.getLatest
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(AuthMiddleware.verifyToken);

// POST /api/admin/works - создать работу
router.post('/', 
  ...UploadPhotoMiddleware.single('image'),
  ValidationMiddleware.validateBody(validateWork),
  WorkController.create
);

// DELETE /api/admin/works/:id - удалить работу
router.delete('/:id',
  ValidationMiddleware.validateParams(validateWorkParams),
  WorkController.delete
);

export default router;