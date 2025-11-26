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
  MasterController.getAll.bind(MasterController)
);

// GET /api/masters/:id - получить мастера по ID
router.get('/:id', 
  validationMiddleware(validateMasterParams),
  MasterController.getById.bind(MasterController)
);

// GET /api/masters/by-speciality - мастера по специальности
router.get('/by-speciality', 
  validationMiddleware(validateMasterQuery),
  MasterController.getBySpeciality.bind(MasterController)
);

// GET /api/masters/featured - избранные мастера (для главной страницы)
router.get('/featured', 
  validationMiddleware(validateMasterQuery),
  MasterController.getFeatured.bind(MasterController)
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// POST /api/admin/masters - создать мастера
router.post('/', 
  authMiddleware.verifyToken.bind(authMiddleware),
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateMaster),
  MasterController.create.bind(MasterController)
);

// PATCH /api/admin/masters/:id - обновить мастера
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateMasterParams),
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateMasterUpdate),
  MasterController.update.bind(MasterController)
);

// DELETE /api/admin/masters/:id - удалить мастера
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateMasterParams),
  MasterController.delete.bind(MasterController)
);

export default router;