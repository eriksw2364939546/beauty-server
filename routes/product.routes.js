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
  validateProductSearch 
} from '../validations/product.validation.js';

const router = express.Router();

// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)

// GET /api/products - получить все товары
router.get('/', 
  validationMiddleware(validateProductQuery),
  ProductController.getAll
);

// GET /api/products/search - поиск товаров
router.get('/search', 
  validationMiddleware(validateProductSearch),
  ProductController.search
);

// GET /api/products/featured - рекомендуемые товары (для главной)
router.get('/featured', 
  validationMiddleware(validateProductQuery),
  ProductController.getFeatured
);

// GET /api/products/by-category/:categorySlug - товары по категории
router.get('/by-category/:categorySlug', 
  validationMiddleware(validateProductQuery),
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
  validationMiddleware(validateProductParams),
  ProductController.getById
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// Middleware авторизации для всех админских маршрутов
router.use(authMiddleware);

// POST /api/admin/products - создать товар
router.post('/', 
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateProduct),
  ProductController.create
);

// PATCH /api/admin/products/:id - обновить товар
router.patch('/:id',
  validationMiddleware(validateProductParams),
  uploadPhotoMiddleware.optional('image'),
  validationMiddleware(validateProductUpdate),
  ProductController.update
);

// DELETE /api/admin/products/:id - удалить товар
router.delete('/:id',
  validationMiddleware(validateProductParams),
  ProductController.delete
);

export default router;