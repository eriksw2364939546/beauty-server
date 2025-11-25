import Product from '../models/Product.model.js';
import { generateSlug } from '../utils/slug.js';

class ProductService {

  // Получение всех продуктов
  async getAllProducts(filters = {}) {
    try {
      const { category, search, limit, page = 1 } = filters;
      
      // Строим фильтр
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
      
      // Настройки пагинации
      const skip = (page - 1) * (limit || 0);
      const options = {
        sort: { createdAt: -1 }
      };
      
      if (limit) {
        options.limit = parseInt(limit);
        options.skip = skip;
      }
      
      // Выполняем запрос
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
      console.error('❌ Ошибка при получении продуктов:', error);
      throw new Error('Ошибка при получении продуктов');
    }
  }

  // Получение продукта по slug
  async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({ slug: slug.toLowerCase() });
      
      if (!product) {
        return {
          success: false,
          message: 'Продукт не найден'
        };
      }
      
      return {
        success: true,
        data: product
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении продукта:', error);
      throw new Error('Ошибка при получении продукта');
    }
  }

  // Получение продукта по коду (артикулу)
  async getProductByCode(code) {
    try {
      const product = await Product.findOne({ code: code.trim() });
      
      if (!product) {
        return {
          success: false,
          message: 'Продукт с таким артикулом не найден'
        };
      }
      
      return {
        success: true,
        data: product
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении продукта по коду:', error);
      throw new Error('Ошибка при получении продукта по коду');
    }
  }

  // Получение продуктов по категории
  async getProductsByCategory(categorySlug) {
    try {
      const products = await Product.find({ 
        categorySlug: categorySlug.toLowerCase() 
      }).sort({ createdAt: -1 });
      
      return {
        success: true,
        data: products
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении продуктов по категории:', error);
      throw new Error('Ошибка при получении продуктов по категории');
    }
  }

  // Создание нового продукта
  async createProduct(productData) {
    try {
      const { title, description, price, code, categorySlug, image } = productData;
      
      // Генерируем уникальный slug
      const slug = await generateSlug(title, 'Product');
      
      // Создаем продукт
      const product = new Product({
        title: title.trim(),
        slug: slug.toLowerCase(),
        description: description.trim(),
        price: parseFloat(price),
        code: code.trim().toUpperCase(), // Код товара в верхнем регистре
        categorySlug: categorySlug.toLowerCase(),
        image: {
          large: image.large,
          medium: image.medium,
          thumb: image.thumb
        }
      });
      
      await product.save();
      
      return {
        success: true,
        data: product,
        message: 'Продукт успешно создан'
      };
      
    } catch (error) {
      // Обработка ошибок дублирования
      if (error.code === 11000) {
        if (error.keyPattern?.slug) {
          return {
            success: false,
            message: 'Продукт с таким названием уже существует'
          };
        }
        if (error.keyPattern?.code) {
          return {
            success: false,
            message: 'Продукт с таким артикулом уже существует'
          };
        }
      }
      
      console.error('❌ Ошибка при создании продукта:', error);
      throw new Error('Ошибка при создании продукта');
    }
  }

  // Обновление продукта
  async updateProduct(productId, updateData) {
    try {
      const { title, description, price, code, categorySlug, image } = updateData;
      
      const product = await Product.findById(productId);
      
      if (!product) {
        return {
          success: false,
          message: 'Продукт не найден'
        };
      }
      
      // Подготавливаем данные для обновления
      const updateFields = {};
      
      if (title && title.trim() !== product.title) {
        updateFields.title = title.trim();
        // Генерируем новый slug если изменился title
        updateFields.slug = (await generateSlug(title, 'Product')).toLowerCase();
      }
      
      if (description && description.trim() !== product.description) {
        updateFields.description = description.trim();
      }
      
      if (price !== undefined && parseFloat(price) !== product.price) {
        updateFields.price = parseFloat(price);
      }
      
      if (code && code.trim().toUpperCase() !== product.code) {
        updateFields.code = code.trim().toUpperCase();
      }
      
      if (categorySlug && categorySlug.toLowerCase() !== product.categorySlug) {
        updateFields.categorySlug = categorySlug.toLowerCase();
      }
      
      if (image) {
        updateFields.image = {
          large: image.large || product.image.large,
          medium: image.medium || product.image.medium,
          thumb: image.thumb || product.image.thumb
        };
      }
      
      // Если нет изменений
      if (Object.keys(updateFields).length === 0) {
        return {
          success: true,
          data: product,
          message: 'Нет изменений для обновления'
        };
      }
      
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateFields,
        { new: true, runValidators: true }
      );
      
      return {
        success: true,
        data: updatedProduct,
        message: 'Продукт успешно обновлен'
      };
      
    } catch (error) {
      // Обработка ошибок дублирования
      if (error.code === 11000) {
        if (error.keyPattern?.slug) {
          return {
            success: false,
            message: 'Продукт с таким названием уже существует'
          };
        }
        if (error.keyPattern?.code) {
          return {
            success: false,
            message: 'Продукт с таким артикулом уже существует'
          };
        }
      }
      
      console.error('❌ Ошибка при обновлении продукта:', error);
      throw new Error('Ошибка при обновлении продукта');
    }
  }

  // Удаление продукта
  async deleteProduct(productId) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        return {
          success: false,
          message: 'Продукт не найден'
        };
      }
      
      await Product.findByIdAndDelete(productId);
      
      return {
        success: true,
        message: 'Продукт успешно удален',
        deletedImages: product.image // Возвращаем пути к изображениям для удаления файлов
      };
      
    } catch (error) {
      console.error('❌ Ошибка при удалении продукта:', error);
      throw new Error('Ошибка при удалении продукта');
    }
  }

  // Поиск продуктов
  async searchProducts(searchQuery, filters = {}) {
    try {
      const { category, minPrice, maxPrice, limit = 20, page = 1 } = filters;
      
      const query = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { code: { $regex: searchQuery, $options: 'i' } }
        ]
      };
      
      if (category) {
        query.categorySlug = category.toLowerCase();
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
        if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
      }
      
      const skip = (page - 1) * limit;
      
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
        
      const total = await Product.countDocuments(query);
      
      return {
        success: true,
        data: products,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          query: searchQuery
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при поиске продуктов:', error);
      throw new Error('Ошибка при поиске продуктов');
    }
  }

  // Получение продуктов в ценовом диапазоне
  async getProductsByPriceRange(minPrice, maxPrice, filters = {}) {
    try {
      const { category, limit, page = 1 } = filters;
      
      const query = {
        price: {
          $gte: parseFloat(minPrice),
          $lte: parseFloat(maxPrice)
        }
      };
      
      if (category) {
        query.categorySlug = category.toLowerCase();
      }
      
      const skip = (page - 1) * (limit || 0);
      const options = {
        sort: { price: 1, createdAt: -1 }
      };
      
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
          pages: limit ? Math.ceil(total / limit) : 1,
          priceRange: { min: minPrice, max: maxPrice }
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении продуктов по цене:', error);
      throw new Error('Ошибка при получении продуктов по цене');
    }
  }

  // Получение статистики продуктов
  async getProductsStats() {
    try {
      const totalProducts = await Product.countDocuments();
      
      const productsByCategory = await Product.aggregate([
        {
          $group: {
            _id: '$categorySlug',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const priceStats = await Product.aggregate([
        {
          $group: {
            _id: null,
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      ]);
      
      return {
        success: true,
        data: {
          total: totalProducts,
          byCategory: productsByCategory,
          priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении статистики продуктов:', error);
      throw new Error('Ошибка при получении статистики продуктов');
    }
  }

}

export default new ProductService();