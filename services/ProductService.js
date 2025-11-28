import Product from '../models/Product.model.js';
import { generateSlug } from '../utils/slug.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';

class ProductService {

  // Получение всех товаров
  async getAllProducts(filters = {}) {
    try {
      const { category, search, minPrice, maxPrice, limit, page = 1 } = filters;

      const query = {};

      if (category) {
        query.categorySlug = category.toLowerCase();
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ];
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      const skip = (page - 1) * (limit || 0);
      const options = { sort: { createdAt: -1 } };

      if (limit) {
        options.limit = parseInt(limit);
        options.skip = skip;
      }

      const products = await Product.find(query, null, options);
      const total = await Product.countDocuments(query);

      return {
        success: true,
        data: products,
        meta: {
          page: parseInt(page),
          limit: limit ? parseInt(limit) : total,
          total,
          pages: limit ? Math.ceil(total / limit) : 1
        }
      };

    } catch (error) {
      console.error('❌ Ошибка при получении товаров:', error);
      throw new Error('Ошибка при получении товаров');
    }
  }

  // Получение товара по ID
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return { success: false, message: 'Товар не найден' };
      }

      return { success: true, data: product };

    } catch (error) {
      console.error('❌ Ошибка при получении товара:', error);
      throw new Error('Ошибка при получении товара');
    }
  }

  // Получение товара по slug
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({ slug: slug.toLowerCase() });

      if (!product) {
        return { success: false, message: 'Товар не найден' };
      }

      return { success: true, data: product };

    } catch (error) {
      console.error('❌ Ошибка при получении товара:', error);
      throw new Error('Ошибка при получении товара');
    }
  }

  // Получение товара по артикулу
  async getProductByCode(code) {
    try {
      const product = await Product.findOne({ code: code.toUpperCase() });

      if (!product) {
        return { success: false, message: 'Товар не найден' };
      }

      return { success: true, data: product };

    } catch (error) {
      console.error('❌ Ошибка при получении товара:', error);
      throw new Error('Ошибка при получении товара');
    }
  }

  // Получение товаров по категории
  async getProductsByCategory(categorySlug, options = {}) {
    try {
      const { page = 1, limit = 12 } = options;

      const query = { categorySlug: categorySlug.toLowerCase() };
      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(query);

      return {
        success: true,
        data: products,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('❌ Ошибка при получении товаров по категории:', error);
      throw new Error('Ошибка при получении товаров по категории');
    }
  }

  // Получение рекомендуемых товаров
  async getFeaturedProducts(limit = 8) {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(limit);

      return { success: true, data: products };

    } catch (error) {
      console.error('❌ Ошибка при получении рекомендуемых товаров:', error);
      throw new Error('Ошибка при получении рекомендуемых товаров');
    }
  }

  // Поиск товаров
  async searchProducts(searchQuery, options = {}) {
    try {
      const { page = 1, limit = 12 } = options;

      const query = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { code: { $regex: searchQuery, $options: 'i' } }
        ]
      };

      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Product.countDocuments(query);

      return {
        success: true,
        data: products,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('❌ Ошибка при поиске товаров:', error);
      throw new Error('Ошибка при поиске товаров');
    }
  }

  // Создание нового товара
  async createProduct(productData, imagePath) {
    try {
      const { title, description, price, code, categorySlug } = productData;

      const slug = await generateSlug(title, 'Product');

      const product = new Product({
        title: title.trim(),
        slug: slug.toLowerCase(),
        description: description.trim(),
        price: parseFloat(price),
        code: code.toUpperCase().trim(),
        categorySlug: categorySlug.toLowerCase(),
        image: imagePath  // "/uploads/products/uuid.webp"
      });

      await product.save();

      return {
        success: true,
        data: product,
        message: 'Товар успешно создан'
      };

    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern?.slug) {
          return { success: false, message: 'Товар с таким названием уже существует' };
        }
        if (error.keyPattern?.code) {
          return { success: false, message: 'Товар с таким артикулом уже существует' };
        }
      }

      console.error('❌ Ошибка при создании товара:', error);
      throw new Error('Ошибка при создании товара');
    }
  }

  // Обновление товара
  async updateProduct(productId, updateData, newImagePath) {
    try {
      const { title, description, price, code, categorySlug } = updateData;

      const product = await Product.findById(productId);

      if (!product) {
        return { success: false, message: 'Товар не найден' };
      }

      const updateFields = {};

      if (title && title.trim() !== product.title) {
        updateFields.title = title.trim();
        updateFields.slug = (await generateSlug(title, 'Product')).toLowerCase();
      }

      if (description && description.trim() !== product.description) {
        updateFields.description = description.trim();
      }

      if (price !== undefined && parseFloat(price) !== product.price) {
        updateFields.price = parseFloat(price);
      }

      if (code && code.toUpperCase().trim() !== product.code) {
        updateFields.code = code.toUpperCase().trim();
      }

      if (categorySlug && categorySlug.toLowerCase() !== product.categorySlug) {
        updateFields.categorySlug = categorySlug.toLowerCase();
      }

      // Если загружено новое изображение — удаляем старое
      if (newImagePath) {
        await uploadPhotoMiddleware.deleteImage(product.image);
        updateFields.image = newImagePath;
      }

      if (Object.keys(updateFields).length === 0) {
        return { success: true, data: product, message: 'Нет изменений для обновления' };
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateFields,
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: updatedProduct,
        message: 'Товар успешно обновлён'
      };

    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern?.slug) {
          return { success: false, message: 'Товар с таким названием уже существует' };
        }
        if (error.keyPattern?.code) {
          return { success: false, message: 'Товар с таким артикулом уже существует' };
        }
      }

      console.error('❌ Ошибка при обновлении товара:', error);
      throw new Error('Ошибка при обновлении товара');
    }
  }

  // Удаление товара
  async deleteProduct(productId) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        return { success: false, message: 'Товар не найден' };
      }

      // Удаляем файл изображения
      await uploadPhotoMiddleware.deleteImage(product.image);

      await Product.findByIdAndDelete(productId);

      return { success: true, message: 'Товар успешно удалён' };

    } catch (error) {
      console.error('❌ Ошибка при удалении товара:', error);
      throw new Error('Ошибка при удалении товара');
    }
  }
}

export default new ProductService();