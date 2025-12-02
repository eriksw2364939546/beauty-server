import Price from '../models/Price.model.js';
import Service from '../models/Service.model.js';

class PriceService {

    // Получение всех расценок
    async getAllPrices(filters = {}) {
        try {
            const { service, category, search, limit, page = 1 } = filters;

            const query = {};

            // Фильтр по услуге
            if (service) {
                query.service = service;
            }

            // Фильтр по категории (через услугу)
            if (category) {
                const services = await Service.find({ category }).select('_id');
                const serviceIds = services.map(s => s._id);
                query.service = { $in: serviceIds };
            }

            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * (limit || 0);
            const options = { sort: { sortOrder: 1, createdAt: 1 } };

            if (limit) {
                options.limit = parseInt(limit);
                options.skip = skip;
            }

            const prices = await Price.find(query, null, options)
                .populate({
                    path: 'service',
                    select: 'title slug category',
                    populate: {
                        path: 'category',
                        select: 'title slug section'
                    }
                });

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
            const price = await Price.findById(priceId)
                .populate({
                    path: 'service',
                    select: 'title slug category',
                    populate: {
                        path: 'category',
                        select: 'title slug section'
                    }
                });

            if (!price) {
                return { success: false, message: 'Расценка не найдена' };
            }

            return { success: true, data: price };

        } catch (error) {
            console.error('❌ Ошибка при получении расценки:', error);
            throw new Error('Ошибка при получении расценки');
        }
    }

    // Получение расценок по услуге
    async getPricesByService(serviceId) {
        try {
            const service = await Service.findById(serviceId);

            if (!service) {
                return { success: false, message: 'Услуга не найдена' };
            }

            const prices = await Price.find({ service: serviceId })
                .populate({
                    path: 'service',
                    select: 'title slug category',
                    populate: {
                        path: 'category',
                        select: 'title slug section'
                    }
                })
                .sort({ sortOrder: 1, createdAt: 1 });

            return { success: true, data: prices };

        } catch (error) {
            console.error('❌ Ошибка при получении расценок по услуге:', error);
            throw new Error('Ошибка при получении расценок по услуге');
        }
    }

    // Получение расценок по категории (через услуги)
    async getPricesByCategory(categoryId) {
        try {
            // Находим все услуги этой категории
            const services = await Service.find({ category: categoryId }).select('_id');
            const serviceIds = services.map(s => s._id);

            const prices = await Price.find({ service: { $in: serviceIds } })
                .populate({
                    path: 'service',
                    select: 'title slug category',
                    populate: {
                        path: 'category',
                        select: 'title slug section'
                    }
                })
                .sort({ sortOrder: 1, createdAt: 1 });

            return { success: true, data: prices };

        } catch (error) {
            console.error('❌ Ошибка при получении расценок по категории:', error);
            throw new Error('Ошибка при получении расценок по категории');
        }
    }

    // Получение расценок сгруппированных по услугам
    async getPricesGroupedByService() {
        try {
            const prices = await Price.find()
                .populate({
                    path: 'service',
                    select: 'title slug category',
                    populate: {
                        path: 'category',
                        select: 'title slug section sortOrder'
                    }
                })
                .sort({ sortOrder: 1 });

            // Группируем по услугам
            const grouped = {};

            for (const price of prices) {
                const serviceId = price.service._id.toString();

                if (!grouped[serviceId]) {
                    grouped[serviceId] = {
                        service: price.service,
                        items: []
                    };
                }

                grouped[serviceId].items.push({
                    _id: price._id,
                    title: price.title,
                    description: price.description,
                    price: price.price,
                    sortOrder: price.sortOrder
                });
            }

            // Преобразуем в массив
            const result = Object.values(grouped);

            return { success: true, data: result };

        } catch (error) {
            console.error('❌ Ошибка при получении сгруппированных расценок:', error);
            throw new Error('Ошибка при получении сгруппированных расценок');
        }
    }

    // Создание новой расценки
    async createPrice(priceData) {
        try {
            const { title, description, price, serviceId, sortOrder } = priceData;

            // Проверяем существование услуги
            const service = await Service.findById(serviceId);

            if (!service) {
                return { success: false, message: 'Услуга не найдена' };
            }

            const newPrice = new Price({
                title: title.trim(),
                description: description ? description.trim() : '',
                price: parseFloat(price),
                service: serviceId,
                sortOrder: parseInt(sortOrder) || 0
            });

            await newPrice.save();

            // Возвращаем с populated service
            const populatedPrice = await Price.findById(newPrice._id)
                .populate({
                    path: 'service',
                    select: 'title slug category',
                    populate: {
                        path: 'category',
                        select: 'title slug section'
                    }
                });

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
            const { title, description, price, serviceId, sortOrder } = updateData;

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

            // Если меняется услуга — проверяем существование
            if (serviceId && serviceId.toString() !== existingPrice.service.toString()) {
                const newService = await Service.findById(serviceId);

                if (!newService) {
                    return { success: false, message: 'Услуга не найдена' };
                }

                updateFields.service = serviceId;
            }

            if (Object.keys(updateFields).length === 0) {
                return { success: true, data: existingPrice, message: 'Нет изменений для обновления' };
            }

            const updatedPrice = await Price.findByIdAndUpdate(
                priceId,
                updateFields,
                { new: true, runValidators: true }
            ).populate({
                path: 'service',
                select: 'title slug category',
                populate: {
                    path: 'category',
                    select: 'title slug section'
                }
            });

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