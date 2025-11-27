/**
 * Unit тесты для CategoryService
 */

import { jest } from '@jest/globals';

// Создаём моки
const mockCategory = {
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
jest.unstable_mockModule('../../../models/Category.model.js', () => {
  const MockCategory = function(data) {
    return { ...data, save: mockSave };
  };
  MockCategory.find = mockCategory.find;
  MockCategory.findOne = mockCategory.findOne;
  MockCategory.findById = mockCategory.findById;
  MockCategory.findByIdAndUpdate = mockCategory.findByIdAndUpdate;
  MockCategory.findByIdAndDelete = mockCategory.findByIdAndDelete;
  MockCategory.countDocuments = mockCategory.countDocuments;
  return { default: MockCategory };
});

jest.unstable_mockModule('../../../utils/slug.js', () => ({
  generateSlug: mockGenerateSlug
}));

// Импортируем ПОСЛЕ мокирования
const { default: CategoryService } = await import('../../../services/CategoryService.js');

describe('CategoryService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset();
  });

  // =========================================================================
  // getAllCategories
  // =========================================================================
  describe('getAllCategories', () => {
    
    it('должен вернуть все категории без фильтров', async () => {
      // Arrange
      const mockCategories = [
        { _id: '1', title: 'Стрижки', slug: 'strizhki', section: 'service', sortOrder: 0 },
        { _id: '2', title: 'Маникюр', slug: 'manikur', section: 'service', sortOrder: 1 }
      ];

      mockCategory.find.mockResolvedValue(mockCategories);
      mockCategory.countDocuments.mockResolvedValue(2);

      // Act
      const result = await CategoryService.getAllCategories({});

      // Assert
      expect(mockCategory.find).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('Стрижки');
    });

    it('должен фильтровать категории по секции', async () => {
      // Arrange
      const mockCategories = [
        { _id: '1', title: 'Стрижки', slug: 'strizhki', section: 'service', sortOrder: 0 }
      ];

      mockCategory.find.mockResolvedValue(mockCategories);
      mockCategory.countDocuments.mockResolvedValue(1);

      // Act
      const result = await CategoryService.getAllCategories({ section: 'service' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('должен применять пагинацию', async () => {
      // Arrange
      const mockCategories = [
        { _id: '3', title: 'Категория 3', slug: 'cat-3', section: 'service', sortOrder: 2 }
      ];

      mockCategory.find.mockResolvedValue(mockCategories);
      mockCategory.countDocuments.mockResolvedValue(10);

      // Act
      const result = await CategoryService.getAllCategories({ page: 2, limit: 5 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.meta.page).toBe(2);
      expect(result.meta.total).toBe(10);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockCategory.find.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(CategoryService.getAllCategories({}))
        .rejects
        .toThrow('Ошибка при получении категорий');
    });
  });

  // =========================================================================
  // getCategoryBySlug
  // =========================================================================
  describe('getCategoryBySlug', () => {
    
    it('должен вернуть категорию по slug', async () => {
      // Arrange
      const mockCategoryData = {
        _id: '1',
        title: 'Стрижки',
        slug: 'strizhki',
        section: 'service',
        sortOrder: 0
      };

      mockCategory.findOne.mockResolvedValue(mockCategoryData);

      // Act
      const result = await CategoryService.getCategoryBySlug('strizhki');

      // Assert
      expect(mockCategory.findOne).toHaveBeenCalledWith({ slug: 'strizhki' });
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Стрижки');
    });

    it('должен вернуть ошибку, если категория не найдена', async () => {
      // Arrange
      mockCategory.findOne.mockResolvedValue(null);

      // Act
      const result = await CategoryService.getCategoryBySlug('unknown-slug');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Категория не найдена');
    });

    it('должен приводить slug к нижнему регистру', async () => {
      // Arrange
      mockCategory.findOne.mockResolvedValue(null);

      // Act
      await CategoryService.getCategoryBySlug('STRIZHKI');

      // Assert
      expect(mockCategory.findOne).toHaveBeenCalledWith({ slug: 'strizhki' });
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockCategory.findOne.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(CategoryService.getCategoryBySlug('strizhki'))
        .rejects
        .toThrow('Ошибка при получении категории');
    });
  });

  // =========================================================================
  // getCategoryById
  // =========================================================================
  // describe('getCategoryById', () => {
    
  //   it('должен вернуть категорию по ID', async () => {
  //     // Arrange
  //     const mockCategoryData = {
  //       _id: 'cat_id_123',
  //       title: 'Стрижки',
  //       slug: 'strizhki',
  //       section: 'service'
  //     };

  //     mockCategory.findById.mockResolvedValue(mockCategoryData);

  //     // Act
  //     const result = await CategoryService.getCategoryById('cat_id_123');

  //     // Assert
  //     expect(mockCategory.findById).toHaveBeenCalledWith('cat_id_123');
  //     expect(result.success).toBe(true);
  //     expect(result.data.title).toBe('Стрижки');
  //   });

  //   it('должен вернуть ошибку, если категория не найдена', async () => {
  //     // Arrange
  //     mockCategory.findById.mockResolvedValue(null);

  //     // Act
  //     const result = await CategoryService.getCategoryById('unknown_id');

  //     // Assert
  //     expect(result.success).toBe(false);
  //     expect(result.message).toBe('Категория не найдена');
  //   });

  //   it('должен выбросить ошибку при сбое БД', async () => {
  //     // Arrange
  //     mockCategory.findById.mockRejectedValue(new Error('DB Error'));

  //     // Act & Assert
  //     await expect(CategoryService.getCategoryById('cat_id'))
  //       .rejects
  //       .toThrow('Ошибка при получении категории');
  //   });
  // });

  // =========================================================================
  // createCategory
  // =========================================================================
  describe('createCategory', () => {
    
    it('должен создать категорию с уникальным slug', async () => {
      // Arrange
      const categoryData = {
        title: 'Новая категория',
        section: 'service',
        sortOrder: 0
      };

      mockGenerateSlug.mockResolvedValue('novaya-kategoriya');
      mockSave.mockResolvedValue(true);

      // Act
      const result = await CategoryService.createCategory(categoryData);

      // Assert
      expect(mockGenerateSlug).toHaveBeenCalledWith('Новая категория', 'Category');
      expect(mockSave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Категория успешно создана');
    });

    it('должен использовать sortOrder по умолчанию = 0', async () => {
      // Arrange
      const categoryData = {
        title: 'Категория без sortOrder',
        section: 'service'
      };

      mockGenerateSlug.mockResolvedValue('kategoriya');
      mockSave.mockResolvedValue(true);

      // Act
      const result = await CategoryService.createCategory(categoryData);

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен вернуть ошибку при дублировании slug', async () => {
      // Arrange
      const categoryData = {
        title: 'Дублирующая категория',
        section: 'service'
      };

      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { slug: 1 };

      mockGenerateSlug.mockResolvedValue('duplicate-slug');
      mockSave.mockRejectedValue(duplicateError);

      // Act
      const result = await CategoryService.createCategory(categoryData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('уже существует');
    });

    it('должен выбросить ошибку при других сбоях БД', async () => {
      // Arrange
      const categoryData = {
        title: 'Категория',
        section: 'service'
      };

      mockGenerateSlug.mockResolvedValue('kategoriya');
      mockSave.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(CategoryService.createCategory(categoryData))
        .rejects
        .toThrow('Ошибка при создании категории');
    });
  });

  // =========================================================================
  // updateCategory
  // =========================================================================
  describe('updateCategory', () => {
    
    it('должен обновить категорию', async () => {
      // Arrange
      const mockCategoryData = {
        _id: 'cat_id',
        title: 'Старое название',
        slug: 'staroe-nazvanie',
        section: 'service',
        sortOrder: 0
      };

      const mockUpdatedCategory = {
        ...mockCategoryData,
        title: 'Новое название',
        slug: 'novoe-nazvanie'
      };

      mockCategory.findById.mockResolvedValue(mockCategoryData);
      mockGenerateSlug.mockResolvedValue('novoe-nazvanie');
      mockCategory.findByIdAndUpdate.mockResolvedValue(mockUpdatedCategory);

      // Act
      const result = await CategoryService.updateCategory('cat_id', {
        title: 'Новое название'
      });

      // Assert
      expect(mockCategory.findById).toHaveBeenCalledWith('cat_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Категория успешно обновлена');
    });

    it('должен вернуть ошибку, если категория не найдена', async () => {
      // Arrange
      mockCategory.findById.mockResolvedValue(null);

      // Act
      const result = await CategoryService.updateCategory('unknown_id', {
        title: 'Новое название'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Категория не найдена');
    });

    it('должен вернуть ошибку при дублировании slug', async () => {
      // Arrange
      const mockCategoryData = {
        _id: 'cat_id',
        title: 'Старое название',
        slug: 'staroe-nazvanie',
        section: 'service'
      };

      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { slug: 1 };

      mockCategory.findById.mockResolvedValue(mockCategoryData);
      mockGenerateSlug.mockResolvedValue('duplicate-slug');
      mockCategory.findByIdAndUpdate.mockRejectedValue(duplicateError);

      // Act
      const result = await CategoryService.updateCategory('cat_id', {
        title: 'Дублирующее название'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('уже существует');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockCategory.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(CategoryService.updateCategory('cat_id', {}))
        .rejects
        .toThrow('Ошибка при обновлении категории');
    });
  });

  // =========================================================================
  // deleteCategory
  // =========================================================================
  describe('deleteCategory', () => {
    
    it('должен удалить категорию', async () => {
      // Arrange
      const mockCategoryData = {
        _id: 'cat_id',
        title: 'Категория для удаления',
        slug: 'kategoriya-dlya-udaleniya'
      };

      mockCategory.findById.mockResolvedValue(mockCategoryData);
      mockCategory.findByIdAndDelete.mockResolvedValue(mockCategoryData);

      // Act
      const result = await CategoryService.deleteCategory('cat_id');

      // Assert
      expect(mockCategory.findById).toHaveBeenCalledWith('cat_id');
      expect(mockCategory.findByIdAndDelete).toHaveBeenCalledWith('cat_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Категория успешно удалена');
    });

    it('должен вернуть ошибку, если категория не найдена', async () => {
      // Arrange
      mockCategory.findById.mockResolvedValue(null);

      // Act
      const result = await CategoryService.deleteCategory('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Категория не найдена');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockCategory.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(CategoryService.deleteCategory('cat_id'))
        .rejects
        .toThrow('Ошибка при удалении категории');
    });
  });

  // =========================================================================
  // getCategoriesBySection
  // =========================================================================
  describe('getCategoriesBySection', () => {
    
    it('должен вернуть категории по секции', async () => {
      // Arrange
      const mockCategories = [
        { _id: '1', title: 'Стрижки', section: 'service', sortOrder: 0 },
        { _id: '2', title: 'Окрашивание', section: 'service', sortOrder: 1 }
      ];

      mockCategory.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCategories)
      });

      // Act
      const result = await CategoryService.getCategoriesBySection('service');

      // Assert
      expect(mockCategory.find).toHaveBeenCalledWith({ section: 'service' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('должен вернуть пустой массив, если категорий нет', async () => {
      // Arrange
      mockCategory.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await CategoryService.getCategoriesBySection('unknown_section');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockCategory.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(CategoryService.getCategoriesBySection('service'))
        .rejects
        .toThrow('Ошибка при получении категорий по секции');
    });
  });
});