import MasterService from '../services/MasterService.js';

class MasterController {
  // GET /api/masters - получить всех мастеров
  async getAll(req, res, next) {
    try {
      const { speciality, search, page, limit } = req.query;

      const result = await MasterService.getAllMasters({
        speciality,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 12
      });

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'fetch_error',
          message: result.message
        });
      }

      res.json({
        ok: true,
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/masters/:id - получить мастера по ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await MasterService.getMasterById(id);

      if (!result.success) {
        return res.status(404).json({
          ok: false,
          error: 'not_found',
          message: result.message
        });
      }

      res.json({
        ok: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/masters/featured - избранные мастера
  async getFeatured(req, res, next) {
    try {
      const { limit } = req.query;

      const result = await MasterService.getFeaturedMasters(parseInt(limit) || 4);

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'fetch_error',
          message: result.message
        });
      }

      res.json({
        ok: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/masters/by-speciality - мастера по специальности
  async getBySpeciality(req, res, next) {
    try {
      const { speciality } = req.query;

      const result = await MasterService.getMastersBySpeciality(speciality);

      if (!result.success) {
        return res.status(404).json({
          ok: false,
          error: 'not_found',
          message: result.message
        });
      }

      res.json({
        ok: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/masters - создать мастера
  async create(req, res, next) {
    try {
      // Проверяем наличие обработанного изображения
      if (!req.processedImage) {
        return res.status(400).json({
          ok: false,
          error: 'validation_error',
          message: 'Изображение обязательно'
        });
      }

      const result = await MasterService.createMaster(req.body, req.processedImage);

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'create_error',
          message: result.message
        });
      }

      res.status(201).json({
        ok: true,
        data: result.data,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/masters/:id - обновить мастера
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const result = await MasterService.updateMaster(id, req.body, req.processedImage);

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'update_error',
          message: result.message
        });
      }

      res.json({
        ok: true,
        data: result.data,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/masters/:id - удалить мастера
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await MasterService.deleteMaster(id);

      if (!result.success) {
        return res.status(400).json({
          ok: false,
          error: 'delete_error',
          message: result.message
        });
      }

      res.json({
        ok: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MasterController();