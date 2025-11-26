import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

class UploadPhotoMiddleware {
  constructor() {
    // Создаем папку uploads если не существует
    this.uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Настройка multer для хранения в памяти
    this.storage = multer.memoryStorage();
    
    // Настройка фильтра файлов
    this.fileFilter = (req, file, cb) => {
      // Разрешенные MIME типы
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
        files: 1 // Только один файл
      }
    });
  }

  // Middleware для одного изображения с обработкой
  single(fieldName = 'image') {
    return [
      this.upload.single(fieldName),
      this.processImage.bind(this)
    ];
  }

  // Опциональная загрузка (не обязательная)
  optional(fieldName = 'image') {
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
      this.processOptionalImage.bind(this)
    ];
  }

  // Обработка изображения с Sharp
  async processImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: 'file_required',
          message: 'Изображение обязательно'
        });
      }

      const processedImages = await this.createImageSizes(req.file.buffer);
      req.processedImages = processedImages;
      
      next();
    } catch (error) {
      console.error('Image processing error:', error);
      return res.status(500).json({
        ok: false,
        error: 'image_processing_error',
        message: 'Ошибка обработки изображения'
      });
    }
  }

  // Обработка опционального изображения
  async processOptionalImage(req, res, next) {
    try {
      if (req.file) {
        const processedImages = await this.createImageSizes(req.file.buffer);
        req.processedImages = processedImages;
      }
      
      next();
    } catch (error) {
      console.error('Image processing error:', error);
      return res.status(500).json({
        ok: false,
        error: 'image_processing_error',
        message: 'Ошибка обработки изображения'
      });
    }
  }

  // Создание трех размеров изображения
  async createImageSizes(buffer) {
    const uuid = uuidv4();
    
    // Размеры изображений
    const sizes = {
      large: { width: 1200, height: 900, quality: 80, maxSize: 80 * 1024 },
      medium: { width: 800, height: 600, quality: 80, maxSize: 80 * 1024 },
      thumb: { width: 400, height: 300, quality: 75, maxSize: 40 * 1024 }
    };

    const processedImages = {};

    for (const [sizeName, config] of Object.entries(sizes)) {
      const filename = `${config.width}-${uuid}.webp`;
      const outputPath = path.join(this.uploadDir, filename);

      let quality = config.quality;
      let imageBuffer;

      // Обрабатываем изображение с начальным качеством
      do {
        imageBuffer = await sharp(buffer)
          .resize(config.width, config.height, { 
            fit: 'cover', 
            withoutEnlargement: false 
          })
          .webp({ quality })
          .toBuffer();

        // Если размер превышает лимит, снижаем качество
        if (imageBuffer.length > config.maxSize) {
          quality -= 5;
        }
      } while (imageBuffer.length > config.maxSize && quality > 20);

      // Сохраняем файл
      await fs.promises.writeFile(outputPath, imageBuffer);

      processedImages[sizeName] = `/uploads/${filename}`;
    }

    return processedImages;
  }

  // Удаление файлов изображения
  async deleteImageFiles(imageObject) {
    if (!imageObject) return;

    const sizes = ['large', 'medium', 'thumb'];
    
    for (const size of sizes) {
      if (imageObject[size]) {
        try {
          const filename = path.basename(imageObject[size]);
          const filePath = path.join(this.uploadDir, filename);
          
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        } catch (error) {
          console.error(`Ошибка удаления файла ${size}:`, error);
        }
      }
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