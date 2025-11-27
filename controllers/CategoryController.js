import CategoryService from '../services/CategoryService.js';

class CategoryController {
  // GET /api/categories - получить все категории
  async getAll(req, res, next) {
    try {
      const { section, page, limit } = req.query;

      const result = await CategoryService.getAllCategories({
        section,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
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

  // GET /api/categories/:id - получить категорию по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await CategoryService.getCategoryById(id);

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

  // GET /api/categories/slug/:slug - получить категорию по slug
  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const result = await CategoryService.getCategoryBySlug(slug);

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

  // POST /api/admin/categories - создать категорию
  async create(req, res, next) {
    try {
      // Валидация уже выполнена в middleware
      const result = await CategoryService.createCategory(req.body);

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

  // PATCH /api/admin/categories/:id - обновить категорию
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Валидация уже выполнена в middleware
      const result = await CategoryService.updateCategory(id, req.body);

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

  // DELETE /api/admin/categories/:id - удалить категорию
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await CategoryService.deleteCategory(id);

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

      const result = await CategoryService.updateCategory(id, { sortOrder });

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
        message: 'Порядок сортировки обновлён'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();