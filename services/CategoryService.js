import Category from '../models/Category.model.js';
import { generateSlug } from '../utils/slug.js';

class CategoryService {

  // Получение всех категорий
  async getAllCategories(filters = {}) {
    try {
      const { section, limit, page = 1 } = filters;

      // Строим фильтр
      const query = {};
      if (section) {
        query.section = section;
      }

      // Настройки пагинации
      const skip = (page - 1) * (limit || 0);
      const options = {
        sort: { section: 1, sortOrder: 1, createdAt: 1 }
      };

      if (limit) {
        options.limit = parseInt(limit);
        options.skip = skip;
      }

      // Выполняем запрос
      const categories = await Category.find(query, null, options);
      const total = await Category.countDocuments(query);

      return {
        success: true,
        data: categories,
        meta: {
          page: parseInt(page),
          limit: limit ? parseInt(limit) : total,
          total,
          pages: limit ? Math.ceil(total / limit) : 1
        }
      };

    } catch (error) {
      console.error('❌ Ошибка при получении категорий:', error);
      throw new Error('Ошибка при получении категорий');
    }
  }

  // Получение категории по ID
  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        return {
          success: false,
          message: 'Категория не найдена'
        };
      }

      return {
        success: true,
        data: category
      };

    } catch (error) {
      console.error('❌ Ошибка при получении категории:', error);
      throw new Error('Ошибка при получении категории');
    }
  }

  // Получение категории по slug
  async getCategoryBySlug(slug) {
    try {
      const category = await Category.findOne({ slug: slug.toLowerCase() });

      if (!category) {
        return {
          success: false,
          message: 'Категория не найдена'
        };
      }

      return {
        success: true,
        data: category
      };

    } catch (error) {
      console.error('❌ Ошибка при получении категории:', error);
      throw new Error('Ошибка при получении категории');
    }
  }

  // Создание новой категории
  async createCategory(categoryData) {
    try {
      const { title, section, sortOrder = 0 } = categoryData;

      // Генерируем уникальный slug
      const slug = await generateSlug(title, 'Category');

      // Создаем категорию
      const category = new Category({
        title: title.trim(),
        slug: slug.toLowerCase(),
        section,
        sortOrder: parseInt(sortOrder)
      });

      await category.save();

      return {
        success: true,
        data: category,
        message: 'Категория успешно создана'
      };

    } catch (error) {
      // Обработка ошибки дублирования slug
      if (error.code === 11000 && error.keyPattern?.slug) {
        return {
          success: false,
          message: 'Категория с таким названием уже существует'
        };
      }

      console.error('❌ Ошибка при создании категории:', error);
      throw new Error('Ошибка при создании категории');
    }
  }

  // Обновление категории
  async updateCategory(categoryId, updateData) {
    try {
      const { title, section, sortOrder } = updateData;

      const category = await Category.findById(categoryId);

      if (!category) {
        return {
          success: false,
          message: 'Категория не найдена'
        };
      }

      // Подготавливаем данные для обновления
      const updateFields = {};

      if (title && title.trim() !== category.title) {
        updateFields.title = title.trim();
        // Генерируем новый slug если изменился title
        updateFields.slug = (await generateSlug(title, 'Category')).toLowerCase();
      }

      if (section && section !== category.section) {
        updateFields.section = section;
      }

      if (sortOrder !== undefined && parseInt(sortOrder) !== category.sortOrder) {
        updateFields.sortOrder = parseInt(sortOrder);
      }

      // Если нет изменений
      if (Object.keys(updateFields).length === 0) {
        return {
          success: true,
          data: category,
          message: 'Нет изменений для обновления'
        };
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        updateFields,
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: updatedCategory,
        message: 'Категория успешно обновлена'
      };

    } catch (error) {
      // Обработка ошибки дублирования slug
      if (error.code === 11000 && error.keyPattern?.slug) {
        return {
          success: false,
          message: 'Категория с таким названием уже существует'
        };
      }

      console.error('❌ Ошибка при обновлении категории:', error);
      throw new Error('Ошибка при обновлении категории');
    }
  }

  // Удаление категории
  async deleteCategory(categoryId) {
    try {
      const category = await Category.findById(categoryId);

      if (!category) {
        return {
          success: false,
          message: 'Категория не найдена'
        };
      }

      await Category.findByIdAndDelete(categoryId);

      return {
        success: true,
        message: 'Категория успешно удалена'
      };

    } catch (error) {
      console.error('❌ Ошибка при удалении категории:', error);
      throw new Error('Ошибка при удалении категории');
    }
  }

  // Получение категорий по секции
  async getCategoriesBySection(section) {
    try {
      const categories = await Category.find({ section })
        .sort({ sortOrder: 1, createdAt: 1 });

      return {
        success: true,
        data: categories
      };

    } catch (error) {
      console.error('❌ Ошибка при получении категорий по секции:', error);
      throw new Error('Ошибка при получении категорий по секции');
    }
  }

}

export default new CategoryService();