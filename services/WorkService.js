import Work from '../models/Work.model.js';
import Service from '../models/Service.model.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';

class WorkService {

  // Получение всех работ
  async getAllWorks(filters = {}) {
    try {
      const { service, category, limit, page = 1 } = filters;

      const query = {};

      // Фильтр по услуге
      if (service) {
        query.service = service;
      }

      // Фильтр по категории (через услугу)
      if (category) {
        // Находим все услуги этой категории
        const services = await Service.find({ category }).select('_id');
        const serviceIds = services.map(s => s._id);
        query.service = { $in: serviceIds };
      }

      const skip = (page - 1) * (limit || 0);
      const options = { sort: { createdAt: -1 } };

      if (limit) {
        options.limit = parseInt(limit);
        options.skip = skip;
      }

      const works = await Work.find(query, null, options)
        .populate({
          path: 'service',
          select: 'title slug category',
          populate: {
            path: 'category',
            select: 'title slug section'
          }
        });

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
      const work = await Work.findById(workId)
        .populate({
          path: 'service',
          select: 'title slug category',
          populate: {
            path: 'category',
            select: 'title slug section'
          }
        });

      if (!work) {
        return { success: false, message: 'Работа не найдена' };
      }

      return { success: true, data: work };

    } catch (error) {
      console.error('❌ Ошибка при получении работы:', error);
      throw new Error('Ошибка при получении работы');
    }
  }

  // Получение работ по услуге
  async getWorksByService(serviceId) {
    try {
      // Проверяем существование услуги
      const service = await Service.findById(serviceId);

      if (!service) {
        return { success: false, message: 'Услуга не найдена' };
      }

      const works = await Work.find({ service: serviceId })
        .populate({
          path: 'service',
          select: 'title slug category',
          populate: {
            path: 'category',
            select: 'title slug section'
          }
        })
        .sort({ createdAt: -1 });

      return { success: true, data: works };

    } catch (error) {
      console.error('❌ Ошибка при получении работ по услуге:', error);
      throw new Error('Ошибка при получении работ по услуге');
    }
  }

  // Получение работ по категории (через услуги)
  async getWorksByCategory(categoryId) {
    try {
      // Находим все услуги этой категории
      const services = await Service.find({ category: categoryId }).select('_id');
      const serviceIds = services.map(s => s._id);

      const works = await Work.find({ service: { $in: serviceIds } })
        .populate({
          path: 'service',
          select: 'title slug category',
          populate: {
            path: 'category',
            select: 'title slug section'
          }
        })
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
        .populate({
          path: 'service',
          select: 'title slug category',
          populate: {
            path: 'category',
            select: 'title slug section'
          }
        })
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
      const { serviceId } = workData;

      // Проверяем существование услуги
      const service = await Service.findById(serviceId);

      if (!service) {
        return { success: false, message: 'Услуга не найдена' };
      }

      const work = new Work({
        service: serviceId,
        image: imagePath
      });

      await work.save();

      // Возвращаем с populated service
      const populatedWork = await Work.findById(work._id)
        .populate({
          path: 'service',
          select: 'title slug category',
          populate: {
            path: 'category',
            select: 'title slug section'
          }
        });

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