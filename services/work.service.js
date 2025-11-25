import Work from '../models/Work.model.js';

class WorkService {

  // Получение всех работ
  async getAllWorks(filters = {}) {
    try {
      const { category, limit, page = 1 } = filters;
      
      // Строим фильтр
      const query = {};
      
      if (category) {
        query.categorySlug = category.toLowerCase();
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

  // Получение работ по категории
  async getWorksByCategory(categorySlug) {
    try {
      const works = await Work.find({ 
        categorySlug: categorySlug.toLowerCase() 
      }).sort({ createdAt: -1 });
      
      return {
        success: true,
        data: works
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении работ по категории:', error);
      throw new Error('Ошибка при получении работ по категории');
    }
  }

  // Получение работы по ID
  async getWorkById(workId) {
    try {
      const work = await Work.findById(workId);
      
      if (!work) {
        return {
          success: false,
          message: 'Работа не найдена'
        };
      }
      
      return {
        success: true,
        data: work
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении работы:', error);
      throw new Error('Ошибка при получении работы');
    }
  }

  // Создание новой работы
  async createWork(workData) {
    try {
      const { categorySlug, image } = workData;
      
      // Создаем работу
      const work = new Work({
        categorySlug: categorySlug.toLowerCase(),
        image: {
          large: image.large,
          medium: image.medium,
          thumb: image.thumb
        }
      });
      
      await work.save();
      
      return {
        success: true,
        data: work,
        message: 'Работа успешно добавлена'
      };
      
    } catch (error) {
      console.error('❌ Ошибка при создании работы:', error);
      throw new Error('Ошибка при создании работы');
    }
  }

  // Обновление работы
  async updateWork(workId, updateData) {
    try {
      const { categorySlug, image } = updateData;
      
      const work = await Work.findById(workId);
      
      if (!work) {
        return {
          success: false,
          message: 'Работа не найдена'
        };
      }
      
      // Подготавливаем данные для обновления
      const updateFields = {};
      
      if (categorySlug && categorySlug.toLowerCase() !== work.categorySlug) {
        updateFields.categorySlug = categorySlug.toLowerCase();
      }
      
      if (image) {
        updateFields.image = {
          large: image.large || work.image.large,
          medium: image.medium || work.image.medium,
          thumb: image.thumb || work.image.thumb
        };
      }
      
      // Если нет изменений
      if (Object.keys(updateFields).length === 0) {
        return {
          success: true,
          data: work,
          message: 'Нет изменений для обновления'
        };
      }
      
      const updatedWork = await Work.findByIdAndUpdate(
        workId,
        updateFields,
        { new: true, runValidators: true }
      );
      
      return {
        success: true,
        data: updatedWork,
        message: 'Работа успешно обновлена'
      };
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении работы:', error);
      throw new Error('Ошибка при обновлении работы');
    }
  }

  // Удаление работы
  async deleteWork(workId) {
    try {
      const work = await Work.findById(workId);
      
      if (!work) {
        return {
          success: false,
          message: 'Работа не найдена'
        };
      }
      
      await Work.findByIdAndDelete(workId);
      
      return {
        success: true,
        message: 'Работа успешно удалена',
        deletedImages: work.image // Возвращаем пути к изображениям для удаления файлов
      };
      
    } catch (error) {
      console.error('❌ Ошибка при удалении работы:', error);
      throw new Error('Ошибка при удалении работы');
    }
  }

  // Получение последних работ
  async getLatestWorks(limit = 10) {
    try {
      const works = await Work.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
      
      return {
        success: true,
        data: works
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении последних работ:', error);
      throw new Error('Ошибка при получении последних работ');
    }
  }

  // Получение случайных работ
  async getRandomWorks(limit = 6) {
    try {
      const works = await Work.aggregate([
        { $sample: { size: parseInt(limit) } }
      ]);
      
      return {
        success: true,
        data: works
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении случайных работ:', error);
      throw new Error('Ошибка при получении случайных работ');
    }
  }

  // Получение статистики работ
  async getWorksStats() {
    try {
      const totalWorks = await Work.countDocuments();
      
      const worksByCategory = await Work.aggregate([
        {
          $group: {
            _id: '$categorySlug',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      return {
        success: true,
        data: {
          total: totalWorks,
          byCategory: worksByCategory
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении статистики работ:', error);
      throw new Error('Ошибка при получении статистики работ');
    }
  }

}

export default new WorkService();