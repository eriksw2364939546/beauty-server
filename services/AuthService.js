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
      const inputEmail = email.toLowerCase().trim();

      // Получаем всех пользователей
      const users = await User.find({});

      // Ищем пользователя, расшифровывая email каждого
      let foundUser = null;

      for (const user of users) {
        try {
          const decryptedEmail = decryptString(user.email);

          if (decryptedEmail.toLowerCase() === inputEmail) {
            foundUser = user;
            break;
          }
        } catch (decryptError) {
          console.warn('⚠️ Не удалось расшифровать email пользователя:', user._id);
          continue;
        }
      }

      if (!foundUser) {
        return {
          success: false,
          message: 'Неверный email или пароль'
        };
      }

      // Проверка пароля
      const isPasswordValid = await comparePassword(password, foundUser.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Неверный email или пароль'
        };
      }

      // Генерация JWT токена
      const token = createToken({
        userId: foundUser._id.toString(),
        email: inputEmail,
        role: foundUser.role
      });

      return {
        success: true,
        token,
        user: {
          id: foundUser._id,
          email: inputEmail,
          role: foundUser.role,
          createdAt: foundUser.createdAt
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

  // Обновление профиля администратора (email и/или пароль)
  async updateProfile(userId, updateData) {
    try {
      const { currentPassword, email, password } = updateData;

      const user = await User.findById(userId);

      if (!user) {
        return {
          success: false,
          message: 'Пользователь не найден'
        };
      }

      // Проверяем текущий пароль (обязательно для любых изменений)
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Неверный текущий пароль'
        };
      }

      let emailChanged = false;
      let passwordChanged = false;

      // Обновляем email если передан
      if (email) {
        const newEmailLower = email.toLowerCase().trim();

        // Расшифровываем текущий email для сравнения
        const currentDecryptedEmail = decryptString(user.email);

        if (newEmailLower !== currentDecryptedEmail.toLowerCase()) {
          // Проверяем что email не занят (расшифровывая все записи)
          const allUsers = await User.find({ _id: { $ne: userId } });

          for (const otherUser of allUsers) {
            try {
              const otherEmail = decryptString(otherUser.email);
              if (otherEmail.toLowerCase() === newEmailLower) {
                return {
                  success: false,
                  message: 'Email уже используется'
                };
              }
            } catch (decryptError) {
              continue;
            }
          }

          // Шифруем и сохраняем новый email
          user.email = encryptString(newEmailLower);
          emailChanged = true;
        }
      }

      // Обновляем пароль если передан
      if (password) {
        user.password = await hashPassword(password);
        passwordChanged = true;
      }

      await user.save();

      // Расшифровываем email для ответа
      const decryptedEmail = decryptString(user.email);

      // Формируем сообщение об изменениях
      let message = 'Профиль успешно обновлён';
      if (emailChanged && passwordChanged) {
        message = 'Email и пароль успешно обновлены';
      } else if (emailChanged) {
        message = 'Email успешно обновлён';
      } else if (passwordChanged) {
        message = 'Пароль успешно обновлён';
      }

      return {
        success: true,
        user: {
          id: user._id,
          email: decryptedEmail,
          role: user.role,
          updatedAt: user.updatedAt
        },
        message
      };

    } catch (error) {
      console.error('❌ Ошибка при обновлении профиля:', error);
      throw new Error('Ошибка при обновлении профиля');
    }
  }

}

export default new AuthService();