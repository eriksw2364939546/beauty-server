import Service from '../models/Service.model.js';
import { generateSlug } from '../utils/slug.js';

class ServiceService {

  // Получение всех услуг
  async getAllServices(filters = {}) {
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
          { description: { $regex: search, $options: 'i' } }
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
      const services = await Service.find(query, null, options);
      const total = await Service.countDocuments(query);
      
      return {
        success: true,
        data: services,
        meta: {
          page: parseInt(page),
          limit: limit ? parseInt(limit) : total,
          total,
          pages: limit ? Math.ceil(total / limit) : 1
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении услуг:', error);
      throw new Error('Ошибка при получении услуг');
    }
  }

  // Получение услуги по slug
  async getServiceBySlug(slug) {
    try {
      const service = await Service.findOne({ slug: slug.toLowerCase() });
      
      if (!service) {
        return {
          success: false,
          message: 'Услуга не найдена'
        };
      }
      
      return {
        success: true,
        data: service
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении услуги:', error);
      throw new Error('Ошибка при получении услуги');
    }
  }

  // Получение услуг по категории
  async getServicesByCategory(categorySlug) {
    try {
      const services = await Service.find({ 
        categorySlug: categorySlug.toLowerCase() 
      }).sort({ createdAt: -1 });
      
      return {
        success: true,
        data: services
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении услуг по категории:', error);
      throw new Error('Ошибка при получении услуг по категории');
    }
  }

  // Создание новой услуги
  async createService(serviceData) {
    try {
      const { title, description, categorySlug, image } = serviceData;
      
      // Генерируем уникальный slug
      const slug = await generateSlug(title, 'Service');
      
      // Создаем услугу
      const service = new Service({
        title: title.trim(),
        slug: slug.toLowerCase(),
        description: description.trim(),
        categorySlug: categorySlug.toLowerCase(),
        image: {
          large: image.large,
          medium: image.medium,
          thumb: image.thumb
        }
      });
      
      await service.save();
      
      return {
        success: true,
        data: service,
        message: 'Услуга успешно создана'
      };
      
    } catch (error) {
      // Обработка ошибки дублирования slug
      if (error.code === 11000 && error.keyPattern?.slug) {
        return {
          success: false,
          message: 'Услуга с таким названием уже существует'
        };
      }
      
      console.error('❌ Ошибка при создании услуги:', error);
      throw new Error('Ошибка при создании услуги');
    }
  }

  // Обновление услуги
  async updateService(serviceId, updateData) {
    try {
      const { title, description, categorySlug, image } = updateData;
      
      const service = await Service.findById(serviceId);
      
      if (!service) {
        return {
          success: false,
          message: 'Услуга не найдена'
        };
      }
      
      // Подготавливаем данные для обновления
      const updateFields = {};
      
      if (title && title.trim() !== service.title) {
        updateFields.title = title.trim();
        // Генерируем новый slug если изменился title
        updateFields.slug = (await generateSlug(title, 'Service')).toLowerCase();
      }
      
      if (description && description.trim() !== service.description) {
        updateFields.description = description.trim();
      }
      
      if (categorySlug && categorySlug.toLowerCase() !== service.categorySlug) {
        updateFields.categorySlug = categorySlug.toLowerCase();
      }
      
      if (image) {
        updateFields.image = {
          large: image.large || service.image.large,
          medium: image.medium || service.image.medium,
          thumb: image.thumb || service.image.thumb
        };
      }
      
      // Если нет изменений
      if (Object.keys(updateFields).length === 0) {
        return {
          success: true,
          data: service,
          message: 'Нет изменений для обновления'
        };
      }
      
      const updatedService = await Service.findByIdAndUpdate(
        serviceId,
        updateFields,
        { new: true, runValidators: true }
      );
      
      return {
        success: true,
        data: updatedService,
        message: 'Услуга успешно обновлена'
      };
      
    } catch (error) {
      // Обработка ошибки дублирования slug
      if (error.code === 11000 && error.keyPattern?.slug) {
        return {
          success: false,
          message: 'Услуга с таким названием уже существует'
        };
      }
      
      console.error('❌ Ошибка при обновлении услуги:', error);
      throw new Error('Ошибка при обновлении услуги');
    }
  }

  // Удаление услуги
  async deleteService(serviceId) {
    try {
      const service = await Service.findById(serviceId);
      
      if (!service) {
        return {
          success: false,
          message: 'Услуга не найдена'
        };
      }
      
      await Service.findByIdAndDelete(serviceId);
      
      return {
        success: true,
        message: 'Услуга успешно удалена',
        deletedImages: service.image // Возвращаем пути к изображениям для удаления файлов
      };
      
    } catch (error) {
      console.error('❌ Ошибка при удалении услуги:', error);
      throw new Error('Ошибка при удалении услуги');
    }
  }

  // Поиск услуг
  async searchServices(searchQuery, filters = {}) {
    try {
      const { category, limit = 20, page = 1 } = filters;
      
      const query = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ]
      };
      
      if (category) {
        query.categorySlug = category.toLowerCase();
      }
      
      const skip = (page - 1) * limit;
      
      const services = await Service.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
        
      const total = await Service.countDocuments(query);
      
      return {
        success: true,
        data: services,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          query: searchQuery
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при поиске услуг:', error);
      throw new Error('Ошибка при поиске услуг');
    }
  }

}

export default new ServiceService();