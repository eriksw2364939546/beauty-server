import Work from '../models/Work.model.js';
import Category from '../models/Category.model.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';

class WorkService {

  // Получение всех работ
  async getAllWorks(filters = {}) {
    try {
      const { category, limit, page = 1 } = filters;

      const query = {};

      if (category) {
        query.category = category;
      }

      const skip = (page - 1) * (limit || 0);
      const options = { sort: { createdAt: -1 } };

      if (limit) {
        options.limit = parseInt(limit);
        options.skip = skip;
      }

      const works = await Work.find(query, null, options).populate('category', 'title slug section');
      const total = await Work.countDocuments(query);

      return {
        success: true,
        data: works,
        meta: {
          page: parseInt(page),
          limit: limit ? parseInt(limit) : total,
          total,
          pages: limit ? Math.ceil(total / limit) : 1
        }
      };

    } catch (error) {
      console.error('❌ Ошибка при получении работ:', error);
      throw new Error('Ошибка при получении работ');
    }
  }

  // Получение работы по ID
  async getWorkById(workId) {
    try {
      const work = await Work.findById(workId).populate('category', 'title slug section');

      if (!work) {
        return { success: false, message: 'Работа не найдена' };
      }

      return { success: true, data: work };

    } catch (error) {
      console.error('❌ Ошибка при получении работы:', error);
      throw new Error('Ошибка при получении работы');
    }
  }

  // Получение работ по категории
  async getWorksByCategory(categoryId) {
    try {
      const works = await Work.find({ category: categoryId })
        .populate('category', 'title slug section')
        .sort({ createdAt: -1 });

      return { success: true, data: works };

    } catch (error) {
      console.error('❌ Ошибка при получении работ по категории:', error);
      throw new Error('Ошибка при получении работ по категории');
    }
  }

  // Получение последних работ
  async getLatestWorks(limit = 6) {
    try {
      const works = await Work.find()
        .populate('category', 'title slug section')
        .sort({ createdAt: -1 })
        .limit(limit);

      return { success: true, data: works };

    } catch (error) {
      console.error('❌ Ошибка при получении последних работ:', error);
      throw new Error('Ошибка при получении последних работ');
    }
  }

  // Создание новой работы
  async createWork(workData, imagePath) {
    try {
      const { categoryId } = workData;

      // Проверяем существование категории с section: 'work'
      const category = await Category.findById(categoryId);

      if (!category) {
        return { success: false, message: 'Категория не найдена' };
      }

      if (category.section !== 'work') {
        return {
          success: false,
          message: `Категория "${category.title}" не относится к секции "work". Текущая секция: "${category.section}"`
        };
      }

      const work = new Work({
        category: categoryId,
        image: imagePath
      });

      await work.save();

      // Возвращаем с populated category
      const populatedWork = await Work.findById(work._id).populate('category', 'title slug section');

      return {
        success: true,
        data: populatedWork,
        message: 'Работа успешно создана'
      };

    } catch (error) {
      console.error('❌ Ошибка при создании работы:', error);
      throw new Error('Ошибка при создании работы');
    }
  }

  // Удаление работы
  async deleteWork(workId) {
    try {
      const work = await Work.findById(workId);

      if (!work) {
        return { success: false, message: 'Работа не найдена' };
      }

      // Удаляем файл изображения
      await uploadPhotoMiddleware.deleteImage(work.image);

      await Work.findByIdAndDelete(workId);

      return { success: true, message: 'Работа успешно удалена' };

    } catch (error) {
      console.error('❌ Ошибка при удалении работы:', error);
      throw new Error('Ошибка при удалении работы');
    }
  }
}

export default new WorkService();