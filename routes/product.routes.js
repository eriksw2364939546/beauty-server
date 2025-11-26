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
  ProductController.getAll.bind(ProductController)
);

// GET /api/products/search - поиск товаров
router.get('/search', 
  validationMiddleware(validateProductSearch),
  ProductController.search.bind(ProductController)
);

// GET /api/products/featured - рекомендуемые товары (для главной)
router.get('/featured', 
  validationMiddleware(validateProductQuery),
  ProductController.getFeatured.bind(ProductController)
);

// GET /api/products/by-category/:categorySlug - товары по категории
router.get('/by-category/:categorySlug', 
  validationMiddleware(validateProductQuery),
  ProductController.getByCategory.bind(ProductController)
);

// GET /api/products/code/:code - товар по артикулу
router.get('/code/:code', 
  ProductController.getByCode.bind(ProductController)
);

// GET /api/products/:slug - товар по slug
router.get('/:slug', 
  ProductController.getBySlug.bind(ProductController)
);

// GET /api/products/id/:id - товар по ID (для админки)
router.get('/id/:id', 
  validationMiddleware(validateProductParams),
  ProductController.getById.bind(ProductController)
);

// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)

// POST /api/admin/products - создать товар
router.post('/', 
  authMiddleware.verifyToken.bind(authMiddleware),
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateProduct),
  ProductController.create.bind(ProductController)
);

// PATCH /api/admin/products/:id - обновить товар
router.patch('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateProductParams),
  uploadPhotoMiddleware.single('image'),
  validationMiddleware(validateProductUpdate),
  ProductController.update.bind(ProductController)
);

// DELETE /api/admin/products/:id - удалить товар
router.delete('/:id',
  authMiddleware.verifyToken.bind(authMiddleware),
  validationMiddleware(validateProductParams),
  ProductController.delete.bind(ProductController)
);

export default router;