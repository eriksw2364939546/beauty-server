import jwt from 'jsonwebtoken';

// Получаем секретный ключ из переменных окружения
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret';

/**
 * Создание JWT токена
 * @param {Object} payload - Данные для токена (например, { userId, email, role })
 * @param {Object} options - Опции токена (expiresIn, issuer и т.д.)
 * @returns {string} - JWT токен
 */
export const createToken = (payload, options = {}) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload должен быть объектом');
    }

    // Настройки по умолчанию
    const defaultOptions = {
      expiresIn: '7d', // Токен действует 7 дней
      issuer: 'beauty-server',
      algorithm: 'HS256'
    };

    // Объединяем настройки
    const tokenOptions = { ...defaultOptions, ...options };

    // Создаем токен
    const token = jwt.sign(payload, JWT_SECRET, tokenOptions);
    return token;

  } catch (error) {
    console.error('JWT creation error:', error);
    throw new Error('Ошибка создания токена');
  }
};

/**
 * Проверка и декодирование JWT токена
 * @param {string} token - JWT токен
 * @returns {Object} - Декодированные данные токена
 */
export const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('Токен не предоставлен');
    }

    // Проверяем и декодируем токен
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Токен истек');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Неверный токен');
    }
    if (error.name === 'NotBeforeError') {
      throw new Error('Токен еще не активен');
    }
    
    console.error('JWT verification error:', error);
    throw new Error('Ошибка проверки токена');
  }
};

/**
 * Декодирование токена без проверки подписи (небезопасно, только для чтения)
 * @param {string} token - JWT токен
 * @returns {Object|null} - Декодированные данные или null
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const decoded = jwt.decode(token);
    return decoded;

  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

/**
 * Создание токена для администратора
 * @param {Object} admin - Объект администратора { _id, email, role }
 * @returns {string} - JWT токен
 */
export const createAdminToken = (admin) => {
  try {
    if (!admin || !admin._id) {
      throw new Error('Некорректные данные администратора');
    }

    const payload = {
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    };

    return createToken(payload, {
      expiresIn: '7d' // Админский токен на 7 дней
    });

  } catch (error) {
    console.error('Admin token creation error:', error);
    throw new Error('Ошибка создания токена администратора');
  }
};

/**
 * Создание refresh токена (долгоживущий)
 * @param {Object} payload - Данные для токена
 * @returns {string} - Refresh токен
 */
export const createRefreshToken = (payload) => {
  try {
    return createToken(payload, {
      expiresIn: '30d', // Refresh токен на 30 дней
      type: 'refresh'
    });

  } catch (error) {
    console.error('Refresh token creation error:', error);
    throw new Error('Ошибка создания refresh токена');
  }
};

/**
 * Проверка срока действия токена
 * @param {string} token - JWT токен
 * @returns {Object} - Информация о сроке действия
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return { isValid: false, expired: true };
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < now;
    const expiresAt = new Date(decoded.exp * 1000);
    const timeLeft = decoded.exp - now;

    return {
      isValid: true,
      expired: isExpired,
      expiresAt,
      timeLeft: timeLeft > 0 ? timeLeft : 0,
      timeLeftHuman: timeLeft > 0 ? `${Math.floor(timeLeft / 3600)}ч ${Math.floor((timeLeft % 3600) / 60)}м` : 'истек'
    };

  } catch (error) {
    console.error('Token expiration check error:', error);
    return { isValid: false, expired: true };
  }
};

/**
 * Извлечение токена из заголовка Authorization
 * @param {string} authHeader - Заголовок Authorization
 * @returns {string|null} - Токен или null
 */
export const extractTokenFromHeader = (authHeader) => {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Убираем "Bearer "
    return token.trim() || null;

  } catch (error) {
    console.error('Token extraction error:', error);
    return null;
  }
};

/**
 * Проверка типа токена
 * @param {string} token - JWT токен
 * @param {string} expectedType - Ожидаемый тип токена
 * @returns {boolean} - true если тип совпадает
 */
export const validateTokenType = (token, expectedType) => {
  try {
    const decoded = decodeToken(token);
    return decoded && decoded.type === expectedType;
  } catch (error) {
    return false;
  }
};