import AuthService from '../services/AuthService.js';
import { validateLogin, validateChangeEmail } from '../validations/auth.validation.js';

class AuthController {

  // Логин администратора
  async login(req, res) {
    try {
      // Валидация входных данных
      const { error, value } = validateLogin(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: error.details[0].message
        });
      }

      const { email, password } = value;

      // Авторизация через сервис
      const result = await AuthService.login(email, password);

      if (!result.success) {
        return res.status(401).json({
          ok: false,
          error: 'invalid_credentials',
          message: result.message
        });
      }

      // Устанавливаем httpOnly cookie с JWT токеном
      res.cookie('admin_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
      });

      return res.status(200).json({
        ok: true,
        data: {
          user: result.user,
          message: 'Успешная авторизация'
        }
      });

    } catch (error) {
      console.error('❌ Ошибка в AuthController.login:', error);
      return res.status(500).json({
        ok: false,
        error: 'internal_server_error',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }

  // Логаут администратора
  async logout(req, res) {
    try {
      // Удаляем cookie с токеном
      res.clearCookie('admin_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return res.status(200).json({
        ok: true,
        message: 'Успешный выход'
      });

    } catch (error) {
      console.error('❌ Ошибка в AuthController.logout:', error);
      return res.status(500).json({
        ok: false,
        error: 'internal_server_error',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }

  // Получение информации о текущем пользователе
  async me(req, res) {
    try {
      const userId = req.user.id;

      // Получение данных пользователя через сервис
      const result = await AuthService.getUserById(userId);

      if (!result.success) {
        return res.status(404).json({
          ok: false,
          error: 'user_not_found',
          message: result.message
        });
      }

      return res.status(200).json({
        ok: true,
        data: result.user
      });

    } catch (error) {
      console.error('❌ Ошибка в AuthController.me:', error);
      return res.status(500).json({
        ok: false,
        error: 'internal_server_error',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }

  // Обновление профиля администратора
  async updateProfile(req, res) {
    try {
      // Валидация входных данных
      const { error, value } = validateChangeEmail(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: error.details[0].message
        });
      }

      const userId = req.user.id;

      // Обновление профиля через сервис
      const result = await AuthService.updateProfile(userId, value);

      if (!result.success) {
        const statusCode = result.message.includes('не найден') ? 404 : 400;
        return res.status(statusCode).json({
          ok: false,
          error: result.message.includes('не найден') ? 'user_not_found' : 'update_error',
          message: result.message
        });
      }

      return res.status(200).json({
        ok: true,
        data: {
          user: result.user,
          message: result.message
        }
      });

    } catch (error) {
      console.error('❌ Ошибка в AuthController.updateProfile:', error);
      return res.status(500).json({
        ok: false,
        error: 'internal_server_error',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }

  // Проверка токена (middleware endpoint)
  async verifyToken(req, res) {
    try {
      // Если middleware auth прошел успешно, значит токен валидный
      return res.status(200).json({
        ok: true,
        data: {
          user: req.user,
          message: 'Токен действителен'
        }
      });

    } catch (error) {
      console.error('❌ Ошибка в AuthController.verifyToken:', error);
      return res.status(500).json({
        ok: false,
        error: 'internal_server_error',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }

  // Инициализация - создание дефолтного админа
  async initializeAdmin(req, res) {
    try {
      // Создание дефолтного администратора
      const result = await AuthService.createDefaultAdmin();

      return res.status(200).json({
        ok: true,
        data: {
          message: result.message
        }
      });

    } catch (error) {
      console.error('❌ Ошибка в AuthController.initializeAdmin:', error);
      return res.status(500).json({
        ok: false,
        error: 'internal_server_error',
        message: 'Ошибка при инициализации администратора'
      });
    }
  }

}

export default new AuthController();