import { noticeService } from '../services/noticeService.js';
import { ApiError } from '../utils/ApiError.js';

export const noticeController = {
  async getActive(req, res, next) {
    try {
      const notice = await noticeService.getActive();
      res.json(notice);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await noticeService.findAll(parseInt(page), parseInt(limit), search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const notice = await noticeService.findById(req.params.id);
      if (!notice) {
        throw new ApiError(404, 'Notice not found');
      }
      res.json(notice);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const notice = await noticeService.create(req.body, req.user.id);
      res.status(201).json(notice);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const notice = await noticeService.update(req.params.id, req.body);
      if (!notice) {
        throw new ApiError(404, 'Notice not found');
      }
      res.json(notice);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await noticeService.delete(req.params.id);
      res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async togglePublished(req, res, next) {
    try {
      const notice = await noticeService.togglePublished(req.params.id);
      if (!notice) {
        throw new ApiError(404, 'Notice not found');
      }
      res.json(notice);
    } catch (error) {
      next(error);
    }
  }
};
