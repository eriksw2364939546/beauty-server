import CryptoJS from 'crypto-js';

// Получаем ключ шифрования из переменных окружения
const CRYPTO_KEY = process.env.CRYPTO_KEY || 'default-crypto-key';

/**
 * Шифрование строки
 * @param {string} text - Текст для шифрования
 * @returns {string} - Зашифрованный текст
 */
export const encryptString = (text) => {
  try {
    if (!text) return '';
    return CryptoJS.AES.encrypt(text.toString(), CRYPTO_KEY).toString();
  } catch (error) {
    console.error('Crypto encryption error:', error);
    throw new Error('Ошибка шифрования данных');
  }
};

/**
 * Расшифровка строки
 * @param {string} encryptedText - Зашифрованный текст
 * @returns {string} - Расшифрованный текст
 */
export const decryptString = (encryptedText) => {
  try {
    if (!encryptedText) return '';
    const bytes = CryptoJS.AES.decrypt(encryptedText, CRYPTO_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Crypto decryption error:', error);
    throw new Error('Ошибка расшифровки данных');
  }
};

/**
 * Проверка, является ли строка зашифрованной
 * @param {string} text - Проверяемый текст
 * @returns {boolean} - true если зашифрован
 */
export const isEncrypted = (text) => {
  try {
    if (!text) return false;
    const decrypted = decryptString(text);
    return decrypted !== text;
  } catch (error) {
    return false;
  }
};

/**
 * Шифрование объекта
 * @param {Object} obj - Объект для шифрования
 * @returns {string} - Зашифрованный JSON
 */
export const encryptObject = (obj) => {
  try {
    if (!obj) return '';
    const jsonString = JSON.stringify(obj);
    return encryptString(jsonString);
  } catch (error) {
    console.error('Object encryption error:', error);
    throw new Error('Ошибка шифрования объекта');
  }
};

/**
 * Расшифровка объекта
 * @param {string} encryptedObj - Зашифрованный объект
 * @returns {Object} - Расшифрованный объект
 */
export const decryptObject = (encryptedObj) => {
  try {
    if (!encryptedObj) return null;
    const decryptedString = decryptString(encryptedObj);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Object decryption error:', error);
    throw new Error('Ошибка расшифровки объекта');
  }
};

/**
 * Генерация криптографически стойкого ключа
 * @param {number} length - Длина ключа в байтах
 * @returns {string} - Сгенерированный ключ в hex формате
 */
export const generateSecureKey = (length = 32) => {
  try {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('Key generation error:', error);
    throw new Error('Ошибка генерации ключа');
  }
};