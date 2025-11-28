import Master from '../models/Master.model.js';
import uploadPhotoMiddleware from '../middlewares/UploadPhoto.middleware.js';

class MasterService {

  // Получение всех мастеров
  async getAllMasters(filters = {}) {
    try {
      const { speciality, search, limit, page = 1 } = filters;

      const query = {};

      if (speciality) {
        query.speciality = { $regex: speciality, $options: 'i' };
      }

      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { speciality: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * (limit || 0);
      const options = { sort: { createdAt: -1 } };

      if (limit) {
        options.limit = parseInt(limit);
        options.skip = skip;
      }

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
        return { success: false, message: 'Мастер не найден' };
      }

      return { success: true, data: master };

    } catch (error) {
      console.error('❌ Ошибка при получении мастера:', error);
      throw new Error('Ошибка при получении мастера');
    }
  }

  // Получение избранных мастеров
  async getFeaturedMasters(limit = 4) {
    try {
      const masters = await Master.find()
        .sort({ createdAt: -1 })
        .limit(limit);

      return { success: true, data: masters };

    } catch (error) {
      console.error('❌ Ошибка при получении избранных мастеров:', error);
      throw new Error('Ошибка при получении избранных мастеров');
    }
  }

  // Получение мастеров по специальности
  async getMastersBySpeciality(speciality) {
    try {
      const masters = await Master.find({
        speciality: { $regex: speciality, $options: 'i' }
      }).sort({ createdAt: -1 });

      return { success: true, data: masters };

    } catch (error) {
      console.error('❌ Ошибка при получении мастеров по специальности:', error);
      throw new Error('Ошибка при получении мастеров по специальности');
    }
  }

  // Создание нового мастера
  async createMaster(masterData, imagePath) {
    try {
      const { fullName, speciality } = masterData;

      const master = new Master({
        fullName: fullName.trim(),
        speciality: speciality.trim(),
        image: imagePath  // "/uploads/masters/uuid.webp"
      });

      await master.save();

      return {
        success: true,
        data: master,
        message: 'Мастер успешно создан'
      };

    } catch (error) {
      console.error('❌ Ошибка при создании мастера:', error);
      throw new Error('Ошибка при создании мастера');
    }
  }

  // Обновление мастера
  async updateMaster(masterId, updateData, newImagePath) {
    try {
      const { fullName, speciality } = updateData;

      const master = await Master.findById(masterId);

      if (!master) {
        return { success: false, message: 'Мастер не найден' };
      }

      const updateFields = {};

      if (fullName && fullName.trim() !== master.fullName) {
        updateFields.fullName = fullName.trim();
      }

      if (speciality && speciality.trim() !== master.speciality) {
        updateFields.speciality = speciality.trim();
      }

      // Если загружено новое изображение — удаляем старое
      if (newImagePath) {
        await uploadPhotoMiddleware.deleteImage(master.image);
        updateFields.image = newImagePath;
      }

      if (Object.keys(updateFields).length === 0) {
        return { success: true, data: master, message: 'Нет изменений для обновления' };
      }

      const updatedMaster = await Master.findByIdAndUpdate(
        masterId,
        updateFields,
        { new: true, runValidators: true }
      );

      return {
        success: true,
        data: updatedMaster,
        message: 'Мастер успешно обновлён'
      };

    } catch (error) {
      console.error('❌ Ошибка при обновлении мастера:', error);
      throw new Error('Ошибка при обновлении мастера');
    }
  }

  // Удаление мастера
  async deleteMaster(masterId) {
    try {
      const master = await Master.findById(masterId);

      if (!master) {
        return { success: false, message: 'Мастер не найден' };
      }

      // Удаляем файл изображения
      await uploadPhotoMiddleware.deleteImage(master.image);

      await Master.findByIdAndDelete(masterId);

      return { success: true, message: 'Мастер успешно удалён' };

    } catch (error) {
      console.error('❌ Ошибка при удалении мастера:', error);
      throw new Error('Ошибка при удалении мастера');
    }
  }
}

export default new MasterService();