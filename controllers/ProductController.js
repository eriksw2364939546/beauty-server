import ProductService from '../services/ProductService.js';
import { validateProduct, validateProductUpdate } from '../validations/product.validation.js';

class ProductController {
  // GET /api/products - получить все товары
  async getAll(req, res, next) {
    try {
      const { search, category, page, limit } = req.query;
      
      const result = await ProductService.getAll({
        search,
        category,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      res.json({
        ok: true,
        data: result.products,
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

  // GET /api/products/:slug - получить товар по slug
  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      
      const product = await ProductService.getBySlug(slug);

      res.json({
        ok: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/id/:id - получить товар по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const product = await ProductService.getById(id);

      res.json({
        ok: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/code/:code - получить товар по артикулу
  async getByCode(req, res, next) {
    try {
      const { code } = req.params;
      
      const product = await ProductService.getByCode(code);

      res.json({
        ok: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/products - создать товар
  async create(req, res, next) {
    try {
      // Валидация входных данных
      const { error, value } = validateProduct(req.body);
      
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

      const product = await ProductService.create(value, req.file);

      res.status(201).json({
        ok: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/products/:id - обновить товар
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Валидация входных данных
      const { error, value } = validateProductUpdate(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          details: error.details
        });
      }

      const product = await ProductService.update(id, value, req.file);

      res.json({
        ok: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/products/:id - удалить товар
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await ProductService.delete(id);

      res.json({
        ok: true,
        message: 'Товар удален'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/by-category/:categorySlug - получить товары по категории
  async getByCategory(req, res, next) {
    try {
      const { categorySlug } = req.params;
      const { page, limit } = req.query;

      const result = await ProductService.getByCategory(categorySlug, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      res.json({
        ok: true,
        data: result.products,
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

  // GET /api/products/search - поиск товаров
  async search(req, res, next) {
    try {
      const { query, category, page, limit } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: 'Поисковый запрос должен содержать минимум 2 символа'
        });
      }

      const result = await ProductService.search({
        query,
        category,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      res.json({
        ok: true,
        data: result.products,
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

  // GET /api/products/featured - получить рекомендуемые товары
  async getFeatured(req, res, next) {
    try {
      const { limit } = req.query;

      const products = await ProductService.getFeatured(parseInt(limit) || 8);

      res.json({
        ok: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();