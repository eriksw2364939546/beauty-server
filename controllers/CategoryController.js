import CategoryService from '../services/CategoryService.js';
import { validateCategory, validateCategoryUpdate } from '../validations/category.validation.js';

class CategoryController {
  // GET /api/categories - получить все категории
  async getAll(req, res, next) {
    try {
      const { section, page, limit } = req.query;
      
      const result = await CategoryService.getAll({
        section,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      res.json({
        ok: true,
        data: result.categories,
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

  // GET /api/categories/:id - получить категорию по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const category = await CategoryService.getById(id);

      res.json({
        ok: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/categories/slug/:slug - получить категорию по slug
  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      
      const category = await CategoryService.getBySlug(slug);

      res.json({
        ok: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/categories - создать категорию
  async create(req, res, next) {
    try {
      // Валидация входных данных
      const { error, value } = validateCategory(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          details: error.details
        });
      }

      const category = await CategoryService.create(value);

      res.status(201).json({
        ok: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/categories/:id - обновить категорию
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Валидация входных данных
      const { error, value } = validateCategoryUpdate(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          details: error.details
        });
      }

      const category = await CategoryService.update(id, value);

      res.json({
        ok: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/categories/:id - удалить категорию
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await CategoryService.delete(id);

      res.json({
        ok: true,
        message: 'Категория удалена'
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/categories/:id/sort-order - изменить порядок сортировки
  async updateSortOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { sortOrder } = req.body;

      if (typeof sortOrder !== 'number') {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: 'sortOrder должен быть числом'
        });
      }

      const category = await CategoryService.updateSortOrder(id, sortOrder);

      res.json({
        ok: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();