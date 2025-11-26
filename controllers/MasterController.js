import MasterService from '../services/MasterService.js';
import { validateMaster, validateMasterUpdate } from '../validations/master.validation.js';

class MasterController {
  // GET /api/masters - получить всех мастеров
  async getAll(req, res, next) {
    try {
      const { page, limit } = req.query;
      
      const result = await MasterService.getAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      res.json({
        ok: true,
        data: result.masters,
        meta: {
          page: result.page,
          total: result.total,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/masters/:id - получить мастера по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const master = await MasterService.getById(id);

      res.json({
        ok: true,
        data: master
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/masters - создать мастера
  async create(req, res, next) {
    try {
      // Валидация входных данных
      const { error, value } = validateMaster(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          details: error.details
        });
      }

      // Проверяем наличие загруженного файла
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: 'Изображение обязательно'
        });
      }

      const master = await MasterService.create(value, req.file);

      res.status(201).json({
        ok: true,
        data: master
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/masters/:id - обновить мастера
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Валидация входных данных
      const { error, value } = validateMasterUpdate(req.body);
      
      if (error) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          details: error.details
        });
      }

      const master = await MasterService.update(id, value, req.file);

      res.json({
        ok: true,
        data: master
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/masters/:id - удалить мастера
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await MasterService.delete(id);

      res.json({
        ok: true,
        message: 'Мастер удален'
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/masters/by-speciality - получить мастеров по специальности
  async getBySpeciality(req, res, next) {
    try {
      const { speciality } = req.query;

      if (!speciality) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: 'Параметр speciality обязателен'
        });
      }

      const masters = await MasterService.getBySpeciality(speciality);

      res.json({
        ok: true,
        data: masters
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/masters/featured - получить избранных мастеров для главной
  async getFeatured(req, res, next) {
    try {
      const { limit } = req.query;

      const masters = await MasterService.getFeatured(parseInt(limit) || 4);

      res.json({
        ok: true,
        data: masters
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MasterController();