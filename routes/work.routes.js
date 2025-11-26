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
  WorkController.getAll.bind(WorkController)
);

// GET /api/works/:id - получить работу по ID
router.get('/:id', 
  validationMiddleware(validateWorkParams),
  WorkController.getById.bind(WorkController)
);

// GET /api/works/by-category/:categorySlug - работы по категории
router.get('/by-category/:categorySlug', 
  validationMiddleware(validateWorkQuery),
  WorkController.getByCategory.bind(WorkController)
);

// GET /api/works/latest - получить последние работы (для главной страницы)
router.get('/latest', 
  validationMiddleware(validateWorkQuery),
  WorkController.getLatest.bind(WorkController)
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// POST /api/admin/works - создать работу
router.post('/', 
  authMiddleware.verifyToken.bind(authMiddleware),
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateWork),
  WorkController.create.bind(WorkController)
);

// DELETE /api/admin/works/:id - удалить работу
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateWorkParams),
  WorkController.delete.bind(WorkController)
);

export default router;