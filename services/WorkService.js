import Work from '../models/Work.model.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';

class WorkService {

  // Получение всех работ
  async getAllWorks(filters = {}) {
    try {
      const { category, limit, page = 1 } = filters;

      const query = {};

      if (category) {
        query.categorySlug = category.toLowerCase();
      }

      const skip = (page - 1) * (limit || 0);
      const options = { sort: { createdAt: -1 } };

      if (limit) {
        options.limit = parseInt(limit);
        options.skip = skip;
      }

      const works = await Work.find(query, null, options);
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
      const work = await Work.findById(workId);

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
  async getWorksByCategory(categorySlug) {
    try {
      const works = await Work.find({
        categorySlug: categorySlug.toLowerCase()
      }).sort({ createdAt: -1 });

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
      const { categorySlug } = workData;

      const work = new Work({
        categorySlug: categorySlug.toLowerCase(),
        image: imagePath  // "/uploads/works/uuid.webp"
      });

      await work.save();

      return {
        success: true,
        data: work,
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