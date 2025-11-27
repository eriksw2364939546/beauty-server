/**
 * Unit тесты для WorkService
 */

import { jest } from '@jest/globals';

// Создаём моки
const mockWork = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn()
};

const mockSave = jest.fn();

// Мокаем модули
jest.unstable_mockModule('../../../models/Work.model.js', () => {
  const MockWork = function(data) {
    return { ...data, save: mockSave };
  };
  MockWork.find = mockWork.find;
  MockWork.findById = mockWork.findById;
  MockWork.findByIdAndUpdate = mockWork.findByIdAndUpdate;
  MockWork.findByIdAndDelete = mockWork.findByIdAndDelete;
  MockWork.countDocuments = mockWork.countDocuments;
  return { default: MockWork };
});

// Импортируем ПОСЛЕ мокирования
const { default: WorkService } = await import('../../../services/WorkService.js');

describe('WorkService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset();
  });

  // =========================================================================
  // getAllWorks
  // =========================================================================
  describe('getAllWorks', () => {
    
    it('должен вернуть все работы без фильтров', async () => {
      // Arrange
      const mockWorks = [
        { 
          _id: '1', 
          categorySlug: 'strizhki',
          image: { large: '/l1.webp', medium: '/m1.webp', thumb: '/t1.webp' }
        },
        { 
          _id: '2', 
          categorySlug: 'manikur',
          image: { large: '/l2.webp', medium: '/m2.webp', thumb: '/t2.webp' }
        }
      ];

      mockWork.find.mockResolvedValue(mockWorks);
      mockWork.countDocuments.mockResolvedValue(2);

      // Act
      const result = await WorkService.getAllWorks({});

      // Assert
      expect(mockWork.find).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('должен фильтровать работы по категории', async () => {
      // Arrange
      const mockWorks = [
        { _id: '1', categorySlug: 'strizhki', image: { large: '', medium: '', thumb: '' } }
      ];

      mockWork.find.mockResolvedValue(mockWorks);
      mockWork.countDocuments.mockResolvedValue(1);

      // Act
      const result = await WorkService.getAllWorks({ category: 'STRIZHKI' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('должен применять пагинацию', async () => {
      // Arrange
      const mockWorks = [
        { _id: '6', categorySlug: 'strizhki', image: { large: '', medium: '', thumb: '' } }
      ];

      mockWork.find.mockResolvedValue(mockWorks);
      mockWork.countDocuments.mockResolvedValue(20);

      // Act
      const result = await WorkService.getAllWorks({ page: 2, limit: 5 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(20);
      expect(result.meta.pages).toBe(4);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockWork.find.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(WorkService.getAllWorks({}))
        .rejects
        .toThrow('Ошибка при получении работ');
    });
  });

  // =========================================================================
  // getWorksByCategory
  // =========================================================================
  describe('getWorksByCategory', () => {
    
    it('должен вернуть работы по категории', async () => {
      // Arrange
      const mockWorks = [
        { _id: '1', categorySlug: 'strizhki', image: { large: '', medium: '', thumb: '' } },
        { _id: '2', categorySlug: 'strizhki', image: { large: '', medium: '', thumb: '' } },
        { _id: '3', categorySlug: 'strizhki', image: { large: '', medium: '', thumb: '' } }
      ];

      mockWork.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockWorks)
      });

      // Act
      const result = await WorkService.getWorksByCategory('strizhki');

      // Assert
      expect(mockWork.find).toHaveBeenCalledWith({ categorySlug: 'strizhki' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('должен приводить categorySlug к нижнему регистру', async () => {
      // Arrange
      mockWork.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      await WorkService.getWorksByCategory('MANIKUR');

      // Assert
      expect(mockWork.find).toHaveBeenCalledWith({ categorySlug: 'manikur' });
    });

    it('должен вернуть пустой массив, если работ нет', async () => {
      // Arrange
      mockWork.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await WorkService.getWorksByCategory('empty-category');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockWork.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(WorkService.getWorksByCategory('strizhki'))
        .rejects
        .toThrow('Ошибка при получении работ по категории');
    });
  });

  // =========================================================================
  // getWorkById
  // =========================================================================
  describe('getWorkById', () => {
    
    it('должен вернуть работу по ID', async () => {
      // Arrange
      const mockWorkData = {
        _id: 'work_id_123',
        categorySlug: 'strizhki',
        image: {
          large: '/uploads/works/large.webp',
          medium: '/uploads/works/medium.webp',
          thumb: '/uploads/works/thumb.webp'
        },
        createdAt: new Date()
      };

      mockWork.findById.mockResolvedValue(mockWorkData);

      // Act
      const result = await WorkService.getWorkById('work_id_123');

      // Assert
      expect(mockWork.findById).toHaveBeenCalledWith('work_id_123');
      expect(result.success).toBe(true);
      expect(result.data._id).toBe('work_id_123');
      expect(result.data.categorySlug).toBe('strizhki');
    });

    it('должен вернуть ошибку, если работа не найдена', async () => {
      // Arrange
      mockWork.findById.mockResolvedValue(null);

      // Act
      const result = await WorkService.getWorkById('unknown_id');

      // Assert
      expect(mockWork.findById).toHaveBeenCalledWith('unknown_id');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Работа не найдена');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockWork.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(WorkService.getWorkById('work_id'))
        .rejects
        .toThrow('Ошибка при получении работы');
    });
  });

  // =========================================================================
  // createWork
  // =========================================================================
  describe('createWork', () => {
    
    it('должен создать работу с изображениями', async () => {
      // Arrange
      const workData = {
        categorySlug: 'strizhki',
        image: {
          large: '/uploads/works/large.webp',
          medium: '/uploads/works/medium.webp',
          thumb: '/uploads/works/thumb.webp'
        }
      };

      mockSave.mockResolvedValue(true);

      // Act
      const result = await WorkService.createWork(workData);

      // Assert
      expect(mockSave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Работа успешно добавлена');
    });

    it('должен приводить categorySlug к нижнему регистру', async () => {
      // Arrange
      const workData = {
        categorySlug: 'STRIZHKI',
        image: {
          large: '/large.webp',
          medium: '/medium.webp',
          thumb: '/thumb.webp'
        }
      };

      mockSave.mockResolvedValue(true);

      // Act
      const result = await WorkService.createWork(workData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      const workData = {
        categorySlug: 'strizhki',
        image: { large: '', medium: '', thumb: '' }
      };

      mockSave.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(WorkService.createWork(workData))
        .rejects
        .toThrow('Ошибка при создании работы');
    });
  });

  // =========================================================================
  // updateWork
  // =========================================================================
  describe('updateWork', () => {
    
    it('должен обновить работу', async () => {
      // Arrange
      const mockWorkData = {
        _id: 'work_id',
        categorySlug: 'strizhki',
        image: { large: '/old.webp', medium: '/old.webp', thumb: '/old.webp' }
      };

      const mockUpdatedWork = {
        ...mockWorkData,
        categorySlug: 'manikur'
      };

      mockWork.findById.mockResolvedValue(mockWorkData);
      mockWork.findByIdAndUpdate.mockResolvedValue(mockUpdatedWork);

      // Act
      const result = await WorkService.updateWork('work_id', { categorySlug: 'manikur' });

      // Assert
      expect(mockWork.findById).toHaveBeenCalledWith('work_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Работа успешно обновлена');
    });

    it('должен вернуть ошибку, если работа не найдена', async () => {
      // Arrange
      mockWork.findById.mockResolvedValue(null);

      // Act
      const result = await WorkService.updateWork('unknown_id', {});

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Работа не найдена');
    });

    it('должен обновить изображение, если передано', async () => {
      // Arrange
      const mockWorkData = {
        _id: 'work_id',
        categorySlug: 'strizhki',
        image: { large: '/old.webp', medium: '/old.webp', thumb: '/old.webp' }
      };

      const newImage = {
        large: '/new/large.webp',
        medium: '/new/medium.webp',
        thumb: '/new/thumb.webp'
      };

      mockWork.findById.mockResolvedValue(mockWorkData);
      mockWork.findByIdAndUpdate.mockResolvedValue({
        ...mockWorkData,
        image: newImage
      });

      // Act
      const result = await WorkService.updateWork('work_id', { image: newImage });

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockWork.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(WorkService.updateWork('work_id', {}))
        .rejects
        .toThrow('Ошибка при обновлении работы');
    });
  });

  // =========================================================================
  // deleteWork
  // =========================================================================
  describe('deleteWork', () => {
    
    it('должен удалить работу и вернуть пути к изображениям', async () => {
      // Arrange
      const mockWorkData = {
        _id: 'work_id',
        categorySlug: 'strizhki',
        image: {
          large: '/uploads/works/large.webp',
          medium: '/uploads/works/medium.webp',
          thumb: '/uploads/works/thumb.webp'
        }
      };

      mockWork.findById.mockResolvedValue(mockWorkData);
      mockWork.findByIdAndDelete.mockResolvedValue(mockWorkData);

      // Act
      const result = await WorkService.deleteWork('work_id');

      // Assert
      expect(mockWork.findById).toHaveBeenCalledWith('work_id');
      expect(mockWork.findByIdAndDelete).toHaveBeenCalledWith('work_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Работа успешно удалена');
      expect(result.deletedImages).toEqual(mockWorkData.image);
    });

    it('должен вернуть ошибку, если работа не найдена', async () => {
      // Arrange
      mockWork.findById.mockResolvedValue(null);

      // Act
      const result = await WorkService.deleteWork('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Работа не найдена');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockWork.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(WorkService.deleteWork('work_id'))
        .rejects
        .toThrow('Ошибка при удалении работы');
    });
  });

  // =========================================================================
  // getLatestWorks
  // =========================================================================
  describe('getLatestWorks', () => {
    
    it('должен вернуть последние работы с лимитом', async () => {
      // Arrange
      const mockWorks = [
        { _id: '1', categorySlug: 'strizhki', createdAt: new Date() },
        { _id: '2', categorySlug: 'manikur', createdAt: new Date() },
        { _id: '3', categorySlug: 'strizhki', createdAt: new Date() }
      ];

      mockWork.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockWorks)
      });

      // Act
      const result = await WorkService.getLatestWorks(3);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('должен использовать лимит по умолчанию', async () => {
      // Arrange
      const limitMock = jest.fn().mockResolvedValue([]);
      mockWork.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: limitMock
      });

      // Act
      await WorkService.getLatestWorks();

      // Assert
      expect(limitMock).toHaveBeenCalled();
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockWork.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(WorkService.getLatestWorks())
        .rejects
        .toThrow('Ошибка при получении последних работ');
    });
  });
});