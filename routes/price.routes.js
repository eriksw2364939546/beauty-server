// backend/routes/price.routes.js
import express from 'express';
import PriceController from '../controllers/PriceController.js';
import authMiddleware from '../middlewares/Auth.middleware.js';
import validationMiddleware from '../middlewares/Validation.middleware.js';
import {
    validatePrice,
    validatePriceUpdate,
    validatePriceQuery,
    validateIdParam,
    validateServiceIdParam,
    validateCategoryIdParam,
    validateSortOrder
} from '../validations/price.validation.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// ПУБЛИЧНЫЕ МАРШРУТЫ (для витрины)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/prices - получить все расценки
router.get('/',
    validationMiddleware.validateQuery(validatePriceQuery),
    PriceController.getAll.bind(PriceController)
);

// GET /api/prices/grouped - расценки сгруппированные по услугам
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/grouped',
    PriceController.getGrouped.bind(PriceController)
);

// GET /api/prices/by-service/:serviceId - расценки по услуге
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/by-service/:serviceId',
    validationMiddleware.validateParams(validateServiceIdParam),
    PriceController.getByService.bind(PriceController)
);

// GET /api/prices/by-category/:categoryId - расценки по категории
// ВАЖНО: этот маршрут должен быть ПЕРЕД /:id
router.get('/by-category/:categoryId',
    validationMiddleware.validateParams(validateCategoryIdParam),
    PriceController.getByCategory.bind(PriceController)
);

// GET /api/prices/:id - получить расценку по ID
router.get('/:id',
    validationMiddleware.validateParams(validateIdParam),
    PriceController.getById.bind(PriceController)
);

// ═══════════════════════════════════════════════════════════════════════════
// АДМИНСКИЕ МАРШРУТЫ (требуют авторизации)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/admin/prices - создать расценку
router.post('/',
    authMiddleware.verifyToken.bind(authMiddleware),
    validationMiddleware.validateBody(validatePrice),
    PriceController.create.bind(PriceController)
);

// PATCH /api/admin/prices/:id - обновить расценку
router.patch('/:id',
    authMiddleware.verifyToken.bind(authMiddleware),
    validationMiddleware.validateParams(validateIdParam),
    validationMiddleware.validateBody(validatePriceUpdate),
    PriceController.update.bind(PriceController)
);

// DELETE /api/admin/prices/:id - удалить расценку
router.delete('/:id',
    authMiddleware.verifyToken.bind(authMiddleware),
    validationMiddleware.validateParams(validateIdParam),
    PriceController.delete.bind(PriceController)
);

// PATCH /api/admin/prices/:id/sort-order - изменить порядок сортировки
router.patch('/:id/sort-order',
    authMiddleware.verifyToken.bind(authMiddleware),
    validationMiddleware.validateParams(validateIdParam),
    validationMiddleware.validateBody(validateSortOrder),
    PriceController.updateSortOrder.bind(PriceController)
);

export default router;