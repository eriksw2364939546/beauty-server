import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { verifyToken } from '../utils/jwt.js';

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

      // Проверяем токен с помощью вашей утилиты
      const decoded = verifyToken(token);

      // Ищем пользователя - поддерживаем оба варианта (userId и id)
      const userId = decoded.userId || decoded.id;
      if (!userId) {
        return res.status(401).json({
          ok: false,
          error: 'unauthorized',
          message: 'Неверный формат токена'
        });
      }

      const user = await User.findById(userId);

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
      req.user = {
        id: user._id,
        email: decoded.email,
        role: user.role
      };

      next();

    } catch (error) {
      if (error.message === 'Токен истек') {
        return res.status(401).json({
          ok: false,
          error: 'token_expired',
          message: 'Токен истек'
        });
      }

      if (error.message === 'Неверный токен') {
        return res.status(401).json({
          ok: false,
          error: 'unauthorized',
          message: 'Неверный токен'
        });
      }

      console.error('❌ Ошибка в AuthMiddleware.verifyToken:', error);
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
        const decoded = verifyToken(token);
        const userId = decoded.userId || decoded.id;

        if (userId) {
          const user = await User.findById(userId);
          if (user && user.role === 'admin') {
            req.user = {
              id: user._id,
              email: decoded.email,
              role: user.role
            };
          }
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

      verifyToken(token);
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