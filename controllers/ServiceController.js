import ServiceService from '../services/ServiceService.js';
import { validateService, validateServiceUpdate } from '../validations/service.validation.js';

class ServiceController {
  // GET /api/services - получить все услуги
  async getAll(req, res, next) {
    try {
      const { category, page, limit } = req.query;
      
      const result = await ServiceService.getAll({
        category,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      res.json({
        ok: true,
        data: result.services,
        meta: {
          page: result.page,
          total: result.total,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/services/:slug - получить услугу по slug
  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      
      const service = await ServiceService.getBySlug(slug);

      res.json({
        ok: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/services/id/:id - получить услугу по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const service = await ServiceService.getById(id);

      res.json({
        ok: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/services - создать услугу
  async create(req, res, next) {
    try {
      // Валидация входных данных
      const { error, value } = validateService(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          details: error.details
        });
      }

      // Проверяем наличие загруженного файла
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: 'Изображение обязательно'
        });
      }

      const service = await ServiceService.create(value, req.file);

      res.status(201).json({
        ok: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/services/:id - обновить услугу
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Валидация входных данных
      const { error, value } = validateServiceUpdate(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          details: error.details
        });
      }

      const service = await ServiceService.update(id, value, req.file);

      res.json({
        ok: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/services/:id - удалить услугу
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await ServiceService.delete(id);

      res.json({
        ok: true,
        message: 'Услуга удалена'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/services/by-category/:categorySlug - получить услуги по категории
  async getByCategory(req, res, next) {
    try {
      const { categorySlug } = req.params;
      const { page, limit } = req.query;

      const result = await ServiceService.getByCategory(categorySlug, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      res.json({
        ok: true,
        data: result.services,
        meta: {
          page: result.page,
          total: result.total,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ServiceController();