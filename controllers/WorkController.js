import WorkService from '../services/WorkService.js';
import { validateWork } from '../validations/work.validation.js';

class WorkController {
  // GET /api/works - получить все работы
  async getAll(req, res, next) {
    try {
      const { category, page, limit } = req.query;
      
      const result = await WorkService.getAll({
        category,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      res.json({
        ok: true,
        data: result.works,
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

  // GET /api/works/:id - получить работу по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const work = await WorkService.getById(id);

      res.json({
        ok: true,
        data: work
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/works - создать работу
  async create(req, res, next) {
    try {
      // Валидация входных данных
      const { error, value } = validateWork(req.body);
      
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

      const work = await WorkService.create(value, req.file);

      res.status(201).json({
        ok: true,
        data: work
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/works/:id - удалить работу
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await WorkService.delete(id);

      res.json({
        ok: true,
        message: 'Работа удалена'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/works/by-category/:categorySlug - получить работы по категории
  async getByCategory(req, res, next) {
    try {
      const { categorySlug } = req.params;
      const { page, limit } = req.query;

      const result = await WorkService.getByCategory(categorySlug, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      res.json({
        ok: true,
        data: result.works,
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

  // GET /api/works/latest - получить последние работы
  async getLatest(req, res, next) {
    try {
      const { limit } = req.query;

      const works = await WorkService.getLatest(parseInt(limit) || 6);

      res.json({
        ok: true,
        data: works
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new WorkController();