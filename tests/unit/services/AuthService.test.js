/**
 * Unit тесты для AuthService
 */

import { jest } from '@jest/globals';

// Создаём моки
const mockUser = {
  findOne: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn()
};

const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();
const mockCreateToken = jest.fn();
const mockSave = jest.fn();

// Мокаем модули
jest.unstable_mockModule('../../../models/User.model.js', () => ({
  default: function MockUser(data) {
    return { ...data, save: mockSave };
  }
}));

// Добавляем статические методы к конструктору
jest.unstable_mockModule('../../../models/User.model.js', () => {
  const MockUser = function(data) {
    return { ...data, save: mockSave };
  };
  MockUser.findOne = mockUser.findOne;
  MockUser.findById = mockUser.findById;
  MockUser.countDocuments = mockUser.countDocuments;
  return { default: MockUser };
});

jest.unstable_mockModule('../../../utils/hash.js', () => ({
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword
}));

jest.unstable_mockModule('../../../utils/jwt.js', () => ({
  createToken: mockCreateToken
}));

// Импортируем ПОСЛЕ мокирования
const { default: AuthService } = await import('../../../services/AuthService.js');

describe('AuthService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockReset();
  });

  // =========================================================================
  // createDefaultAdmin
  // =========================================================================
  describe('createDefaultAdmin', () => {
    
    it('должен создать дефолтного админа, если пользователей нет', async () => {
      // Arrange
      mockUser.countDocuments.mockResolvedValue(0);
      mockHashPassword.mockResolvedValue('hashed_password_123');
      mockSave.mockResolvedValue(true);

      // Act
      const result = await AuthService.createDefaultAdmin();

      // Assert
      expect(mockUser.countDocuments).toHaveBeenCalled();
      expect(mockHashPassword).toHaveBeenCalledWith('admin123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Дефолтный администратор создан');
    });

    it('должен вернуть сообщение, если админ уже существует', async () => {
      // Arrange
      mockUser.countDocuments.mockResolvedValue(1);

      // Act
      const result = await AuthService.createDefaultAdmin();

      // Assert
      expect(mockUser.countDocuments).toHaveBeenCalled();
      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Администратор уже существует');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockUser.countDocuments.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(AuthService.createDefaultAdmin())
        .rejects
        .toThrow('Ошибка при создании администратора');
    });
  });

  // =========================================================================
  // login
  // =========================================================================
  describe('login', () => {
    
    it('должен успешно авторизовать пользователя с правильными данными', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: 'admin',
        createdAt: new Date()
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockComparePassword.mockResolvedValue(true);
      mockCreateToken.mockReturnValue('jwt_token_123');

      // Act
      const result = await AuthService.login('admin@example.com', 'password123');

      // Assert
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'admin@example.com' });
      expect(mockComparePassword).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result.success).toBe(true);
      expect(result.token).toBe('jwt_token_123');
      expect(result.user.email).toBe('admin@example.com');
    });

    it('должен вернуть ошибку, если пользователь не найден', async () => {
      // Arrange
      mockUser.findOne.mockResolvedValue(null);

      // Act
      const result = await AuthService.login('unknown@example.com', 'password123');

      // Assert
      expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'unknown@example.com' });
      expect(mockComparePassword).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Неверный email или пароль');
    });

    it('должен вернуть ошибку, если пароль неверный', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: 'admin'
      };

      mockUser.findOne.mockResolvedValue(mockUserData);
      mockComparePassword.mockResolvedValue(false);

      // Act
      const result = await AuthService.login('admin@example.com', 'wrong_password');

      // Assert
      expect(mockComparePassword).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      expect(mockCreateToken).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Неверный email или пароль');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockUser.findOne.mockRejectedValue(new Error('DB Error'));

      // Act & Assert
      await expect(AuthService.login('admin@example.com', 'password123'))
        .rejects
        .toThrow('Ошибка авторизации');
    });
  });

  // =========================================================================
  // getUserById
  // =========================================================================
  describe('getUserById', () => {
    
    it('должен вернуть пользователя по ID', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserData)
      });

      // Act
      const result = await AuthService.getUserById('user_id_123');

      // Assert
      expect(mockUser.findById).toHaveBeenCalledWith('user_id_123');
      expect(result.success).toBe(true);
      expect(result.user.email).toBe('admin@example.com');
    });

    it('должен вернуть ошибку, если пользователь не найден', async () => {
      // Arrange
      mockUser.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Act
      const result = await AuthService.getUserById('unknown_id');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Пользователь не найден');
    });

    it('должен выбросить ошибку при сбое БД', async () => {
      // Arrange
      mockUser.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('DB Error'))
      });

      // Act & Assert
      await expect(AuthService.getUserById('user_id_123'))
        .rejects
        .toThrow('Ошибка при получении данных пользователя');
    });
  });

  // =========================================================================
  // updateProfile
  // =========================================================================
  describe('updateProfile', () => {
    
    it('должен обновить email пользователя', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'old@example.com',
        password: 'hashed_password',
        role: 'admin',
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      mockUser.findById.mockResolvedValue(mockUserData);
      mockUser.findOne.mockResolvedValue(null);

      // Act
      const result = await AuthService.updateProfile('user_id_123', {
        email: 'new@example.com'
      });

      // Assert
      expect(mockUser.findById).toHaveBeenCalledWith('user_id_123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Профиль успешно обновлен');
    });

    it('должен вернуть ошибку, если пользователь не найден', async () => {
      // Arrange
      mockUser.findById.mockResolvedValue(null);

      // Act
      const result = await AuthService.updateProfile('unknown_id', { email: 'new@example.com' });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Пользователь не найден');
    });

    it('должен вернуть ошибку, если email уже используется', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'old@example.com',
        password: 'hashed_password'
      };

      mockUser.findById.mockResolvedValue(mockUserData);
      mockUser.findOne.mockResolvedValue({ _id: 'other_user', email: 'taken@example.com' });

      // Act
      const result = await AuthService.updateProfile('user_id_123', {
        email: 'taken@example.com'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email уже используется');
    });

    it('должен обновить пароль при правильном текущем пароле', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'admin@example.com',
        password: 'old_hashed_password',
        role: 'admin',
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      mockUser.findById.mockResolvedValue(mockUserData);
      mockComparePassword.mockResolvedValue(true);
      mockHashPassword.mockResolvedValue('new_hashed_password');

      // Act
      const result = await AuthService.updateProfile('user_id_123', {
        password: 'new_password',
        currentPassword: 'old_password'
      });

      // Assert
      expect(mockComparePassword).toHaveBeenCalledWith('old_password', 'old_hashed_password');
      expect(mockHashPassword).toHaveBeenCalledWith('new_password');
      expect(result.success).toBe(true);
    });

    it('должен вернуть ошибку, если текущий пароль не указан', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'admin@example.com',
        password: 'hashed_password'
      };

      mockUser.findById.mockResolvedValue(mockUserData);

      // Act
      const result = await AuthService.updateProfile('user_id_123', {
        password: 'new_password'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Необходимо указать текущий пароль');
    });

    it('должен вернуть ошибку, если текущий пароль неверный', async () => {
      // Arrange
      const mockUserData = {
        _id: 'user_id_123',
        email: 'admin@example.com',
        password: 'hashed_password'
      };

      mockUser.findById.mockResolvedValue(mockUserData);
      mockComparePassword.mockResolvedValue(false);

      // Act
      const result = await AuthService.updateProfile('user_id_123', {
        password: 'new_password',
        currentPassword: 'wrong_password'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Неверный текущий пароль');
    });
  });
});