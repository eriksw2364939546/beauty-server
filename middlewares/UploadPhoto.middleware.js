import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

class UploadPhotoMiddleware {
  constructor() {
    // Базовая папка uploads
    this.baseUploadDir = path.join(process.cwd(), 'public/uploads');

    // Создаем базовую папку если не существует
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }

    // Настройка multer для хранения в памяти
    this.storage = multer.memoryStorage();

    // Настройка фильтра файлов
    this.fileFilter = (req, file, cb) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/heic'
      ];

      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('invalid_format'), false);
      }
    };

    // Основная конфигурация multer
    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1
      }
    });
  }

  // Получить путь к папке для конкретного типа сущности
  getUploadDir(entityType) {
    const uploadDir = path.join(this.baseUploadDir, entityType);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return uploadDir;
  }

  // Middleware для одного изображения с обработкой
  single(fieldName = 'image', entityType = 'general') {
    return [
      this.upload.single(fieldName),
      this.createProcessImageMiddleware(entityType, true)
    ];
  }

  // Опциональная загрузка
  optional(fieldName = 'image', entityType = 'general') {
    return [
      (req, res, next) => {
        const uploadSingle = this.upload.single(fieldName);

        uploadSingle(req, res, (error) => {
          if (error && error.code !== 'LIMIT_UNEXPECTED_FILE') {
            return this.handleUploadError(error, res);
          }
          next();
        });
      },
      this.createProcessImageMiddleware(entityType, false)
    ];
  }

  // Фабрика middleware для обработки изображений
  createProcessImageMiddleware(entityType, required = true) {
    return async (req, res, next) => {
      try {
        if (!req.file) {
          if (required) {
            return res.status(400).json({
              ok: false,
              error: 'file_required',
              message: 'Изображение обязательно'
            });
          }
          return next();
        }

        const imagePath = await this.processImage(req.file.buffer, entityType);
        req.processedImage = imagePath;

        next();
      } catch (error) {
        console.error('Image processing error:', error);
        return res.status(500).json({
          ok: false,
          error: 'image_processing_error',
          message: 'Ошибка обработки изображения'
        });
      }
    };
  }

  // Обработка изображения — только один размер
  async processImage(buffer, entityType = 'general') {
    const uuid = uuidv4();
    const uploadDir = this.getUploadDir(entityType);

    const filename = `${uuid}.webp`;
    const outputPath = path.join(uploadDir, filename);

    // Настройки изображения
    const config = { width: 1200, height: 900, quality: 80, maxSize: 100 * 1024 };

    let quality = config.quality;
    let imageBuffer;

    // Обрабатываем изображение
    do {
      imageBuffer = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: 'cover',
          withoutEnlargement: false
        })
        .webp({ quality })
        .toBuffer();

      if (imageBuffer.length > config.maxSize) {
        quality -= 5;
      }
    } while (imageBuffer.length > config.maxSize && quality > 20);

    // Сохраняем файл
    await fs.promises.writeFile(outputPath, imageBuffer);

    // Возвращаем путь: /uploads/services/uuid.webp
    return `/uploads/${entityType}/${filename}`;
  }

  // Удаление файла изображения
  async deleteImage(imagePath) {
    if (!imagePath) return;

    try {
      // /uploads/services/uuid.webp -> public/uploads/services/uuid.webp
      const filePath = path.join(process.cwd(), 'public', imagePath);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`✅ Удален файл: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка удаления файла:`, error);
    }
  }

  // Обработка ошибок загрузки
  handleUploadError(error, res) {
    console.error('Upload error:', error);

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        ok: false,
        error: 'file_too_large',
        message: 'Файл слишком большой. Максимальный размер: 5 MB'
      });
    }

    if (error.message === 'invalid_format') {
      return res.status(400).json({
        ok: false,
        error: 'invalid_format',
        message: 'Неподдерживаемый формат файла. Разрешены: JPG, PNG, WebP, AVIF, HEIC'
      });
    }

    return res.status(500).json({
      ok: false,
      error: 'upload_error',
      message: 'Ошибка загрузки файла'
    });
  }
}

export default new UploadPhotoMiddleware();