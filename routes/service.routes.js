import express from 'express';
import ServiceController from '../controllers/ServiceController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
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
  validationMiddleware(validateServiceQuery),
  ServiceController.getAll
);

// GET /api/services/:slug - получить услугу по slug
router.get('/:slug', 
  ServiceController.getBySlug
);

// GET /api/services/by-category/:categorySlug - услуги по категории
router.get('/by-category/:categorySlug', 
  validationMiddleware(validateServiceQuery),
  ServiceController.getByCategory
);

// GET /api/services/id/:id - получить услугу по ID (для админки)
router.get('/id/:id', 
  validationMiddleware(validateServiceParams),
  ServiceController.getById
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(authMiddleware);

// POST /api/admin/services - создать услугу
router.post('/', 
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateService),
  ServiceController.create
);

// PATCH /api/admin/services/:id - обновить услугу
router.patch('/:id',
  validationMiddleware(validateServiceParams),
  uploadPhotoMiddleware.optional('image'),
  validationMiddleware(validateServiceUpdate),
  ServiceController.update
);

// DELETE /api/admin/services/:id - удалить услугу
router.delete('/:id',
  validationMiddleware(validateServiceParams),
  ServiceController.delete
);

export default router;