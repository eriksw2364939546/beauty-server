import PriceService from '../services/PriceService.js';

class PriceController {
    // GET /api/prices - получить все расценки
    async getAll(req, res, next) {
        try {
            const { service, category, search, page, limit } = req.query;

            const result = await PriceService.getAllPrices({
                service,
                category,
                search,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50
            });

            if (!result.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'fetch_error',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                data: result.data,
                meta: result.meta
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/prices/:id - получить расценку по ID
    async getById(req, res, next) {
        try {
            const { id } = req.params;

            const result = await PriceService.getPriceById(id);

            if (!result.success) {
                return res.status(404).json({
                    ok: false,
                    error: 'not_found',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                data: result.data
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/prices/by-service/:serviceId - расценки по услуге
    async getByService(req, res, next) {
        try {
            const { serviceId } = req.params;

            const result = await PriceService.getPricesByService(serviceId);

            if (!result.success) {
                return res.status(404).json({
                    ok: false,
                    error: 'not_found',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                data: result.data
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/prices/by-category/:categoryId - расценки по категории
    async getByCategory(req, res, next) {
        try {
            const { categoryId } = req.params;

            const result = await PriceService.getPricesByCategory(categoryId);

            if (!result.success) {
                return res.status(404).json({
                    ok: false,
                    error: 'not_found',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                data: result.data
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/prices/grouped - расценки сгруппированные по услугам
    async getGrouped(req, res, next) {
        try {
            const result = await PriceService.getPricesGroupedByService();

            if (!result.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'fetch_error',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                data: result.data
            });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/prices - создать расценку
    async create(req, res, next) {
        try {
            const result = await PriceService.createPrice(req.body);

            if (!result.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'create_error',
                    message: result.message
                });
            }

            res.status(201).json({
                ok: true,
                data: result.data,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/prices/:id - обновить расценку
    async update(req, res, next) {
        try {
            const { id } = req.params;

            const result = await PriceService.updatePrice(id, req.body);

            if (!result.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'update_error',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                data: result.data,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/admin/prices/:id - удалить расценку
    async delete(req, res, next) {
        try {
            const { id } = req.params;

            const result = await PriceService.deletePrice(id);

            if (!result.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'delete_error',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/prices/:id/sort-order - изменить порядок сортировки
    async updateSortOrder(req, res, next) {
        try {
            const { id } = req.params;
            const { sortOrder } = req.body;

            const result = await PriceService.updateSortOrder(id, sortOrder);

            if (!result.success) {
                return res.status(400).json({
                    ok: false,
                    error: 'update_error',
                    message: result.message
                });
            }

            res.json({
                ok: true,
                data: result.data,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PriceController();