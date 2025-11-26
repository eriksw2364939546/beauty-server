import dotenv from 'dotenv';
dotenv.config();

console.log('1. dotenv OK');

import logger from './loggers/logger.js';
console.log('2. logger OK');

import database from './config/database.js';
console.log('3. database OK');

// Перезаписываем обработчик
process.removeAllListeners('uncaughtException');
process.removeAllListeners('unhandledRejection');
process.on('uncaughtException', (error) => {
  console.error('!!! CAUGHT ERROR !!!');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

console.log('4. handlers replaced');

// Динамические импорты - выполняются последовательно
async function test() {
  try {
    await import('express');
    console.log('5. express OK');

    await import('cors');
    console.log('6. cors OK');

    await import('./loggers/httpLogger.js');
    console.log('7. httpLogger OK');

    await import('./middlewares/Auth.middleware.js');
    console.log('8. authMiddleware OK');

    await import('./middlewares/UploadPhoto.middleware.js');
    console.log('9. uploadPhotoMiddleware OK');

    await import('./middlewares/Validation.middleware.js');
    console.log('10. validationMiddleware OK');

    await import('./middlewares/ErrorHandler.middleware.js');
    console.log('11. errorHandlerMiddleware OK');

    await import('./routes/auth.routes.js');
    console.log('12. authRoutes OK');

    await import('./routes/category.routes.js');
    console.log('13. categoryRoutes OK');

    await import('./routes/service.routes.js');
    console.log('14. serviceRoutes OK');

    console.log('=== ALL OK ===');
  } catch (error) {
    console.error('!!! IMPORT ERROR !!!');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();