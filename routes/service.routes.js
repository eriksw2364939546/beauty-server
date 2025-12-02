import express from 'express';
import ServiceController from '../controllers/ServiceController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import {
  validateService,
  validateServiceUpdate,
  validateServiceQuery,
  validateIdParam,
  validateCategoryIdParam,
  validateSlugParam
} from '../validations/service.validation.js';

const router = express.Router();

// Создаём объекты upload для переиспользования
const serviceUpload = uploadPhotoMiddleware.single('image', 'services');
const serviceUploadOptional = uploadPhotoMiddleware.optional('image', 'services');

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
// Порядок: auth → parse (multer) → validation → process (sharp) → controller
router.post('/',
  authMiddleware.verifyToken.bind(authMiddleware),
  serviceUpload.parse,                              // 1. Парсим form-data (файл в памяти)
  validationMiddleware.validateBody(validateService), // 2. Валидируем body
  serviceUpload.process,                            // 3. Обрабатываем и сохраняем изображение
  ServiceController.create.bind(ServiceController)
);

// PATCH /api/admin/services/:id - обновить услугу
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  serviceUploadOptional.parse,                           // 1. Парсим form-data
  validationMiddleware.validateBody(validateServiceUpdate), // 2. Валидируем body
  serviceUploadOptional.process,                         // 3. Обрабатываем изображение (если есть)
  ServiceController.update.bind(ServiceController)
);

// DELETE /api/admin/services/:id - удалить услугу
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  ServiceController.delete.bind(ServiceController)
);

export default router;