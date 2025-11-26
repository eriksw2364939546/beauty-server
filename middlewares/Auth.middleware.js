import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

class AuthMiddleware {
  // Проверка JWT токена из httpOnly cookie
  async verifyToken(req, res, next) {
    try {
      // Получаем токен из cookie
      const token = req.cookies?.admin_token;

      if (!token) {
        return res.status(401).json({
          ok: false,
          error: 'unauthorized',
          message: 'Требуется авторизация'
        });
      }

      // Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          ok: false,
          error: 'unauthorized',
          message: 'Пользователь не найден'
        });
      }

      // Проверяем роль
      if (user.role !== 'admin') {
        return res.status(403).json({
          ok: false,
          error: 'forbidden',
          message: 'Недостаточно прав'
        });
      }

      // Добавляем пользователя в req для использования в контроллерах
      req.user = user;
      next();

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          ok: false,
          error: 'unauthorized',
          message: 'Неверный токен'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          ok: false,
          error: 'token_expired',
          message: 'Токен истек'
        });
      }

      return res.status(500).json({
        ok: false,
        error: 'server_error',
        message: 'Ошибка сервера'
      });
    }
  }

  // Опциональная проверка токена (не блокирует доступ)
  async optionalAuth(req, res, next) {
    try {
      const token = req.cookies?.admin_token;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (user && user.role === 'admin') {
          req.user = user;
        }
      }

      next();
    } catch (error) {
      // Игнорируем ошибки для опциональной авторизации
      next();
    }
  }

  // Middleware для проверки роли администратора
  requireAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized',
        message: 'Требуется авторизация'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        ok: false,
        error: 'forbidden',
        message: 'Требуются права администратора'
      });
    }

    next();
  }

  // Проверка валидности токена без проверки пользователя (быстрая проверка)
  async quickTokenCheck(req, res, next) {
    try {
      const token = req.cookies?.admin_token;

      if (!token) {
        return res.status(401).json({
          ok: false,
          error: 'unauthorized'
        });
      }

      jwt.verify(token, process.env.JWT_SECRET);
      next();

    } catch (error) {
      return res.status(401).json({
        ok: false,
        error: 'unauthorized'
      });
    }
  }
}

export default new AuthMiddleware();