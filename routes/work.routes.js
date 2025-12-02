import express from 'express';
import WorkController from '../controllers/WorkController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import businessValidation from '../middlewares/BusinessValidation.middleware.js';
import {
  validateWork,
  validateWorkQuery,
  validateIdParam,
  validateServiceIdParam,
  validateCategoryIdParam,
  validateLatestWorksQuery
} from '../validations/work.validation.js';

const router = express.Router();

// Создаём объект upload для переиспользования
const workUpload = uploadPhotoMiddleware.single('image', 'works');

// ═══════════════════════════════════════════════════════════════════════════
// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/works - получить все работы
router.get('/',
  validationMiddleware.validateQuery(validateWorkQuery),
  WorkController.getAll.bind(WorkController)
);

// GET /api/works/latest - получить последние работы (для главной страницы)
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/latest',
  validationMiddleware.validateQuery(validateLatestWorksQuery),
  WorkController.getLatest.bind(WorkController)
);

// GET /api/works/by-service/:serviceId - работы по услуге
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/by-service/:serviceId',
  validationMiddleware.validateParams(validateServiceIdParam),
  WorkController.getByService.bind(WorkController)
);

// GET /api/works/by-category/:categoryId - работы по категории
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/by-category/:categoryId',
  validationMiddleware.validateParams(validateCategoryIdParam),
  WorkController.getByCategory.bind(WorkController)
);

// GET /api/works/:id - получить работу по ID
router.get('/:id',
  validationMiddleware.validateParams(validateIdParam),
  WorkController.getById.bind(WorkController)
);

// ═══════════════════════════════════════════════════════════════════════════
// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/admin/works - создать работу
// Порядок: auth → parse → joi validation → business validation → process → controller
router.post('/',
  authMiddleware.verifyToken.bind(authMiddleware),
  workUpload.parse,                              // 1. Парсим form-data (файл в памяти)
  validationMiddleware.validateBody(validateWork), // 2. Joi валидация
  businessValidation.validateWorkCreate(),       // 3. Бизнес-валидация (существование услуги)
  workUpload.process,                            // 4. Сохраняем изображение на диск
  WorkController.create.bind(WorkController)
);

// DELETE /api/admin/works/:id - удалить работу
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  WorkController.delete.bind(WorkController)
);

export default router;