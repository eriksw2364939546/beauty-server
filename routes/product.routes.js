import express from 'express';
import ProductController from '../controllers/ProductController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import {
  validateProduct,
  validateProductUpdate,
  validateProductQuery,
  validateProductSearch,
  validateFeaturedProductsQuery,
  validateIdParam,
  validateCategoryIdParam,
  validateCodeParam,
  validateSlugParam
} from '../validations/product.validation.js';

const router = express.Router();

// Создаём объекты upload для переиспользования
const productUpload = uploadPhotoMiddleware.single('image', 'products');
const productUploadOptional = uploadPhotoMiddleware.optional('image', 'products');

// ═══════════════════════════════════════════════════════════════════════════
// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/products - получить все товары
router.get('/',
  validationMiddleware.validateQuery(validateProductQuery),
  ProductController.getAll.bind(ProductController)
);

// GET /api/products/search - поиск товаров
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/search',
  validationMiddleware.validateQuery(validateProductSearch),
  ProductController.search.bind(ProductController)
);

// GET /api/products/featured - рекомендуемые товары (для главной)
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/featured',
  validationMiddleware.validateQuery(validateFeaturedProductsQuery),
  ProductController.getFeatured.bind(ProductController)
);

// GET /api/products/brands - получить список всех брендов
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/brands',
  ProductController.getBrands.bind(ProductController)
);

// GET /api/products/by-category/:categoryId - товары по категории
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/by-category/:categoryId',
  validationMiddleware.validateParams(validateCategoryIdParam),
  ProductController.getByCategory.bind(ProductController)
);

// GET /api/products/code/:code - товар по артикулу
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/code/:code',
  validationMiddleware.validateParams(validateCodeParam),
  ProductController.getByCode.bind(ProductController)
);

// GET /api/products/id/:id - товар по ID (для админки)
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/id/:id',
  validationMiddleware.validateParams(validateIdParam),
  ProductController.getById.bind(ProductController)
);

// GET /api/products/:slug - товар по slug
router.get('/:slug',
  validationMiddleware.validateParams(validateSlugParam),
  ProductController.getBySlug.bind(ProductController)
);

// ═══════════════════════════════════════════════════════════════════════════
// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/admin/products - создать товар
// Порядок: auth → parse (multer) → validation → process (sharp) → controller
router.post('/',
  authMiddleware.verifyToken.bind(authMiddleware),
  productUpload.parse,                              // 1. Парсим form-data (файл в памяти)
  validationMiddleware.validateBody(validateProduct), // 2. Валидируем body
  productUpload.process,                            // 3. Обрабатываем и сохраняем изображение
  ProductController.create.bind(ProductController)
);

// PATCH /api/admin/products/:id - обновить товар
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  productUploadOptional.parse,                           // 1. Парсим form-data
  validationMiddleware.validateBody(validateProductUpdate), // 2. Валидируем body
  productUploadOptional.process,                         // 3. Обрабатываем изображение (если есть)
  ProductController.update.bind(ProductController)
);

// DELETE /api/admin/products/:id - удалить товар
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  ProductController.delete.bind(ProductController)
);

export default router;