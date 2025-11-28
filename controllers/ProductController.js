import ProductService from '../services/ProductService.js';

class ProductController {
  // GET /api/products - получить все товары
  async getAll(req, res, next) {
    try {
      const { category, search, minPrice, maxPrice, page, limit } = req.query;

      const result = await ProductService.getAllProducts({
        category,
        search,
        minPrice: parseFloat(minPrice) || undefined,
        maxPrice: parseFloat(maxPrice) || undefined,
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

  // GET /api/products/:slug - получить товар по slug
  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const result = await ProductService.getProductBySlug(slug);

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

  // GET /api/products/id/:id - получить товар по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ProductService.getProductById(id);

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

  // GET /api/products/code/:code - получить товар по артикулу
  async getByCode(req, res, next) {
    try {
      const { code } = req.params;

      const result = await ProductService.getProductByCode(code);

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

  // GET /api/products/by-category/:categorySlug - товары по категории
  async getByCategory(req, res, next) {
    try {
      const { categorySlug } = req.params;
      const { page, limit } = req.query;

      const result = await ProductService.getProductsByCategory(categorySlug, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      if (!result.success) {
        return res.status(404).json({
          ok: false,
          error: 'not_found',
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

  // GET /api/products/featured - рекомендуемые товары
  async getFeatured(req, res, next) {
    try {
      const { limit } = req.query;

      const result = await ProductService.getFeaturedProducts(parseInt(limit) || 8);

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

  // GET /api/products/search - поиск товаров
  async search(req, res, next) {
    try {
      const { query, page, limit } = req.query;

      const result = await ProductService.searchProducts(query, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'search_error',
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

  // POST /api/admin/products - создать товар
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

      const result = await ProductService.createProduct(req.body, req.processedImage);

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

  // PATCH /api/admin/products/:id - обновить товар
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ProductService.updateProduct(id, req.body, req.processedImage);

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

  // DELETE /api/admin/products/:id - удалить товар
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await ProductService.deleteProduct(id);

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

export default new ProductController();