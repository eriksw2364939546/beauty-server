import express from 'express';
import ProductController from '../controllers/product.controller.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ValidationMiddleware from '../middlewares/validation.middleware.js';
import UploadPhotoMiddleware from '../middlewares/uploadPhoto.middleware.js';
import { 
  validateProduct, 
  validateProductUpdate, 
  validateProductParams,
  validateProductQuery,
  validateProductSearch 
} from '../validations/product.validation.js';

const router = express.Router();

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/products - получить все товары
router.get('/', 
  ValidationMiddleware.validateQuery(validateProductQuery),
  ProductController.getAll
);

// GET /api/products/search - поиск товаров
router.get('/search', 
  ValidationMiddleware.validateQuery(validateProductSearch),
  ProductController.search
);

// GET /api/products/featured - рекомендуемые товары (для главной)
router.get('/featured', 
  ValidationMiddleware.validateQuery(validateProductQuery),
  ProductController.getFeatured
);

// GET /api/products/by-category/:categorySlug - товары по категории
router.get('/by-category/:categorySlug', 
  ValidationMiddleware.validateQuery(validateProductQuery),
  ProductController.getByCategory
);

// GET /api/products/code/:code - товар по артикулу
router.get('/code/:code', 
  ProductController.getByCode
);

// GET /api/products/:slug - товар по slug
router.get('/:slug', 
  ProductController.getBySlug
);

// GET /api/products/id/:id - товар по ID (для админки)
router.get('/id/:id', 
  ValidationMiddleware.validateParams(validateProductParams),
  ProductController.getById
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(AuthMiddleware.verifyToken);

// POST /api/admin/products - создать товар
router.post('/', 
  ...UploadPhotoMiddleware.single('image'),
  ValidationMiddleware.validateBody(validateProduct),
  ProductController.create
);

// PATCH /api/admin/products/:id - обновить товар
router.patch('/:id',
  ValidationMiddleware.validateParams(validateProductParams),
  ...UploadPhotoMiddleware.optional('image'),
  ValidationMiddleware.validateBody(validateProductUpdate),
  ProductController.update
);

// DELETE /api/admin/products/:id - удалить товар
router.delete('/:id',
  ValidationMiddleware.validateParams(validateProductParams),
  ProductController.delete
);

export default router;