import express from 'express';
import MasterController from '../controllers/master.controller.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ValidationMiddleware from '../middlewares/validation.middleware.js';
import UploadPhotoMiddleware from '../middlewares/uploadPhoto.middleware.js';
import { 
  validateMaster, 
  validateMasterUpdate, 
  validateMasterParams,
  validateMasterQuery 
} from '../validations/master.validation.js';

const router = express.Router();

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/masters - получить всех мастеров
router.get('/', 
  ValidationMiddleware.validateQuery(validateMasterQuery),
  MasterController.getAll
);

// GET /api/masters/:id - получить мастера по ID
router.get('/:id', 
  ValidationMiddleware.validateParams(validateMasterParams),
  MasterController.getById
);

// GET /api/masters/by-speciality - мастера по специальности
router.get('/by-speciality', 
  ValidationMiddleware.validateQuery(validateMasterQuery),
  MasterController.getBySpeciality
);

// GET /api/masters/featured - избранные мастера (для главной страницы)
router.get('/featured', 
  ValidationMiddleware.validateQuery(validateMasterQuery),
  MasterController.getFeatured
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(AuthMiddleware.verifyToken);

// POST /api/admin/masters - создать мастера
router.post('/', 
  ...UploadPhotoMiddleware.single('image'),
  ValidationMiddleware.validateBody(validateMaster),
  MasterController.create
);

// PATCH /api/admin/masters/:id - обновить мастера
router.patch('/:id',
  ValidationMiddleware.validateParams(validateMasterParams),
  ...UploadPhotoMiddleware.optional('image'),
  ValidationMiddleware.validateBody(validateMasterUpdate),
  MasterController.update
);

// DELETE /api/admin/masters/:id - удалить мастера
router.delete('/:id',
  ValidationMiddleware.validateParams(validateMasterParams),
  MasterController.delete
);

export default router;