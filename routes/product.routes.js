import express from 'express';
import ProductController from '../controllers/ProductController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';
import {
  validateProduct,
  validateProductUpdate,
  validateProductParams,
  validateProductQuery,
  validateProductSearch,
  validateIdParam,
  validateCategorySlugParam
} from '../validations/product.validation.js';

const router = express.Router();

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
  validationMiddleware.validateQuery(validateProductQuery),
  ProductController.getFeatured.bind(ProductController)
);

// GET /api/products/by-category/:categorySlug - товары по категории
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/by-category/:categorySlug',
  validationMiddleware.validateParams(validateCategorySlugParam),
  ProductController.getByCategory.bind(ProductController)
);

// GET /api/products/code/:code - товар по артикулу
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:slug
router.get('/code/:code',
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
  ProductController.getBySlug.bind(ProductController)
);

// ═══════════════════════════════════════════════════════════════════════════
// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/admin/products - создать товар
router.post('/',
  authMiddleware.verifyToken.bind(authMiddleware),
  uploadPhotoMiddleware.single('image', 'products'),  // ← тип сущности 'products'
  validationMiddleware.validateBody(validateProduct),
  ProductController.create.bind(ProductController)
);

// PATCH /api/admin/products/:id - обновить товар
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  uploadPhotoMiddleware.optional('image', 'products'),  // ← опциональное, тип 'products'
  validationMiddleware.validateBody(validateProductUpdate),
  ProductController.update.bind(ProductController)
);

// DELETE /api/admin/products/:id - удалить товар
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware.validateParams(validateIdParam),
  ProductController.delete.bind(ProductController)
);

export default router;