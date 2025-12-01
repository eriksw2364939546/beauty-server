import WorkService from '../services/WorkService.js';

class WorkController {
  // GET /api/works - получить все работы
  async getAll(req, res, next) {
    try {
      const { category, page, limit } = req.query;

      const result = await WorkService.getAllWorks({
        category,
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

  // GET /api/works/:id - получить работу по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await WorkService.getWorkById(id);

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

  // GET /api/works/by-category/:categoryId - работы по категории
  async getByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;

      const result = await WorkService.getWorksByCategory(categoryId);

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

  // GET /api/works/latest - получить последние работы
  async getLatest(req, res, next) {
    try {
      const { limit } = req.query;

      const result = await WorkService.getLatestWorks(parseInt(limit) || 6);

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

  // POST /api/admin/works - создать работу
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

      const result = await WorkService.createWork(req.body, req.processedImage);

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

  // DELETE /api/admin/works/:id - удалить работу
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await WorkService.deleteWork(id);

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

export default new WorkController();