import express from 'express';
import WorkController from '../controllers/WorkController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import { 
  validateWork, 
  validateWorkParams,
  validateWorkQuery 
} from '../validations/work.validation.js';

const router = express.Router();

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/works - получить все работы
router.get('/', 
  validationMiddleware(validateWorkQuery),
  WorkController.getAll
);

// GET /api/works/:id - получить работу по ID
router.get('/:id', 
  validationMiddleware(validateWorkParams),
  WorkController.getById
);

// GET /api/works/by-category/:categorySlug - работы по категории
router.get('/by-category/:categorySlug', 
  validationMiddleware(validateWorkQuery),
  WorkController.getByCategory
);

// GET /api/works/latest - получить последние работы (для главной страницы)
router.get('/latest', 
  validationMiddleware(validateWorkQuery),
  WorkController.getLatest
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(authMiddleware);

// POST /api/admin/works - создать работу
router.post('/', 
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateWork),
  WorkController.create
);

// DELETE /api/admin/works/:id - удалить работу
router.delete('/:id',
  validationMiddleware(validateWorkParams),
  WorkController.delete
);

export default router;