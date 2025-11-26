import mongoose from 'mongoose';

/**
 * Карта транслитерации кириллицы в латиницу
 */
const transliterationMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
};

/**
 * Транслитерация кириллицы в латиницу
 * @param {string} text - Текст для транслитерации
 * @returns {string} - Транслитерированный текст
 */
export const transliterate = (text) => {
  if (!text) return '';
  
  return text
    .split('')
    .map(char => transliterationMap[char] || char)
    .join('');
};

/**
 * Создание базового slug из текста
 * @param {string} text - Исходный текст
 * @returns {string} - Базовый slug
 */
export const createBaseSlug = (text) => {
  if (!text) return '';

  return transliterate(text)
    .toLowerCase() // Приводим к нижнему регистру
    .trim() // Убираем пробелы в начале и конце
    .replace(/[^\w\s-]/g, '') // Убираем спецсимволы, оставляем буквы, цифры, пробелы и дефисы
    .replace(/[\s_-]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, ''); // Убираем дефисы в начале и конце
};

/**
 * Проверка уникальности slug в коллекции
 * @param {string} baseSlug - Базовый slug
 * @param {string} modelName - Название модели (Category, Service, Product)
 * @param {string} excludeId - ID записи для исключения (при обновлении)
 * @returns {Promise<boolean>} - true если slug уникален
 */
export const isSlugUnique = async (baseSlug, modelName, excludeId = null) => {
  try {
    const Model = mongoose.model(modelName);
    
    const query = { slug: baseSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingRecord = await Model.findOne(query);
    return !existingRecord;

  } catch (error) {
    console.error('Slug uniqueness check error:', error);
    return false;
  }
};

/**
 * Генерация уникального slug
 * @param {string} text - Исходный текст
 * @param {string} modelName - Название модели
 * @param {string} excludeId - ID записи для исключения (при обновлении)
 * @returns {Promise<string>} - Уникальный slug
 */
export const generateSlug = async (text, modelName, excludeId = null) => {
  try {
    if (!text || !modelName) {
      throw new Error('Текст и название модели обязательны');
    }

    // Создаем базовый slug
    const baseSlug = createBaseSlug(text);
    
    if (!baseSlug) {
      throw new Error('Не удалось создать slug из предоставленного текста');
    }

    // Проверяем уникальность базового slug
    const isUnique = await isSlugUnique(baseSlug, modelName, excludeId);
    
    if (isUnique) {
      return baseSlug;
    }

    // Если не уникален, добавляем цифру в конец
    let counter = 2;
    let uniqueSlug = `${baseSlug}-${counter}`;

    while (!(await isSlugUnique(uniqueSlug, modelName, excludeId))) {
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
      
      // Защита от бесконечного цикла
      if (counter > 1000) {
        // Добавляем случайную строку
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        uniqueSlug = `${baseSlug}-${randomSuffix}`;
        break;
      }
    }

    return uniqueSlug;

  } catch (error) {
    console.error('Slug generation error:', error);
    throw new Error('Ошибка генерации slug');
  }
};

/**
 * Обновление slug для существующей записи
 * @param {string} newTitle - Новый заголовок
 * @param {string} currentSlug - Текущий slug
 * @param {string} modelName - Название модели
 * @param {string} recordId - ID записи
 * @returns {Promise<string>} - Новый или существующий slug
 */
export const updateSlug = async (newTitle, currentSlug, modelName, recordId) => {
  try {
    // Создаем новый базовый slug из нового заголовка
    const newBaseSlug = createBaseSlug(newTitle);
    
    // Если новый базовый slug совпадает с текущим, не меняем
    if (newBaseSlug === currentSlug) {
      return currentSlug;
    }

    // Генерируем уникальный slug, исключая текущую запись
    return await generateSlug(newTitle, modelName, recordId);

  } catch (error) {
    console.error('Slug update error:', error);
    throw new Error('Ошибка обновления slug');
  }
};

/**
 * Валидация slug
 * @param {string} slug - Slug для проверки
 * @returns {Object} - Результат валидации
 */
export const validateSlug = (slug) => {
  const errors = [];

  if (!slug) {
    errors.push('Slug не может быть пустым');
    return { isValid: false, errors };
  }

  if (typeof slug !== 'string') {
    errors.push('Slug должен быть строкой');
  }

  if (slug.length < 1) {
    errors.push('Slug слишком короткий');
  }

  if (slug.length > 100) {
    errors.push('Slug слишком длинный (максимум 100 символов)');
  }

  // Проверяем формат slug
  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(slug)) {
    errors.push('Slug может содержать только строчные буквы, цифры и дефисы');
  }

  // Проверяем, что slug не начинается и не заканчивается дефисом
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug не может начинаться или заканчиваться дефисом');
  }

  // Проверяем на двойные дефисы
  if (slug.includes('--')) {
    errors.push('Slug не может содержать двойные дефисы');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Получение всех slug из коллекции (для отладки)
 * @param {string} modelName - Название модели
 * @returns {Promise<Array>} - Массив существующих slug
 */
export const getAllSlugs = async (modelName) => {
  try {
    const Model = mongoose.model(modelName);
    const records = await Model.find({}, 'slug').lean();
    return records.map(record => record.slug);
  } catch (error) {
    console.error('Get all slugs error:', error);
    return [];
  }
};