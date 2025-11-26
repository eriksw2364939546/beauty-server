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

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/masters - получить всех мастеров
router.get('/', 
  validationMiddleware(validateMasterQuery),
  MasterController.getAll
);

// GET /api/masters/:id - получить мастера по ID
router.get('/:id', 
  validationMiddleware(validateMasterParams),
  MasterController.getById
);

// GET /api/masters/by-speciality - мастера по специальности
router.get('/by-speciality', 
  validationMiddleware(validateMasterQuery),
  MasterController.getBySpeciality
);

// GET /api/masters/featured - избранные мастера (для главной страницы)
router.get('/featured', 
  validationMiddleware(validateMasterQuery),
  MasterController.getFeatured
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(authMiddleware);

// POST /api/admin/masters - создать мастера
router.post('/', 
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateMaster),
  MasterController.create
);

// PATCH /api/admin/masters/:id - обновить мастера
router.patch('/:id',
  validationMiddleware(validateMasterParams),
  uploadPhotoMiddleware.optional('image'),
  validationMiddleware(validateMasterUpdate),
  MasterController.update
);

// DELETE /api/admin/masters/:id - удалить мастера
router.delete('/:id',
  validationMiddleware(validateMasterParams),
  MasterController.delete
);

export default router;