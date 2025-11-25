import Master from '../models/Master.model.js';
import { generateSlug } from '../utils/slug.js';

class MasterService {

  // Получение всех мастеров
  async getAllMasters(filters = {}) {
    try {
      const { search, limit, page = 1 } = filters;
      
      // Строим фильтр
      const query = {};
      
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { speciality: { $regex: search, $options: 'i' } }
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
      const masters = await Master.find(query, null, options);
      const total = await Master.countDocuments(query);
      
      return {
        success: true,
        data: masters,
        meta: {
          page: parseInt(page),
          limit: limit ? parseInt(limit) : total,
          total,
          pages: limit ? Math.ceil(total / limit) : 1
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении мастеров:', error);
      throw new Error('Ошибка при получении мастеров');
    }
  }

  // Получение мастера по ID
  async getMasterById(masterId) {
    try {
      const master = await Master.findById(masterId);
      
      if (!master) {
        return {
          success: false,
          message: 'Мастер не найден'
        };
      }
      
      return {
        success: true,
        data: master
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении мастера:', error);
      throw new Error('Ошибка при получении мастера');
    }
  }

  // Получение мастера по slug
  async getMasterBySlug(slug) {
    try {
      const master = await Master.findOne({ slug: slug.toLowerCase() });
      
      if (!master) {
        return {
          success: false,
          message: 'Мастер не найден'
        };
      }
      
      return {
        success: true,
        data: master
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении мастера по slug:', error);
      throw new Error('Ошибка при получении мастера');
    }
  }

  // Получение мастеров по специальности
  async getMastersBySpeciality(speciality) {
    try {
      const masters = await Master.find({ 
        speciality: { $regex: speciality, $options: 'i' }
      }).sort({ createdAt: -1 });
      
      return {
        success: true,
        data: masters
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении мастеров по специальности:', error);
      throw new Error('Ошибка при получении мастеров по специальности');
    }
  }

  // Создание нового мастера
  async createMaster(masterData) {
    try {
      const { fullName, speciality, image } = masterData;
      
      // Генерируем уникальный slug
      const slug = await generateSlug(fullName, 'Master');
      
      // Создаем мастера
      const master = new Master({
        fullName: fullName.trim(),
        slug: slug.toLowerCase(),
        speciality: speciality.trim(),
        image: {
          large: image.large,
          medium: image.medium,
          thumb: image.thumb
        }
      });
      
      await master.save();
      
      return {
        success: true,
        data: master,
        message: 'Мастер успешно добавлен'
      };
      
    } catch (error) {
      // Обработка ошибки дублирования slug
      if (error.code === 11000 && error.keyPattern?.slug) {
        return {
          success: false,
          message: 'Мастер с таким именем уже существует'
        };
      }
      
      console.error('❌ Ошибка при создании мастера:', error);
      throw new Error('Ошибка при создании мастера');
    }
  }

  // Обновление мастера
  async updateMaster(masterId, updateData) {
    try {
      const { fullName, speciality, image } = updateData;
      
      const master = await Master.findById(masterId);
      
      if (!master) {
        return {
          success: false,
          message: 'Мастер не найден'
        };
      }
      
      // Подготавливаем данные для обновления
      const updateFields = {};
      
      if (fullName && fullName.trim() !== master.fullName) {
        updateFields.fullName = fullName.trim();
        // Генерируем новый slug если изменился fullName
        updateFields.slug = (await generateSlug(fullName, 'Master')).toLowerCase();
      }
      
      if (speciality && speciality.trim() !== master.speciality) {
        updateFields.speciality = speciality.trim();
      }
      
      if (image) {
        updateFields.image = {
          large: image.large || master.image.large,
          medium: image.medium || master.image.medium,
          thumb: image.thumb || master.image.thumb
        };
      }
      
      // Если нет изменений
      if (Object.keys(updateFields).length === 0) {
        return {
          success: true,
          data: master,
          message: 'Нет изменений для обновления'
        };
      }
      
      const updatedMaster = await Master.findByIdAndUpdate(
        masterId,
        updateFields,
        { new: true, runValidators: true }
      );
      
      return {
        success: true,
        data: updatedMaster,
        message: 'Информация о мастере успешно обновлена'
      };
      
    } catch (error) {
      // Обработка ошибки дублирования slug
      if (error.code === 11000 && error.keyPattern?.slug) {
        return {
          success: false,
          message: 'Мастер с таким именем уже существует'
        };
      }
      
      console.error('❌ Ошибка при обновлении мастера:', error);
      throw new Error('Ошибка при обновлении мастера');
    }
  }

  // Удаление мастера
  async deleteMaster(masterId) {
    try {
      const master = await Master.findById(masterId);
      
      if (!master) {
        return {
          success: false,
          message: 'Мастер не найден'
        };
      }
      
      await Master.findByIdAndDelete(masterId);
      
      return {
        success: true,
        message: 'Мастер успешно удален',
        deletedImages: master.image // Возвращаем пути к изображениям для удаления файлов
      };
      
    } catch (error) {
      console.error('❌ Ошибка при удалении мастера:', error);
      throw new Error('Ошибка при удалении мастера');
    }
  }

  // Поиск мастеров
  async searchMasters(searchQuery, filters = {}) {
    try {
      const { limit = 20, page = 1 } = filters;
      
      const query = {
        $or: [
          { fullName: { $regex: searchQuery, $options: 'i' } },
          { speciality: { $regex: searchQuery, $options: 'i' } }
        ]
      };
      
      const skip = (page - 1) * limit;
      
      const masters = await Master.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
        
      const total = await Master.countDocuments(query);
      
      return {
        success: true,
        data: masters,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          query: searchQuery
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при поиске мастеров:', error);
      throw new Error('Ошибка при поиске мастеров');
    }
  }

  // Получение уникальных специальностей
  async getSpecialities() {
    try {
      const specialities = await Master.distinct('speciality');
      
      return {
        success: true,
        data: specialities.sort()
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении специальностей:', error);
      throw new Error('Ошибка при получении специальностей');
    }
  }

  // Получение статистики мастеров
  async getMastersStats() {
    try {
      const totalMasters = await Master.countDocuments();
      
      const mastersBySpeciality = await Master.aggregate([
        {
          $group: {
            _id: '$speciality',
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
          total: totalMasters,
          bySpeciality: mastersBySpeciality
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении статистики мастеров:', error);
      throw new Error('Ошибка при получении статистики мастеров');
    }
  }

}

export default new MasterService();