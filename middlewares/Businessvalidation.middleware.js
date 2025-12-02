import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Service from '../models/Service.model.js';

/**
 * Middleware для предварительной проверки бизнес-логики
 * Вызывается ПОСЛЕ Joi валидации, но ДО сохранения файла на диск
 */
class BusinessValidation {

    /**
     * Проверка для создания Product
     * - Уникальность code
     * - Существование категории с section: 'product'
     */
    validateProductCreate() {
        return async (req, res, next) => {
            try {
                const { code, categoryId } = req.body;

                // 1. Проверяем уникальность артикула
                if (code) {
                    const existingByCode = await Product.findOne({
                        code: code.toUpperCase().trim()
                    });

                    if (existingByCode) {
                        return res.status(400).json({
                            ok: false,
                            error: 'duplicate_code',
                            message: 'Товар с таким артикулом уже существует'
                        });
                    }
                }

                // 2. Проверяем категорию
                if (categoryId) {
                    const category = await Category.findById(categoryId);

                    if (!category) {
                        return res.status(400).json({
                            ok: false,
                            error: 'category_not_found',
                            message: 'Категория не найдена'
                        });
                    }

                    if (category.section !== 'product') {
                        return res.status(400).json({
                            ok: false,
                            error: 'invalid_category_section',
                            message: `Категория "${category.title}" не относится к секции "product". Текущая секция: "${category.section}"`
                        });
                    }
                }

                next();
            } catch (error) {
                console.error('Business validation error:', error);
                next(error);
            }
        };
    }

    /**
     * Проверка для обновления Product
     * - Уникальность code (исключая текущий товар)
     * - Существование категории с section: 'product'
     */
    validateProductUpdate() {
        return async (req, res, next) => {
            try {
                const { id } = req.params;
                const { code, categoryId } = req.body;

                // 1. Проверяем уникальность артикула (если передан)
                if (code) {
                    const existingByCode = await Product.findOne({
                        code: code.toUpperCase().trim(),
                        _id: { $ne: id }
                    });

                    if (existingByCode) {
                        return res.status(400).json({
                            ok: false,
                            error: 'duplicate_code',
                            message: 'Товар с таким артикулом уже существует'
                        });
                    }
                }

                // 2. Проверяем категорию (если передана)
                if (categoryId) {
                    const category = await Category.findById(categoryId);

                    if (!category) {
                        return res.status(400).json({
                            ok: false,
                            error: 'category_not_found',
                            message: 'Категория не найдена'
                        });
                    }

                    if (category.section !== 'product') {
                        return res.status(400).json({
                            ok: false,
                            error: 'invalid_category_section',
                            message: `Категория "${category.title}" не относится к секции "product". Текущая секция: "${category.section}"`
                        });
                    }
                }

                next();
            } catch (error) {
                console.error('Business validation error:', error);
                next(error);
            }
        };
    }

    /**
     * Проверка для создания Service
     * - Существование категории с section: 'service'
     */
    validateServiceCreate() {
        return async (req, res, next) => {
            try {
                const { categoryId } = req.body;

                if (categoryId) {
                    const category = await Category.findById(categoryId);

                    if (!category) {
                        return res.status(400).json({
                            ok: false,
                            error: 'category_not_found',
                            message: 'Категория не найдена'
                        });
                    }

                    if (category.section !== 'service') {
                        return res.status(400).json({
                            ok: false,
                            error: 'invalid_category_section',
                            message: `Категория "${category.title}" не относится к секции "service". Текущая секция: "${category.section}"`
                        });
                    }
                }

                next();
            } catch (error) {
                console.error('Business validation error:', error);
                next(error);
            }
        };
    }

    /**
     * Проверка для создания Work
     * - Существование услуги (serviceId)
     */
    validateWorkCreate() {
        return async (req, res, next) => {
            try {
                const { serviceId } = req.body;

                if (serviceId) {
                    const service = await Service.findById(serviceId);

                    if (!service) {
                        return res.status(400).json({
                            ok: false,
                            error: 'service_not_found',
                            message: 'Услуга не найдена'
                        });
                    }
                }

                next();
            } catch (error) {
                console.error('Business validation error:', error);
                next(error);
            }
        };
    }
}

export default new BusinessValidation();