/**
 * Unit тесты для MasterService
 */

import { jest } from '@jest/globals';

// Создаём моки
const mockMaster = {
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
jest.unstable_mockModule('../../../models/Master.model.js', () => {
  const MockMaster = function(data) {
    return { ...data, save: mockSave };
  };
  MockMaster.find = mockMaster.find;
  MockMaster.findOne = mockMaster.findOne;
  MockMaster.findById = mockMaster.findById;
  MockMaster.findByIdAndUpdate = mockMaster.findByIdAndUpdate;
  MockMaster.findByIdAndDelete = mockMaster.findByIdAndDelete;
  MockMaster.countDocuments = mockMaster.countDocuments;
  return { default: MockMaster };
});

jest.unstable_mockModule('../../../utils/slug.js', () => ({
  generateSlug: mockGenerateSlug
}));

// Импортируем ПОСЛЕ мокирования
const { default: MasterService } = await import('../../../services/MasterService.js');

describe('MasterService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset();
  });

  // =========================================================================
  // getAllMasters
  // =========================================================================
  describe('getAllMasters', () => {
    
    it('должен вернуть всех мастеров без фильтров', async () => {
      // Arrange
      const mockMasters = [
        { _id: '1', fullName: 'Анна Иванова', speciality: 'Парикмахер-стилист' },
        { _id: '2', fullName: 'Мария Петрова', speciality: 'Мастер маникюра' }
      ];

      mockMaster.find.mockResolvedValue(mockMasters);
      mockMaster.countDocuments.mockResolvedValue(2);

      // Act
      const result = await MasterService.getAllMasters({});

      // Assert
      expect(mockMaster.find).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('должен искать мастеров по имени или специальности', async () => {
      // Arrange
      const mockMasters = [
        { _id: '1', fullName: 'Анна Иванова', speciality: 'Парикмахер' }
      ];

      mockMaster.find.mockResolvedValue(mockMasters);
      mockMaster.countDocuments.mockResolvedValue(1);

      // Act
      const result = await MasterService.getAllMasters({ search: 'Анна' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('должен применять пагинацию', async () => {
      // Arrange
      const mockMasters = [
        { _id: '6', fullName: 'Мастер 6', speciality: 'Специальность' }
      ];

      mockMaster.find.mockResolvedValue(mockMasters);
      mockMaster.countDocuments.mockResolvedValue(15);

      // Act
      const result = await MasterService.getAllMasters({ page: 2, limit: 5 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(15);
      expect(result.meta.pages).toBe(3);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockMaster.find.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(MasterService.getAllMasters({}))
        .rejects
        .toThrow('Ошибка при получении мастеров');
    });
  });

  // =========================================================================
  // getMasterById
  // =========================================================================
  describe('getMasterById', () => {
    
    it('должен вернуть мастера по ID', async () => {
      // Arrange
      const mockMasterData = {
        _id: 'master_id_123',
        fullName: 'Анна Иванова',
        speciality: 'Парикмахер-стилист',
        image: {
          large: '/uploads/masters/large.webp',
          medium: '/uploads/masters/medium.webp',
          thumb: '/uploads/masters/thumb.webp'
        },
        createdAt: new Date()
      };

      mockMaster.findById.mockResolvedValue(mockMasterData);

      // Act
      const result = await MasterService.getMasterById('master_id_123');

      // Assert
      expect(mockMaster.findById).toHaveBeenCalledWith('master_id_123');
      expect(result.success).toBe(true);
      expect(result.data.fullName).toBe('Анна Иванова');
      expect(result.data.speciality).toBe('Парикмахер-стилист');
    });

    it('должен вернуть ошибку, если мастер не найден', async () => {
      // Arrange
      mockMaster.findById.mockResolvedValue(null);

      // Act
      const result = await MasterService.getMasterById('unknown_id');

      // Assert
      expect(mockMaster.findById).toHaveBeenCalledWith('unknown_id');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Мастер не найден');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockMaster.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(MasterService.getMasterById('master_id'))
        .rejects
        .toThrow('Ошибка при получении мастера');
    });
  });

  // =========================================================================
  // getMasterBySlug
  // =========================================================================
  describe('getMasterBySlug', () => {
    
    it('должен вернуть мастера по slug', async () => {
      // Arrange
      const mockMasterData = {
        _id: 'master_id',
        fullName: 'Анна Иванова',
        slug: 'anna-ivanova',
        speciality: 'Парикмахер'
      };

      mockMaster.findOne.mockResolvedValue(mockMasterData);

      // Act
      const result = await MasterService.getMasterBySlug('anna-ivanova');

      // Assert
      expect(mockMaster.findOne).toHaveBeenCalledWith({ slug: 'anna-ivanova' });
      expect(result.success).toBe(true);
      expect(result.data.fullName).toBe('Анна Иванова');
    });

    it('должен вернуть ошибку, если мастер не найден', async () => {
      // Arrange
      mockMaster.findOne.mockResolvedValue(null);

      // Act
      const result = await MasterService.getMasterBySlug('unknown-slug');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Мастер не найден');
    });

    it('должен приводить slug к нижнему регистру', async () => {
      // Arrange
      mockMaster.findOne.mockResolvedValue(null);

      // Act
      await MasterService.getMasterBySlug('ANNA-IVANOVA');

      // Assert
      expect(mockMaster.findOne).toHaveBeenCalledWith({ slug: 'anna-ivanova' });
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockMaster.findOne.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(MasterService.getMasterBySlug('anna'))
        .rejects
        .toThrow('Ошибка при получении мастера');
    });
  });

  // =========================================================================
  // getMastersBySpeciality
  // =========================================================================
  describe('getMastersBySpeciality', () => {
    
    it('должен вернуть мастеров по специальности', async () => {
      // Arrange
      const mockMasters = [
        { _id: '1', fullName: 'Анна Иванова', speciality: 'Парикмахер-стилист' },
        { _id: '2', fullName: 'Елена Смирнова', speciality: 'Парикмахер' }
      ];

      mockMaster.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMasters)
      });

      // Act
      const result = await MasterService.getMastersBySpeciality('Парикмахер');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('должен вернуть пустой массив, если мастеров нет', async () => {
      // Arrange
      mockMaster.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await MasterService.getMastersBySpeciality('Несуществующая специальность');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockMaster.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(MasterService.getMastersBySpeciality('Парикмахер'))
        .rejects
        .toThrow('Ошибка при получении мастеров по специальности');
    });
  });

  // =========================================================================
  // createMaster
  // =========================================================================
  describe('createMaster', () => {
    
    it('должен создать мастера с уникальным slug', async () => {
      // Arrange
      const masterData = {
        fullName: 'Новый Мастер',
        speciality: 'Визажист',
        image: {
          large: '/uploads/masters/large.webp',
          medium: '/uploads/masters/medium.webp',
          thumb: '/uploads/masters/thumb.webp'
        }
      };

      mockGenerateSlug.mockResolvedValue('novyy-master');
      mockSave.mockResolvedValue(true);

      // Act
      const result = await MasterService.createMaster(masterData);

      // Assert
      expect(mockGenerateSlug).toHaveBeenCalledWith('Новый Мастер', 'Master');
      expect(mockSave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Мастер успешно добавлен');
    });

    it('должен обрезать пробелы в fullName и speciality', async () => {
      // Arrange
      const masterData = {
        fullName: '  Имя с пробелами  ',
        speciality: '  Специальность  ',
        image: { large: '', medium: '', thumb: '' }
      };

      mockGenerateSlug.mockResolvedValue('imya-s-probelami');
      mockSave.mockResolvedValue(true);

      // Act
      const result = await MasterService.createMaster(masterData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      const masterData = {
        fullName: 'Мастер',
        speciality: 'Специальность',
        image: { large: '', medium: '', thumb: '' }
      };

      mockGenerateSlug.mockResolvedValue('master');
      mockSave.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(MasterService.createMaster(masterData))
        .rejects
        .toThrow('Ошибка при создании мастера');
    });
  });

  // =========================================================================
  // updateMaster
  // =========================================================================
  describe('updateMaster', () => {
    
    it('должен обновить данные мастера', async () => {
      // Arrange
      const mockMasterData = {
        _id: 'master_id',
        fullName: 'Старое Имя',
        slug: 'staroe-imya',
        speciality: 'Старая специальность'
      };

      const mockUpdatedMaster = {
        ...mockMasterData,
        fullName: 'Новое Имя',
        slug: 'novoe-imya',
        speciality: 'Новая специальность'
      };

      mockMaster.findById.mockResolvedValue(mockMasterData);
      mockGenerateSlug.mockResolvedValue('novoe-imya');
      mockMaster.findByIdAndUpdate.mockResolvedValue(mockUpdatedMaster);

      // Act
      const result = await MasterService.updateMaster('master_id', {
        fullName: 'Новое Имя',
        speciality: 'Новая специальность'
      });

      // Assert
      expect(mockMaster.findById).toHaveBeenCalledWith('master_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Информация о мастере успешно обновлена');
    });

    it('должен вернуть ошибку, если мастер не найден', async () => {
      // Arrange
      mockMaster.findById.mockResolvedValue(null);

      // Act
      const result = await MasterService.updateMaster('unknown_id', {
        fullName: 'Новое Имя'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Мастер не найден');
    });

    it('должен обновить изображение, если передано', async () => {
      // Arrange
      const mockMasterData = {
        _id: 'master_id',
        fullName: 'Мастер',
        slug: 'master',
        speciality: 'Специальность',
        image: { large: '/old.webp', medium: '/old.webp', thumb: '/old.webp' }
      };

      const newImage = {
        large: '/new/large.webp',
        medium: '/new/medium.webp',
        thumb: '/new/thumb.webp'
      };

      mockMaster.findById.mockResolvedValue(mockMasterData);
      mockMaster.findByIdAndUpdate.mockResolvedValue({
        ...mockMasterData,
        image: newImage
      });

      // Act
      const result = await MasterService.updateMaster('master_id', { image: newImage });

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockMaster.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(MasterService.updateMaster('master_id', {}))
        .rejects
        .toThrow('Ошибка при обновлении мастера');
    });
  });

  // =========================================================================
  // deleteMaster
  // =========================================================================
  describe('deleteMaster', () => {
    
    it('должен удалить мастера и вернуть пути к изображениям', async () => {
      // Arrange
      const mockMasterData = {
        _id: 'master_id',
        fullName: 'Мастер для удаления',
        slug: 'master-dlya-udaleniya',
        speciality: 'Специальность',
        image: {
          large: '/uploads/masters/large.webp',
          medium: '/uploads/masters/medium.webp',
          thumb: '/uploads/masters/thumb.webp'
        }
      };

      mockMaster.findById.mockResolvedValue(mockMasterData);
      mockMaster.findByIdAndDelete.mockResolvedValue(mockMasterData);

      // Act
      const result = await MasterService.deleteMaster('master_id');

      // Assert
      expect(mockMaster.findById).toHaveBeenCalledWith('master_id');
      expect(mockMaster.findByIdAndDelete).toHaveBeenCalledWith('master_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Мастер успешно удален');
      expect(result.deletedImages).toEqual(mockMasterData.image);
    });

    it('должен вернуть ошибку, если мастер не найден', async () => {
      // Arrange
      mockMaster.findById.mockResolvedValue(null);

      // Act
      const result = await MasterService.deleteMaster('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Мастер не найден');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockMaster.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(MasterService.deleteMaster('master_id'))
        .rejects
        .toThrow('Ошибка при удалении мастера');
    });
  });



  // =========================================================================
  // searchMasters
  // =========================================================================
  describe('searchMasters', () => {
    
    it('должен найти мастеров по поисковому запросу', async () => {
      // Arrange
      const mockMasters = [
        { _id: '1', fullName: 'Анна Парикмахер', speciality: 'Парикмахер' },
        { _id: '2', fullName: 'Мария', speciality: 'Парикмахер-стилист' }
      ];

      mockMaster.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockMasters)
      });
      mockMaster.countDocuments.mockResolvedValue(2);

      // Act
      const result = await MasterService.searchMasters('парикмахер');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.query).toBe('парикмахер');
    });

    it('должен применять пагинацию при поиске', async () => {
      // Arrange
      mockMaster.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([])
      });
      mockMaster.countDocuments.mockResolvedValue(25);

      // Act
      const result = await MasterService.searchMasters('мастер', { page: 2, limit: 10 });

      // Assert
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.pages).toBe(3);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockMaster.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(MasterService.searchMasters('мастер'))
        .rejects
        .toThrow('Ошибка при поиске мастеров');
    });
  });
});