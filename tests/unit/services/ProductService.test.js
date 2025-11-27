/**
 * Unit тесты для ProductService
 */

import { jest } from '@jest/globals';

// Создаём моки
const mockProduct = {
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
jest.unstable_mockModule('../../../models/Product.model.js', () => {
  const MockProduct = function(data) {
    return { ...data, save: mockSave };
  };
  MockProduct.find = mockProduct.find;
  MockProduct.findOne = mockProduct.findOne;
  MockProduct.findById = mockProduct.findById;
  MockProduct.findByIdAndUpdate = mockProduct.findByIdAndUpdate;
  MockProduct.findByIdAndDelete = mockProduct.findByIdAndDelete;
  MockProduct.countDocuments = mockProduct.countDocuments;
  return { default: MockProduct };
});

jest.unstable_mockModule('../../../utils/slug.js', () => ({
  generateSlug: mockGenerateSlug
}));

// Импортируем ПОСЛЕ мокирования
const { default: ProductService } = await import('../../../services/ProductService.js');

describe('ProductService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset();
  });

  // =========================================================================
  // getAllProducts
  // =========================================================================
  describe('getAllProducts', () => {
    
    it('должен вернуть все продукты без фильтров', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', title: 'Шампунь', slug: 'shampun', code: 'SH001', price: 500 },
        { _id: '2', title: 'Кондиционер', slug: 'konditsioner', code: 'KO001', price: 600 }
      ];

      mockProduct.find.mockResolvedValue(mockProducts);
      mockProduct.countDocuments.mockResolvedValue(2);

      // Act
      const result = await ProductService.getAllProducts({});

      // Assert
      expect(mockProduct.find).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('должен фильтровать продукты по категории', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', title: 'Шампунь', categorySlug: 'uhod-za-volosami', price: 500 }
      ];

      mockProduct.find.mockResolvedValue(mockProducts);
      mockProduct.countDocuments.mockResolvedValue(1);

      // Act
      const result = await ProductService.getAllProducts({ category: 'UHOD-ZA-VOLOSAMI' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('должен искать продукты по поисковому запросу', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', title: 'Шампунь для волос', description: 'Профессиональный шампунь' }
      ];

      mockProduct.find.mockResolvedValue(mockProducts);
      mockProduct.countDocuments.mockResolvedValue(1);

      // Act
      const result = await ProductService.getAllProducts({ search: 'шампунь' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('должен применять пагинацию', async () => {
      // Arrange
      const mockProducts = [
        { _id: '11', title: 'Продукт 11', price: 100 }
      ];

      mockProduct.find.mockResolvedValue(mockProducts);
      mockProduct.countDocuments.mockResolvedValue(50);

      // Act
      const result = await ProductService.getAllProducts({ page: 3, limit: 10 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.meta.page).toBe(3);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(50);
      expect(result.meta.pages).toBe(5);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.find.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ProductService.getAllProducts({}))
        .rejects
        .toThrow('Ошибка при получении продуктов');
    });
  });

  // =========================================================================
  // getProductBySlug
  // =========================================================================
  describe('getProductBySlug', () => {
    
    it('должен вернуть продукт по slug', async () => {
      // Arrange
      const mockProductData = {
        _id: '1',
        title: 'Шампунь профессиональный',
        slug: 'shampun-professionalnyy',
        description: 'Описание шампуня',
        price: 1500,
        code: 'SH001',
        categorySlug: 'uhod-za-volosami',
        image: {
          large: '/uploads/products/large.webp',
          medium: '/uploads/products/medium.webp',
          thumb: '/uploads/products/thumb.webp'
        }
      };

      mockProduct.findOne.mockResolvedValue(mockProductData);

      // Act
      const result = await ProductService.getProductBySlug('shampun-professionalnyy');

      // Assert
      expect(mockProduct.findOne).toHaveBeenCalledWith({ slug: 'shampun-professionalnyy' });
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Шампунь профессиональный');
      expect(result.data.price).toBe(1500);
    });

    it('должен вернуть ошибку, если продукт не найден', async () => {
      // Arrange
      mockProduct.findOne.mockResolvedValue(null);

      // Act
      const result = await ProductService.getProductBySlug('unknown-slug');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Продукт не найден');
    });

    it('должен приводить slug к нижнему регистру', async () => {
      // Arrange
      mockProduct.findOne.mockResolvedValue(null);

      // Act
      await ProductService.getProductBySlug('SHAMPUN-PROFESSIONALNYY');

      // Assert
      expect(mockProduct.findOne).toHaveBeenCalledWith({ slug: 'shampun-professionalnyy' });
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.findOne.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ProductService.getProductBySlug('shampun'))
        .rejects
        .toThrow('Ошибка при получении продукта');
    });
  });

  // =========================================================================
  // getProductById
  // =========================================================================
  describe('getProductById', () => {
    
    it('должен вернуть продукт по ID', async () => {
      // Arrange
      const mockProductData = {
        _id: 'product_id_123',
        title: 'Кондиционер',
        slug: 'konditsioner',
        price: 800,
        code: 'KO001'
      };

      mockProduct.findById.mockResolvedValue(mockProductData);

      // Act
      const result = await ProductService.getProductById('product_id_123');

      // Assert
      expect(mockProduct.findById).toHaveBeenCalledWith('product_id_123');
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Кондиционер');
    });

    it('должен вернуть ошибку, если продукт не найден', async () => {
      // Arrange
      mockProduct.findById.mockResolvedValue(null);

      // Act
      const result = await ProductService.getProductById('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Продукт не найден');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ProductService.getProductById('product_id'))
        .rejects
        .toThrow('Ошибка при получении продукта');
    });
  });

  // =========================================================================
  // getProductByCode
  // =========================================================================
  describe('getProductByCode', () => {
    
    it('должен вернуть продукт по артикулу', async () => {
      // Arrange
      const mockProductData = {
        _id: '1',
        title: 'Шампунь',
        slug: 'shampun',
        code: 'SH001',
        price: 500
      };

      mockProduct.findOne.mockResolvedValue(mockProductData);

      // Act
      const result = await ProductService.getProductByCode('SH001');

      // Assert
      expect(mockProduct.findOne).toHaveBeenCalledWith({ code: 'SH001' });
      expect(result.success).toBe(true);
      expect(result.data.code).toBe('SH001');
    });

    it('должен вернуть ошибку, если продукт не найден', async () => {
      // Arrange
      mockProduct.findOne.mockResolvedValue(null);

      // Act
      const result = await ProductService.getProductByCode('UNKNOWN');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Продукт не найден');
    });

    it('должен приводить код к верхнему регистру', async () => {
      // Arrange
      mockProduct.findOne.mockResolvedValue(null);

      // Act
      await ProductService.getProductByCode('sh001');

      // Assert
      expect(mockProduct.findOne).toHaveBeenCalledWith({ code: 'SH001' });
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.findOne.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ProductService.getProductByCode('SH001'))
        .rejects
        .toThrow('Ошибка при получении продукта');
    });
  });

  // =========================================================================
  // getProductsByCategory
  // =========================================================================
  describe('getProductsByCategory', () => {
    
    it('должен вернуть продукты по категории', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', title: 'Шампунь', categorySlug: 'uhod-za-volosami' },
        { _id: '2', title: 'Кондиционер', categorySlug: 'uhod-za-volosami' }
      ];

      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProducts)
      });

      // Act
      const result = await ProductService.getProductsByCategory('uhod-za-volosami');

      // Assert
      expect(mockProduct.find).toHaveBeenCalledWith({ categorySlug: 'uhod-za-volosami' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('должен приводить categorySlug к нижнему регистру', async () => {
      // Arrange
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      await ProductService.getProductsByCategory('UHOD-ZA-VOLOSAMI');

      // Assert
      expect(mockProduct.find).toHaveBeenCalledWith({ categorySlug: 'uhod-za-volosami' });
    });

    it('должен вернуть пустой массив, если продуктов нет', async () => {
      // Arrange
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      // Act
      const result = await ProductService.getProductsByCategory('empty-category');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(ProductService.getProductsByCategory('uhod'))
        .rejects
        .toThrow('Ошибка при получении продуктов по категории');
    });
  });

  // =========================================================================
  // createProduct
  // =========================================================================
  describe('createProduct', () => {
    
    it('должен создать продукт с уникальным slug', async () => {
      // Arrange
      const productData = {
        title: 'Новый шампунь',
        description: 'Описание нового шампуня',
        price: 1200,
        code: 'SH002',
        categorySlug: 'uhod-za-volosami',
        image: {
          large: '/uploads/products/large.webp',
          medium: '/uploads/products/medium.webp',
          thumb: '/uploads/products/thumb.webp'
        }
      };

      mockGenerateSlug.mockResolvedValue('novyy-shampun');
      mockSave.mockResolvedValue(true);

      // Act
      const result = await ProductService.createProduct(productData);

      // Assert
      expect(mockGenerateSlug).toHaveBeenCalledWith('Новый шампунь', 'Product');
      expect(mockSave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Продукт успешно создан');
    });

    it('должен вернуть ошибку при дублировании артикула', async () => {
      // Arrange
      const productData = {
        title: 'Продукт',
        description: 'Описание',
        price: 100,
        code: 'DUPLICATE',
        categorySlug: 'category',
        image: { large: '', medium: '', thumb: '' }
      };

      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { code: 1 };

      mockGenerateSlug.mockResolvedValue('produkt');
      mockSave.mockRejectedValue(duplicateError);

      // Act
      const result = await ProductService.createProduct(productData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('артикул');
    });

    it('должен вернуть ошибку при дублировании slug', async () => {
      // Arrange
      const productData = {
        title: 'Продукт',
        description: 'Описание',
        price: 100,
        code: 'PR001',
        categorySlug: 'category',
        image: { large: '', medium: '', thumb: '' }
      };

      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { slug: 1 };

      mockGenerateSlug.mockResolvedValue('duplicate-slug');
      mockSave.mockRejectedValue(duplicateError);

      // Act
      const result = await ProductService.createProduct(productData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('существует');
    });

    it('должен выбросить ошибку при других сбоях БД', async () => {
      // Arrange
      const productData = {
        title: 'Продукт',
        description: 'Описание',
        price: 100,
        code: 'PR001',
        categorySlug: 'category',
        image: { large: '', medium: '', thumb: '' }
      };

      mockGenerateSlug.mockResolvedValue('produkt');
      mockSave.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ProductService.createProduct(productData))
        .rejects
        .toThrow('Ошибка при создании продукта');
    });
  });

  // =========================================================================
  // updateProduct
  // =========================================================================
  describe('updateProduct', () => {
    
    it('должен обновить продукт', async () => {
      // Arrange
      const mockProductData = {
        _id: 'product_id',
        title: 'Старое название',
        slug: 'staroe-nazvanie',
        description: 'Старое описание',
        price: 500,
        code: 'PR001'
      };

      const mockUpdatedProduct = {
        ...mockProductData,
        title: 'Новое название',
        slug: 'novoe-nazvanie',
        price: 600
      };

      mockProduct.findById.mockResolvedValue(mockProductData);
      mockGenerateSlug.mockResolvedValue('novoe-nazvanie');
      mockProduct.findByIdAndUpdate.mockResolvedValue(mockUpdatedProduct);

      // Act
      const result = await ProductService.updateProduct('product_id', {
        title: 'Новое название',
        price: 600
      });

      // Assert
      expect(mockProduct.findById).toHaveBeenCalledWith('product_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Продукт успешно обновлен');
    });

    it('должен вернуть ошибку, если продукт не найден', async () => {
      // Arrange
      mockProduct.findById.mockResolvedValue(null);

      // Act
      const result = await ProductService.updateProduct('unknown_id', {
        title: 'Новое название'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Продукт не найден');
    });

    it('должен обновить изображение, если передано', async () => {
      // Arrange
      const mockProductData = {
        _id: 'product_id',
        title: 'Продукт',
        slug: 'produkt',
        price: 500,
        code: 'PR001',
        image: { large: '/old.webp', medium: '/old.webp', thumb: '/old.webp' }
      };

      const newImage = {
        large: '/new/large.webp',
        medium: '/new/medium.webp',
        thumb: '/new/thumb.webp'
      };

      mockProduct.findById.mockResolvedValue(mockProductData);
      mockProduct.findByIdAndUpdate.mockResolvedValue({
        ...mockProductData,
        image: newImage
      });

      // Act
      const result = await ProductService.updateProduct('product_id', { image: newImage });

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ProductService.updateProduct('product_id', {}))
        .rejects
        .toThrow('Ошибка при обновлении продукта');
    });
  });

  // =========================================================================
  // deleteProduct
  // =========================================================================
  describe('deleteProduct', () => {
    
    it('должен удалить продукт и вернуть пути к изображениям', async () => {
      // Arrange
      const mockProductData = {
        _id: 'product_id',
        title: 'Продукт для удаления',
        slug: 'produkt-dlya-udaleniya',
        code: 'PR001',
        price: 500,
        image: {
          large: '/uploads/products/large.webp',
          medium: '/uploads/products/medium.webp',
          thumb: '/uploads/products/thumb.webp'
        }
      };

      mockProduct.findById.mockResolvedValue(mockProductData);
      mockProduct.findByIdAndDelete.mockResolvedValue(mockProductData);

      // Act
      const result = await ProductService.deleteProduct('product_id');

      // Assert
      expect(mockProduct.findById).toHaveBeenCalledWith('product_id');
      expect(mockProduct.findByIdAndDelete).toHaveBeenCalledWith('product_id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Продукт успешно удален');
      expect(result.deletedImages).toEqual(mockProductData.image);
    });

    it('должен вернуть ошибку, если продукт не найден', async () => {
      // Arrange
      mockProduct.findById.mockResolvedValue(null);

      // Act
      const result = await ProductService.deleteProduct('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Продукт не найден');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.findById.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(ProductService.deleteProduct('product_id'))
        .rejects
        .toThrow('Ошибка при удалении продукта');
    });
  });

  // =========================================================================
  // searchProducts
  // =========================================================================
  describe('searchProducts', () => {
    
    it('должен найти продукты по поисковому запросу', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', title: 'Шампунь для волос', description: 'Профессиональный шампунь' },
        { _id: '2', title: 'Шампунь против перхоти', description: 'Лечебный шампунь' }
      ];

      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockProducts)
      });
      mockProduct.countDocuments.mockResolvedValue(2);

      // Act
      const result = await ProductService.searchProducts('шампунь');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.query).toBe('шампунь');
    });

    it('должен фильтровать по категории при поиске', async () => {
      // Arrange
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([])
      });
      mockProduct.countDocuments.mockResolvedValue(0);

      // Act
      const result = await ProductService.searchProducts('шампунь', { category: 'uhod-za-volosami' });

      // Assert
      expect(result.success).toBe(true);
    });

    it('должен применять пагинацию при поиске', async () => {
      // Arrange
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([])
      });
      mockProduct.countDocuments.mockResolvedValue(100);

      // Act
      const result = await ProductService.searchProducts('продукт', { page: 5, limit: 20 });

      // Assert
      expect(result.meta.page).toBe(5);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.pages).toBe(5);
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(ProductService.searchProducts('продукт'))
        .rejects
        .toThrow('Ошибка при поиске продуктов');
    });
  });

  // =========================================================================
  // getFeaturedProducts
  // =========================================================================
  describe('getFeaturedProducts', () => {
    
    it('должен вернуть рекомендуемые продукты', async () => {
      // Arrange
      const mockProducts = [
        { _id: '1', title: 'Продукт 1', price: 500 },
        { _id: '2', title: 'Продукт 2', price: 600 },
        { _id: '3', title: 'Продукт 3', price: 700 }
      ];

      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts)
      });

      // Act
      const result = await ProductService.getFeaturedProducts(3);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('должен использовать лимит по умолчанию', async () => {
      // Arrange
      const limitMock = jest.fn().mockResolvedValue([]);
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: limitMock
      });

      // Act
      await ProductService.getFeaturedProducts();

      // Assert
      expect(limitMock).toHaveBeenCalled();
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockProduct.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(ProductService.getFeaturedProducts())
        .rejects
        .toThrow('Ошибка при получении рекомендуемых продуктов');
    });
  });
});