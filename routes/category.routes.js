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
  CategoryController.getAll.bind(CategoryController)
);

// GET /api/categories/:id - получить категорию по ID
router.get('/:id', 
  validationMiddleware(validateCategoryParams),
  CategoryController.getById.bind(CategoryController)
);

// GET /api/categories/slug/:slug - получить категорию по slug
router.get('/slug/:slug', 
  CategoryController.getBySlug.bind(CategoryController)
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// POST /api/admin/categories - создать категорию
router.post('/', 
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateCategory),
  CategoryController.create.bind(CategoryController)
);

// PATCH /api/admin/categories/:id - обновить категорию
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateCategoryParams),
  validationMiddleware(validateCategoryUpdate),
  CategoryController.update.bind(CategoryController)
);

// DELETE /api/admin/categories/:id - удалить категорию
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateCategoryParams),
  CategoryController.delete.bind(CategoryController)
);

// PATCH /api/admin/categories/:id/sort-order - изменить порядок сортировки
router.patch('/:id/sort-order',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateCategoryParams),
  CategoryController.updateSortOrder.bind(CategoryController)
);

export default router;