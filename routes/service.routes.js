import express from 'express';
import ServiceController from '../controllers/service.controller.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ValidationMiddleware from '../middlewares/validation.middleware.js';
import UploadPhotoMiddleware from '../middlewares/uploadPhoto.middleware.js';
import { 
  validateService, 
  validateServiceUpdate, 
  validateServiceParams,
  validateServiceQuery 
} from '../validations/service.validation.js';

const router = express.Router();

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/services - получить все услуги
router.get('/', 
  ValidationMiddleware.validateQuery(validateServiceQuery),
  ServiceController.getAll
);

// GET /api/services/:slug - получить услугу по slug
router.get('/:slug', 
  ServiceController.getBySlug
);

// GET /api/services/by-category/:categorySlug - услуги по категории
router.get('/by-category/:categorySlug', 
  ValidationMiddleware.validateQuery(validateServiceQuery),
  ServiceController.getByCategory
);

// GET /api/services/id/:id - получить услугу по ID (для админки)
router.get('/id/:id', 
  ValidationMiddleware.validateParams(validateServiceParams),
  ServiceController.getById
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(AuthMiddleware.verifyToken);

// POST /api/admin/services - создать услугу
router.post('/', 
  ...UploadPhotoMiddleware.single('image'),
  ValidationMiddleware.validateBody(validateService),
  ServiceController.create
);

// PATCH /api/admin/services/:id - обновить услугу
router.patch('/:id',
  ValidationMiddleware.validateParams(validateServiceParams),
  ...UploadPhotoMiddleware.optional('image'),
  ValidationMiddleware.validateBody(validateServiceUpdate),
  ServiceController.update
);

// DELETE /api/admin/services/:id - удалить услугу
router.delete('/:id',
  ValidationMiddleware.validateParams(validateServiceParams),
  ServiceController.delete
);

export default router;