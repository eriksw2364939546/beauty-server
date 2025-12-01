import Price from '../models/Price.model.js';
import Category from '../models/Category.model.js';

class PriceService {

    // Получение всех расценок
    async getAllPrices(filters = {}) {
        try {
            const { category, search, limit, page = 1 } = filters;

            const query = {};

            if (category) {
                query.category = category;
            }

            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * (limit || 0);
            const options = { sort: { category: 1, sortOrder: 1, createdAt: 1 } };

            if (limit) {
                options.limit = parseInt(limit);
                options.skip = skip;
            }

            const prices = await Price.find(query, null, options).populate('category', 'title slug section');
            const total = await Price.countDocuments(query);

            return {
                success: true,
                data: prices,
                meta: {
                    page: parseInt(page),
                    limit: limit ? parseInt(limit) : total,
                    total,
                    pages: limit ? Math.ceil(total / limit) : 1
                }
            };

        } catch (error) {
            console.error('❌ Ошибка при получении расценок:', error);
            throw new Error('Ошибка при получении расценок');
        }
    }

    // Получение расценки по ID
    async getPriceById(priceId) {
        try {
            const price = await Price.findById(priceId).populate('category', 'title slug section');

            if (!price) {
                return { success: false, message: 'Расценка не найдена' };
            }

            return { success: true, data: price };

        } catch (error) {
            console.error('❌ Ошибка при получении расценки:', error);
            throw new Error('Ошибка при получении расценки');
        }
    }

    // Получение расценок по категории
    async getPricesByCategory(categoryId) {
        try {
            const prices = await Price.find({ category: categoryId })
                .populate('category', 'title slug section')
                .sort({ sortOrder: 1, createdAt: 1 });

            return { success: true, data: prices };

        } catch (error) {
            console.error('❌ Ошибка при получении расценок по категории:', error);
            throw new Error('Ошибка при получении расценок по категории');
        }
    }

    // Получение расценок сгруппированных по категориям
    async getPricesGroupedByCategory() {
        try {
            const prices = await Price.find()
                .populate('category', 'title slug section sortOrder')
                .sort({ 'category.sortOrder': 1, sortOrder: 1 });

            // Группируем по категориям
            const grouped = {};

            for (const price of prices) {
                const categoryId = price.category._id.toString();

                if (!grouped[categoryId]) {
                    grouped[categoryId] = {
                        category: price.category,
                        items: []
                    };
                }

                grouped[categoryId].items.push({
                    _id: price._id,
                    title: price.title,
                    description: price.description,
                    price: price.price,
                    sortOrder: price.sortOrder
                });
            }

            // Преобразуем в массив и сортируем по sortOrder категории
            const result = Object.values(grouped).sort((a, b) =>
                (a.category.sortOrder || 0) - (b.category.sortOrder || 0)
            );

            return { success: true, data: result };

        } catch (error) {
            console.error('❌ Ошибка при получении сгруппированных расценок:', error);
            throw new Error('Ошибка при получении сгруппированных расценок');
        }
    }

    // Создание новой расценки
    async createPrice(priceData) {
        try {
            const { title, description, price, categoryId, sortOrder } = priceData;

            // Проверяем существование категории с section: 'price'
            const category = await Category.findById(categoryId);

            if (!category) {
                return { success: false, message: 'Категория не найдена' };
            }

            if (category.section !== 'price') {
                return {
                    success: false,
                    message: `Категория "${category.title}" не относится к секции "price". Текущая секция: "${category.section}"`
                };
            }

            const newPrice = new Price({
                title: title.trim(),
                description: description ? description.trim() : '',
                price: parseFloat(price),
                category: categoryId,
                sortOrder: parseInt(sortOrder) || 0
            });

            await newPrice.save();

            // Возвращаем с populated category
            const populatedPrice = await Price.findById(newPrice._id).populate('category', 'title slug section');

            return {
                success: true,
                data: populatedPrice,
                message: 'Расценка успешно создана'
            };

        } catch (error) {
            console.error('❌ Ошибка при создании расценки:', error);
            throw new Error('Ошибка при создании расценки');
        }
    }

    // Обновление расценки
    async updatePrice(priceId, updateData) {
        try {
            const { title, description, price, categoryId, sortOrder } = updateData;

            const existingPrice = await Price.findById(priceId);

            if (!existingPrice) {
                return { success: false, message: 'Расценка не найдена' };
            }

            const updateFields = {};

            if (title && title.trim() !== existingPrice.title) {
                updateFields.title = title.trim();
            }

            if (description !== undefined && description.trim() !== existingPrice.description) {
                updateFields.description = description.trim();
            }

            if (price !== undefined && parseFloat(price) !== existingPrice.price) {
                updateFields.price = parseFloat(price);
            }

            if (sortOrder !== undefined && parseInt(sortOrder) !== existingPrice.sortOrder) {
                updateFields.sortOrder = parseInt(sortOrder);
            }

            // Если меняется категория — проверяем что новая категория с section: 'price'
            if (categoryId && categoryId.toString() !== existingPrice.category.toString()) {
                const newCategory = await Category.findById(categoryId);

                if (!newCategory) {
                    return { success: false, message: 'Категория не найдена' };
                }

                if (newCategory.section !== 'price') {
                    return {
                        success: false,
                        message: `Категория "${newCategory.title}" не относится к секции "price"`
                    };
                }

                updateFields.category = categoryId;
            }

            if (Object.keys(updateFields).length === 0) {
                return { success: true, data: existingPrice, message: 'Нет изменений для обновления' };
            }

            const updatedPrice = await Price.findByIdAndUpdate(
                priceId,
                updateFields,
                { new: true, runValidators: true }
            ).populate('category', 'title slug section');

            return {
                success: true,
                data: updatedPrice,
                message: 'Расценка успешно обновлена'
            };

        } catch (error) {
            console.error('❌ Ошибка при обновлении расценки:', error);
            throw new Error('Ошибка при обновлении расценки');
        }
    }

    // Удаление расценки
    async deletePrice(priceId) {
        try {
            const price = await Price.findById(priceId);

            if (!price) {
                return { success: false, message: 'Расценка не найдена' };
            }

            await Price.findByIdAndDelete(priceId);

            return { success: true, message: 'Расценка успешно удалена' };

        } catch (error) {
            console.error('❌ Ошибка при удалении расценки:', error);
            throw new Error('Ошибка при удалении расценки');
        }
    }

    // Обновление порядка сортировки
    async updateSortOrder(priceId, newSortOrder) {
        try {
            const price = await Price.findById(priceId);

            if (!price) {
                return { success: false, message: 'Расценка не найдена' };
            }

            price.sortOrder = parseInt(newSortOrder);
            await price.save();

            return {
                success: true,
                data: price,
                message: 'Порядок сортировки обновлён'
            };

        } catch (error) {
            console.error('❌ Ошибка при обновлении порядка сортировки:', error);
            throw new Error('Ошибка при обновлении порядка сортировки');
        }
    }
}

export default new PriceService();