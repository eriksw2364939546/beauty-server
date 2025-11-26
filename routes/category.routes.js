import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import { 
  validateCategory, 
  validateCategoryUpdate, 
  validateCategoryParams,
  validateCategoryQuery 
} from '../validations/category.validation.js';

const router = express.Router();

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/categories - получить все категории
router.get('/', 
  validationMiddleware(validateCategoryQuery),
  CategoryController.getAll
);

// GET /api/categories/:id - получить категорию по ID
router.get('/:id', 
  validationMiddleware(validateCategoryParams),
  CategoryController.getById
);

// GET /api/categories/slug/:slug - получить категорию по slug
router.get('/slug/:slug', 
  CategoryController.getBySlug
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(authMiddleware);

// POST /api/admin/categories - создать категорию
router.post('/', 
  validationMiddleware(validateCategory),
  CategoryController.create
);

// PATCH /api/admin/categories/:id - обновить категорию
router.patch('/:id',
  validationMiddleware(validateCategoryParams),
  validationMiddleware(validateCategoryUpdate),
  CategoryController.update
);

// DELETE /api/admin/categories/:id - удалить категорию
router.delete('/:id',
  validationMiddleware(validateCategoryParams),
  CategoryController.delete
);

// PATCH /api/admin/categories/:id/sort-order - изменить порядок сортировки
router.patch('/:id/sort-order',
  validationMiddleware(validateCategoryParams),
  CategoryController.updateSortOrder
);

export default router;