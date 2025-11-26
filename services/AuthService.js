import User from '../models/User.model.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { createToken } from '../utils/jwt.js';

class AuthService {
  
  // Создание дефолтного администратора при первом запуске
  async createDefaultAdmin() {
    try {
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        const hashedPassword = await hashPassword('admin123');
        
        const defaultAdmin = new User({
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin'
        });
        
        await defaultAdmin.save();
        console.log('✅ Дефолтный администратор создан: admin@example.com / admin123');
        
        return {
          success: true,
          message: 'Дефолтный администратор создан'
        };
      }
      
      return {
        success: true,
        message: 'Администратор уже существует'
      };
      
    } catch (error) {
      console.error('❌ Ошибка при создании дефолтного админа:', error);
      throw new Error('Ошибка при создании администратора');
    }
  }
  
  // Авторизация администратора
  async login(email, password) {
    try {
      // Поиск пользователя по email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return {
          success: false,
          message: 'Неверный email или пароль'
        };
      }
      
      // Проверка пароля
      const isPasswordValid = await comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Неверный email или пароль'
        };
      }
      
      // Генерация JWT токена
      const token = createToken({
        id: user._id,
        email: user.email,
        role: user.role
      });
      
      return {
        success: true,
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при авторизации:', error);
      throw new Error('Ошибка авторизации');
    }
  }
  
  // Получение информации о пользователе по ID
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return {
          success: false,
          message: 'Пользователь не найден'
        };
      }
      
      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
      
    } catch (error) {
      console.error('❌ Ошибка при получении пользователя:', error);
      throw new Error('Ошибка при получении данных пользователя');
    }
  }
  
  // Обновление профиля администратора
  async updateProfile(userId, updateData) {
    try {
      const { email, password, currentPassword } = updateData;
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'Пользователь не найден'
        };
      }
      
      // Если обновляется пароль, проверяем текущий пароль
      if (password) {
        if (!currentPassword) {
          return {
            success: false,
            message: 'Необходимо указать текущий пароль'
          };
        }
        
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        
        if (!isCurrentPasswordValid) {
          return {
            success: false,
            message: 'Неверный текущий пароль'
          };
        }
        
        // Хешируем новый пароль
        user.password = await hashPassword(password);
      }
      
      // Обновляем email если передан
      if (email && email !== user.email) {
        // Проверяем что email не занят
        const existingUser = await User.findOne({ 
          email: email.toLowerCase(), 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return {
            success: false,
            message: 'Email уже используется'
          };
        }
        
        user.email = email.toLowerCase();
      }
      
      await user.save();
      
      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          updatedAt: user.updatedAt
        },
        message: 'Профиль успешно обновлен'
      };
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении профиля:', error);
      throw new Error('Ошибка при обновлении профиля');
    }
  }
  
}

export default new AuthService();