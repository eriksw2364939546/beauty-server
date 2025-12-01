import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import { generateSlug } from '../utils/slug.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';

class ProductService {

  // Получение всех товаров
  async getAllProducts(filters = {}) {
    try {
      const { category, brand, search, minPrice, maxPrice, limit, page = 1 } = filters;

      const query = {};

      if (category) {
        query.category = category;
      }

      if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
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

      const products = await Product.find(query, null, options).populate('category', 'title slug section');
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
      const product = await Product.findById(productId).populate('category', 'title slug section');

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
      const product = await Product.findOne({ slug: slug.toLowerCase() }).populate('category', 'title slug section');

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
      const product = await Product.findOne({ code: code.toUpperCase() }).populate('category', 'title slug section');

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
  async getProductsByCategory(categoryId, options = {}) {
    try {
      const { page = 1, limit = 12 } = options;

      const query = { category: categoryId };
      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .populate('category', 'title slug section')
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
        .populate('category', 'title slug section')
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
          { code: { $regex: searchQuery, $options: 'i' } },
          { brand: { $regex: searchQuery, $options: 'i' } }
        ]
      };

      const skip = (page - 1) * limit;

      const products = await Product.find(query)
        .populate('category', 'title slug section')
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

  // Получение уникальных брендов
  async getAllBrands() {
    try {
      const brands = await Product.distinct('brand');

      return { success: true, data: brands.sort() };

    } catch (error) {
      console.error('❌ Ошибка при получении брендов:', error);
      throw new Error('Ошибка при получении брендов');
    }
  }

  // Создание нового товара
  async createProduct(productData, imagePath) {
    try {
      const { title, description, price, code, brand, categoryId } = productData;

      // Проверяем существование категории с section: 'product'
      const category = await Category.findById(categoryId);

      if (!category) {
        return { success: false, message: 'Категория не найдена' };
      }

      if (category.section !== 'product') {
        return {
          success: false,
          message: `Категория "${category.title}" не относится к секции "product". Текущая секция: "${category.section}"`
        };
      }

      const slug = await generateSlug(title, 'Product');

      const product = new Product({
        title: title.trim(),
        slug: slug.toLowerCase(),
        description: description.trim(),
        price: parseFloat(price),
        code: code.toUpperCase().trim(),
        brand: brand.trim(),
        category: categoryId,
        image: imagePath
      });

      await product.save();

      // Возвращаем с populated category
      const populatedProduct = await Product.findById(product._id).populate('category', 'title slug section');

      return {
        success: true,
        data: populatedProduct,
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
      const { title, description, price, code, brand, categoryId } = updateData;

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

      if (brand && brand.trim() !== product.brand) {
        updateFields.brand = brand.trim();
      }

      // Если меняется категория — проверяем что новая категория с section: 'product'
      if (categoryId && categoryId.toString() !== product.category.toString()) {
        const newCategory = await Category.findById(categoryId);

        if (!newCategory) {
          return { success: false, message: 'Категория не найдена' };
        }

        if (newCategory.section !== 'product') {
          return {
            success: false,
            message: `Категория "${newCategory.title}" не относится к секции "product"`
          };
        }

        updateFields.category = categoryId;
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
      ).populate('category', 'title slug section');

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