/**
 * Unit тесты для ServiceService
 */

import { jest } from '@jest/globals';

// Создаём моки
const mockService = {
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn()
};

const mockGenerateSlug = jest.fn();
const mockSave = jest.fn();

// Мокаем модули
jest.unstable_mockModule('../../../models/Service.model.js', () => {
  const MockService = function(data) {
    return { ...data, save: mockSave };
  };
  MockService.find = mockService.find;
  MockService.findOne = mockService.findOne;
  MockService.findById = mockService.findById;
  MockService.findByIdAndUpdate = mockService.findByIdAndUpdate;
  MockService.findByIdAndDelete = mockService.findByIdAndDelete;
  MockService.countDocuments = mockService.countDocuments;
  return { default: MockService };
});

jest.unstable_mockModule('../../../utils/slug.js', () => ({
  generateSlug: mockGenerateSlug
}));

// Импортируем ПОСЛЕ мокирования
const { default: ServiceService } = await import('../../../services/ServiceService.js');

describe('ServiceService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset();
  });

  // =========================================================================
  // getAllServices
  // =========================================================================
  describe('getAllServices', () => {
    
    it('должен вернуть все услуги без фильтров', async () => {
      // Arrange
      const mockServices = [
        { _id: '1', title: 'Стрижка женская', slug: 'strizhka-zhenskaya', categorySlug: 'strizhki' },
        { _id: '2', title: 'Стрижка мужская', slug: 'strizhka-muzhskaya', categorySlug: 'strizhki' }
      ];

      mockService.find.mockResolvedValue(mockServices);
      mockService.countDocuments.mockResolvedValue(2);

      // Act
      const result = await ServiceService.getAllServices({});

      // Assert
      expect(mockService.find).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('должен фильтровать услуги по категории', async () => {
      // Arrange
      const mockServices = [
        { _id: '1', title: 'Маникюр классический', slug: 'manikur-klassicheskiy', categorySlug: 'manikur' }
      ];

      mockService.find.mockResolvedValue(mockServices);
      mockService.countDocuments.mockResolvedValue(1);

      // Act
      const result = await ServiceService.getAllServices({ category: 'MANIKUR' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('должен искать услуги по поисковому запросу', async () => {
      // Arrange
      const mockServices = [
        { _id: '1', title: 'Окрашивание волос', slug: 'okrashivanie-volos', description: 'Профессиональное окрашивание' }
      ];

      mockService.find.mockResolvedValue(mockServices);
      mockService.countDocuments.mockResolvedValue(1);

      // Act
      const result = await ServiceService.getAllServices({ search: 'окрашивание' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('должен применять пагинацию', async () => {
      // Arrange
      const mockServices = [
        { _id: '3', title: 'Услуга 3', slug: 'usluga-3' }
      ];

      mockService.find.mockResolvedValue(mockServices);
      mockService.countDocuments.mockResolvedValue(15);

      // Act
      const result = await ServiceService.getAllServices({ page: 2, limit: 5 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(15);
      expect(result.meta.pages).toBe(3);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockService.find.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ServiceService.getAllServices({}))
        .rejects
        .toThrow('Ошибка при получении услуг');
    });
  });

  // =========================================================================
  // getServiceBySlug
  // =========================================================================
  describe('getServiceBySlug', () => {
    
    it('должен вернуть услугу по slug', async () => {
      // Arrange
      const mockServiceData = {
        _id: '1',
        title: 'Стрижка женская',
        slug: 'strizhka-zhenskaya',
        description: 'Профессиональная стрижка',
        categorySlug: 'strizhki',
        image: {
          large: '/uploads/services/large.webp',
          medium: '/uploads/services/medium.webp',
          thumb: '/uploads/services/thumb.webp'
        }
      };

      mockService.findOne.mockResolvedValue(mockServiceData);

      // Act
      const result = await ServiceService.getServiceBySlug('strizhka-zhenskaya');

      // Assert
      expect(mockService.findOne).toHaveBeenCalledWith({ slug: 'strizhka-zhenskaya' });
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Стрижка женская');
    });

    it('должен вернуть ошибку, если услуга не найдена', async () => {
      // Arrange
      mockService.findOne.mockResolvedValue(null);

      // Act
      const result = await ServiceService.getServiceBySlug('unknown-slug');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Услуга не найдена');
    });

    it('должен приводить slug к нижнему регистру', async () => {
      // Arrange
      mockService.findOne.mockResolvedValue(null);

      // Act
      await ServiceService.getServiceBySlug('STRIZHKA-ZHENSKAYA');

      // Assert
      expect(mockService.findOne).toHaveBeenCalledWith({ slug: 'strizhka-zhenskaya' });
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockService.findOne.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ServiceService.getServiceBySlug('strizhka'))
        .rejects
        .toThrow('Ошибка при получении услуги');
    });
  });

  // =========================================================================
  // getServiceById
  // =========================================================================
  describe('getServiceById', () => {
    
    it('должен вернуть услугу по ID', async () => {
      // Arrange
      const mockServiceData = {
        _id: 'service_id_123',
        title: 'Стрижка',
        slug: 'strizhka',
        categorySlug: 'strizhki'
      };

      mockService.findById.mockResolvedValue(mockServiceData);

      // Act
      const result = await ServiceService.getServiceById('service_id_123');

      // Assert
      expect(mockService.findById).toHaveBeenCalledWith('service_id_123');
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Стрижка');
    });

    it('должен вернуть ошибку, если услуга не найдена', async () => {
      // Arrange
      mockService.findById.mockResolvedValue(null);

      // Act
      const result = await ServiceService.getServiceById('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Услуга не найдена');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockService.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ServiceService.getServiceById('service_id'))
        .rejects
        .toThrow('Ошибка при получении услуги');
    });
  });

  // =========================================================================
  // getServicesByCategory
  // =========================================================================
  describe('getServicesByCategory', () => {
    
    it('должен вернуть услуги по категории', async () => {
      // Arrange
      const mockServices = [
        { _id: '1', title: 'Стрижка 1', categorySlug: 'strizhki' },
        { _id: '2', title: 'Стрижка 2', categorySlug: 'strizhki' }
      ];

      mockService.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockServices)
      });

      // Act
      const result = await ServiceService.getServicesByCategory('strizhki');

      // Assert
      expect(mockService.find).toHaveBeenCalledWith({ categorySlug: 'strizhki' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('должен приводить categorySlug к нижнему регистру', async () => {
      // Arrange
      mockService.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      await ServiceService.getServicesByCategory('STRIZHKI');

      // Assert
      expect(mockService.find).toHaveBeenCalledWith({ categorySlug: 'strizhki' });
    });

    it('должен вернуть пустой массив, если услуг нет', async () => {
      // Arrange
      mockService.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await ServiceService.getServicesByCategory('empty-category');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockService.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(ServiceService.getServicesByCategory('strizhki'))
        .rejects
        .toThrow('Ошибка при получении услуг по категории');
    });
  });

  // =========================================================================
  // createService
  // =========================================================================
  describe('createService', () => {
    
    it('должен создать услугу с уникальным slug', async () => {
      // Arrange
      const serviceData = {
        title: 'Новая услуга',
        description: 'Описание услуги',
        categorySlug: 'strizhki',
        image: {
          large: '/uploads/large.webp',
          medium: '/uploads/medium.webp',
          thumb: '/uploads/thumb.webp'
        }
      };

      mockGenerateSlug.mockResolvedValue('novaya-usluga');
      mockSave.mockResolvedValue(true);

      // Act
      const result = await ServiceService.createService(serviceData);

      // Assert
      expect(mockGenerateSlug).toHaveBeenCalledWith('Новая услуга', 'Service');
      expect(mockSave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Услуга успешно создана');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      const serviceData = {
        title: 'Услуга',
        description: 'Описание',
        categorySlug: 'strizhki',
        image: { large: '', medium: '', thumb: '' }
      };

      mockGenerateSlug.mockResolvedValue('usluga');
      mockSave.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ServiceService.createService(serviceData))
        .rejects
        .toThrow('Ошибка при создании услуги');
    });
  });

  // =========================================================================
  // updateService
  // =========================================================================
  describe('updateService', () => {
    
    it('должен обновить услугу', async () => {
      // Arrange
      const mockServiceData = {
        _id: 'service_id',
        title: 'Старое название',
        slug: 'staroe-nazvanie',
        description: 'Старое описание',
        categorySlug: 'strizhki'
      };

      const mockUpdatedService = {
        ...mockServiceData,
        title: 'Новое название',
        slug: 'novoe-nazvanie'
      };

      mockService.findById.mockResolvedValue(mockServiceData);
      mockGenerateSlug.mockResolvedValue('novoe-nazvanie');
      mockService.findByIdAndUpdate.mockResolvedValue(mockUpdatedService);

      // Act
      const result = await ServiceService.updateService('service_id', {
        title: 'Новое название'
      });

      // Assert
      expect(mockService.findById).toHaveBeenCalledWith('service_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Услуга успешно обновлена');
    });

    it('должен вернуть ошибку, если услуга не найдена', async () => {
      // Arrange
      mockService.findById.mockResolvedValue(null);

      // Act
      const result = await ServiceService.updateService('unknown_id', {
        title: 'Новое название'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Услуга не найдена');
    });

    it('должен обновить изображение, если передано', async () => {
      // Arrange
      const mockServiceData = {
        _id: 'service_id',
        title: 'Услуга',
        slug: 'usluga',
        image: {
          large: '/old/large.webp',
          medium: '/old/medium.webp',
          thumb: '/old/thumb.webp'
        }
      };

      const newImage = {
        large: '/new/large.webp',
        medium: '/new/medium.webp',
        thumb: '/new/thumb.webp'
      };

      mockService.findById.mockResolvedValue(mockServiceData);
      mockService.findByIdAndUpdate.mockResolvedValue({
        ...mockServiceData,
        image: newImage
      });

      // Act
      const result = await ServiceService.updateService('service_id', {
        image: newImage
      });

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockService.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ServiceService.updateService('service_id', {}))
        .rejects
        .toThrow('Ошибка при обновлении услуги');
    });
  });

  // =========================================================================
  // deleteService
  // =========================================================================
  describe('deleteService', () => {
    
    it('должен удалить услугу и вернуть пути к изображениям', async () => {
      // Arrange
      const mockServiceData = {
        _id: 'service_id',
        title: 'Услуга для удаления',
        slug: 'usluga-dlya-udaleniya',
        image: {
          large: '/uploads/large.webp',
          medium: '/uploads/medium.webp',
          thumb: '/uploads/thumb.webp'
        }
      };

      mockService.findById.mockResolvedValue(mockServiceData);
      mockService.findByIdAndDelete.mockResolvedValue(mockServiceData);

      // Act
      const result = await ServiceService.deleteService('service_id');

      // Assert
      expect(mockService.findById).toHaveBeenCalledWith('service_id');
      expect(mockService.findByIdAndDelete).toHaveBeenCalledWith('service_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Услуга успешно удалена');
      expect(result.deletedImages).toEqual(mockServiceData.image);
    });

    it('должен вернуть ошибку, если услуга не найдена', async () => {
      // Arrange
      mockService.findById.mockResolvedValue(null);

      // Act
      const result = await ServiceService.deleteService('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Услуга не найдена');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockService.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ServiceService.deleteService('service_id'))
        .rejects
        .toThrow('Ошибка при удалении услуги');
    });
  });

  // =========================================================================
  // searchServices
  // =========================================================================
  describe('searchServices', () => {
    
    it('должен найти услуги по поисковому запросу', async () => {
      // Arrange
      const mockServices = [
        { _id: '1', title: 'Окрашивание волос', description: 'Профессиональное окрашивание' },
        { _id: '2', title: 'Мелирование', description: 'Окрашивание прядей' }
      ];

      mockService.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockServices)
      });
      mockService.countDocuments.mockResolvedValue(2);

      // Act
      const result = await ServiceService.searchServices('окрашивание');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.query).toBe('окрашивание');
    });

    it('должен фильтровать по категории при поиске', async () => {
      // Arrange
      mockService.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([])
      });
      mockService.countDocuments.mockResolvedValue(0);

      // Act
      const result = await ServiceService.searchServices('стрижка', { category: 'strizhki' });

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен применять пагинацию при поиске', async () => {
      // Arrange
      mockService.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([])
      });
      mockService.countDocuments.mockResolvedValue(25);

      // Act
      const result = await ServiceService.searchServices('услуга', { page: 2, limit: 10 });

      // Assert
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.pages).toBe(3);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockService.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(ServiceService.searchServices('услуга'))
        .rejects
        .toThrow('Ошибка при поиске услуг');
    });
  });
});