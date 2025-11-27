import AuthService from '../services/AuthService.js';

class AuthController {

  // Логин администратора
  async login(req, res) {
    try {
      // Валидация уже выполнена в middleware (validationMiddleware.validateBody)
      // req.body уже провалидирован и очищен
      const { email, password } = req.body;

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
          token: result.token, // Также возвращаем токен в ответе для Postman
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
        data: {
          user: result.user
        }
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

  // Обновление профиля (смена email)
  async updateProfile(req, res) {
    try {
      // Валидация уже выполнена в middleware
      const userId = req.user.id;
      const { newEmail, password } = req.body;

      const result = await AuthService.updateProfile(userId, { newEmail, password });

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'update_failed',
          message: result.message
        });
      }

      return res.status(200).json({
        ok: true,
        data: {
          user: result.user,
          message: 'Профиль успешно обновлён'
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

  // Проверка валидности токена
  async verifyToken(req, res) {
    try {
      // Если дошли сюда — токен валиден (проверен в authMiddleware)
      return res.status(200).json({
        ok: true,
        data: {
          valid: true,
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

  // Инициализация (создание дефолтного администратора)
  async initializeAdmin(req, res) {
    try {
      const result = await AuthService.createDefaultAdmin();

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'init_failed',
          message: result.message
        });
      }

      return res.status(201).json({
        ok: true,
        data: {
          message: result.message,
          created: result.created
        }
      });

    } catch (error) {
      console.error('❌ Ошибка в AuthController.initializeAdmin:', error);
      return res.status(500).json({
        ok: false,
        error: 'internal_server_error',
        message: 'Внутренняя ошибка сервера'
      });
    }
  }
}

export default new AuthController();