import { reportService } from '../services/reportService.js';

export const reportController = {
  async dailySales(req, res, next) {
    try {
      const { start_date, end_date, page = 1, limit = 20 } = req.query;
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const start = start_date || firstDay.toISOString().split('T')[0];
      const end = end_date || today.toISOString().split('T')[0];
      
      const result = await reportService.dailySales(start, end, parseInt(page), parseInt(limit));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async productSales(req, res, next) {
    try {
      const { start_date, end_date, product_id, page = 1, limit = 20 } = req.query;
      const result = await reportService.productSales(start_date, end_date, product_id ? parseInt(product_id) : null, parseInt(page), parseInt(limit));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async companySales(req, res, next) {
    try {
      const { start_date, end_date, page = 1, limit = 20 } = req.query;
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const start = start_date || firstDay.toISOString().split('T')[0];
      const end = end_date || today.toISOString().split('T')[0];
      
      const result = await reportService.companySales(start, end, parseInt(page), parseInt(limit));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async profitReport(req, res, next) {
    try {
      const { start_date, end_date, page = 1, limit = 20 } = req.query;
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const start = start_date || firstDay.toISOString().split('T')[0];
      const end = end_date || today.toISOString().split('T')[0];
      
      const result = await reportService.profitReport(start, end, parseInt(page), parseInt(limit));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async stockReport(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await reportService.stockReport(parseInt(page), parseInt(limit));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async dueReport(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await reportService.dueReport(parseInt(page), parseInt(limit));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async expiryReport(req, res, next) {
    try {
      const result = await reportService.expiryReport();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
