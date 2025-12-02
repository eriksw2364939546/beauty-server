import express from 'express';
import MasterController from '../controllers/MasterController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import {
  validateMaster,
  validateMasterUpdate,
  validateMasterParams,
  validateMasterQuery
} from '../validations/master.validation.js';

const router = express.Router();

// Создаём объекты upload для переиспользования
const masterUpload = uploadPhotoMiddleware.single('image', 'masters');
const masterUploadOptional = uploadPhotoMiddleware.optional('image', 'masters');

// ═══════════════════════════════════════════════════════════════════════════
// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/masters - получить всех мастеров
router.get('/',
  validationMiddleware.validateQuery(validateMasterQuery),
  MasterController.getAll.bind(MasterController)
);

// GET /api/masters/featured - избранные мастера (для главной страницы)
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/featured',
  validationMiddleware.validateQuery(validateMasterQuery),
  MasterController.getFeatured.bind(MasterController)
);

// GET /api/masters/by-speciality - мастера по специальности
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/by-speciality',
  validationMiddleware.validateQuery(validateMasterQuery),
  MasterController.getBySpeciality.bind(MasterController)
);

// GET /api/masters/:id - получить мастера по ID
router.get('/:id',
  validationMiddleware.validateParams(validateMasterParams),
  MasterController.getById.bind(MasterController)
);

// ═══════════════════════════════════════════════════════════════════════════
// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/admin/masters - создать мастера
// Порядок: auth → parse (multer) → validation → process (sharp) → controller
router.post('/',
  authMiddleware.verifyToken.bind(authMiddleware),
  masterUpload.parse,                              // 1. Парсим form-data (файл в памяти)
  validationMiddleware.validateBody(validateMaster), // 2. Валидируем body
  masterUpload.process,                            // 3. Обрабатываем и сохраняем изображение
  MasterController.create.bind(MasterController)
);

// PATCH /api/admin/masters/:id - обновить мастера
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateMasterParams),
  masterUploadOptional.parse,                           // 1. Парсим form-data
  validationMiddleware.validateBody(validateMasterUpdate), // 2. Валидируем body
  masterUploadOptional.process,                         // 3. Обрабатываем изображение (если есть)
  MasterController.update.bind(MasterController)
);

// DELETE /api/admin/masters/:id - удалить мастера
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateMasterParams),
  MasterController.delete.bind(MasterController)
);

export default router;