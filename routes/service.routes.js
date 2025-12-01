import express from 'express';
import ServiceController from '../controllers/ServiceController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import {
  validateService,
  validateServiceUpdate,
  validateServiceParams,
  validateServiceQuery,
  validateIdParam,
  validateCategoryIdParam,
  validateSlugParam
} from '../validations/service.validation.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/services - получить все услуги
router.get('/',
  validationMiddleware.validateQuery(validateServiceQuery),
  ServiceController.getAll.bind(ServiceController)
);

// GET /api/services/by-category/:categoryId - услуги по категории
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/by-category/:categoryId',
  validationMiddleware.validateParams(validateCategoryIdParam),
  ServiceController.getByCategory.bind(ServiceController)
);

// GET /api/services/id/:id - получить услугу по ID (для админки)
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/id/:id',
  validationMiddleware.validateParams(validateIdParam),
  ServiceController.getById.bind(ServiceController)
);

// GET /api/services/:slug - получить услугу по slug
router.get('/:slug',
  validationMiddleware.validateParams(validateSlugParam),
  ServiceController.getBySlug.bind(ServiceController)
);

// ═══════════════════════════════════════════════════════════════════════════
// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/admin/services - создать услугу
router.post('/',
  authMiddleware.verifyToken.bind(authMiddleware),
  uploadPhotoMiddleware.single('image', 'services'),
  validationMiddleware.validateBody(validateService),
  ServiceController.create.bind(ServiceController)
);

// PATCH /api/admin/services/:id - обновить услугу
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  uploadPhotoMiddleware.optional('image', 'services'),
  validationMiddleware.validateBody(validateServiceUpdate),
  ServiceController.update.bind(ServiceController)
);

// DELETE /api/admin/services/:id - удалить услугу
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  ServiceController.delete.bind(ServiceController)
);

export default router;