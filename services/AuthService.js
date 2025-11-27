import User from '../models/User.model.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { createToken } from '../utils/jwt.js';
import { encryptString, decryptString } from '../utils/crypto.js';

class AuthService {

  // Создание дефолтного администратора при первом запуске
  async createDefaultAdmin() {
    try {
      const userCount = await User.countDocuments();

      if (userCount === 0) {
        const plainEmail = 'admin@example.com';
        const plainPassword = 'admin123';

        // Шифруем email
        const encryptedEmail = encryptString(plainEmail);

        // Хешируем пароль
        const hashedPassword = await hashPassword(plainPassword);

        const defaultAdmin = new User({
          email: encryptedEmail,
          password: hashedPassword,
          role: 'admin'
        });

        await defaultAdmin.save();

        // Генерируем токен для Postman
        const token = createToken({
          id: defaultAdmin._id,
          email: plainEmail,
          role: defaultAdmin.role
        });

        // Красивый вывод в консоль для Postman
        console.log('\n');
        console.log('═'.repeat(60));
        console.log('✅ ДЕФОЛТНЫЙ АДМИНИСТРАТОР СОЗДАН');
        console.log('═'.repeat(60));
        console.log('📧 Email:    ', plainEmail);
        console.log('🔑 Password: ', plainPassword);
        console.log('─'.repeat(60));
        console.log('🎫 Token для Postman:');
        console.log('─'.repeat(60));
        console.log(token);
        console.log('─'.repeat(60));
        console.log('📋 Header для Postman:');
        console.log('   Authorization: Bearer ' + token.substring(0, 50) + '...');
        console.log('═'.repeat(60));
        console.log('\n');

        return {
          success: true,
          message: 'Дефолтный администратор создан',
          credentials: {
            email: plainEmail,
            password: plainPassword,
            token: token
          }
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
      // Шифруем введённый email для поиска в БД
      const encryptedEmail = encryptString(email.toLowerCase());

      // Поиск пользователя по зашифрованному email
      const user = await User.findOne({ email: encryptedEmail });

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

      // Генерация JWT токена (используем расшифрованный email)
      const token = createToken({
        userId: user._id.toString(),
        email: email.toLowerCase(),
        role: user.role
      });

      return {
        success: true,
        token,
        user: {
          id: user._id,
          email: email.toLowerCase(), // Возвращаем оригинальный email
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

      // Расшифровываем email для отображения
      const decryptedEmail = decryptString(user.email);

      return {
        success: true,
        user: {
          id: user._id,
          email: decryptedEmail,
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
      if (email) {
        const newEmailLower = email.toLowerCase();
        const encryptedNewEmail = encryptString(newEmailLower);

        // Расшифровываем текущий email для сравнения
        const currentDecryptedEmail = decryptString(user.email);

        if (newEmailLower !== currentDecryptedEmail) {
          // Проверяем что email не занят
          const existingUser = await User.findOne({
            email: encryptedNewEmail,
            _id: { $ne: userId }
          });

          if (existingUser) {
            return {
              success: false,
              message: 'Email уже используется'
            };
          }

          user.email = encryptedNewEmail;
        }
      }

      await user.save();

      // Расшифровываем email для ответа
      const decryptedEmail = decryptString(user.email);

      return {
        success: true,
        user: {
          id: user._id,
          email: decryptedEmail,
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