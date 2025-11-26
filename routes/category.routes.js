import express from 'express';
import CategoryController from '../controllers/category.controller.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ValidationMiddleware from '../middlewares/validation.middleware.js';
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
  ValidationMiddleware.validateQuery(validateCategoryQuery),
  CategoryController.getAll
);

// GET /api/categories/:id - получить категорию по ID
router.get('/:id', 
  ValidationMiddleware.validateParams(validateCategoryParams),
  CategoryController.getById
);

// GET /api/categories/slug/:slug - получить категорию по slug
router.get('/slug/:slug', 
  CategoryController.getBySlug
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(AuthMiddleware.verifyToken);

// POST /api/admin/categories - создать категорию
router.post('/', 
  ValidationMiddleware.validateBody(validateCategory),
  CategoryController.create
);

// PATCH /api/admin/categories/:id - обновить категорию
router.patch('/:id',
  ValidationMiddleware.validateParams(validateCategoryParams),
  ValidationMiddleware.validateBody(validateCategoryUpdate),
  CategoryController.update
);

// DELETE /api/admin/categories/:id - удалить категорию
router.delete('/:id',
  ValidationMiddleware.validateParams(validateCategoryParams),
  CategoryController.delete
);

// PATCH /api/admin/categories/:id/sort-order - изменить порядок сортировки
router.patch('/:id/sort-order',
  ValidationMiddleware.validateParams(validateCategoryParams),
  CategoryController.updateSortOrder
);

export default router;