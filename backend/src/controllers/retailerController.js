import { retailerService } from '../services/retailerService.js';
import { ApiError } from '../utils/ApiError.js';

export const retailerController = {
  async findAll(req, res, next) {
    try {
      const { page = 1, limit = 20, search, area } = req.query;
      const result = await retailerService.findAll(
        parseInt(page),
        parseInt(limit),
        search,
        area
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const retailer = await retailerService.findById(req.params.id);
      if (!retailer) {
        throw new ApiError(404, 'Retailer not found');
      }
      res.json(retailer);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const retailer = await retailerService.create(req.body);
      res.status(201).json(retailer);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const retailer = await retailerService.update(req.params.id, req.body);
      res.json(retailer);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await retailerService.delete(req.params.id);
      res.json({ message: 'Retailer deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getBalance(req, res, next) {
    try {
      const balance = await retailerService.getBalance(req.params.id);
      res.json(balance);
    } catch (error) {
      next(error);
    }
  },

  async getAreas(req, res, next) {
    try {
      const areas = await retailerService.getAllAreas();
      res.json(areas);
    } catch (error) {
      next(error);
    }
  }
};
