import ServiceService from '../services/ServiceService.js';

class ServiceController {
  // GET /api/services - получить все услуги
  async getAll(req, res, next) {
    try {
      const { category, search, page, limit } = req.query;

      const result = await ServiceService.getAllServices({
        category,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
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

  // GET /api/services/:slug - получить услугу по slug
  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const result = await ServiceService.getServiceBySlug(slug);

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

  // GET /api/services/id/:id - получить услугу по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ServiceService.getServiceById(id);

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

  // GET /api/services/by-category/:categoryId - услуги по категории
  async getByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;

      const result = await ServiceService.getServicesByCategory(categoryId);

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

  // POST /api/admin/services - создать услугу
  async create(req, res, next) {
    try {
      // Проверяем наличие обработанного изображения
      if (!req.processedImage) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: 'Изображение обязательно'
        });
      }

      const result = await ServiceService.createService(req.body, req.processedImage);

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

  // PATCH /api/admin/services/:id - обновить услугу
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ServiceService.updateService(id, req.body, req.processedImage);

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

  // DELETE /api/admin/services/:id - удалить услугу
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ServiceService.deleteService(id);

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
}

export default new ServiceController();