import { reportService } from '../services/reportService.js';

export const reportController = {
  async dailySales(req, res, next) {
    try {
      const { date } = req.query;
      const sales = await reportService.dailySales(date || new Date().toISOString().split('T')[0]);
      res.json(sales);
    } catch (error) {
      next(error);
    }
  },

  async productSales(req, res, next) {
    try {
      const { start_date, end_date, product_id } = req.query;
      const sales = await reportService.productSales(start_date, end_date, product_id ? parseInt(product_id) : null);
      res.json(sales);
    } catch (error) {
      next(error);
    }
  },

  async companySales(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const start = start_date || firstDay.toISOString().split('T')[0];
      const end = end_date || today.toISOString().split('T')[0];
      
      const sales = await reportService.companySales(start, end);
      res.json(sales);
    } catch (error) {
      next(error);
    }
  },

  async profitReport(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const start = start_date || firstDay.toISOString().split('T')[0];
      const end = end_date || today.toISOString().split('T')[0];
      
      const profit = await reportService.profitReport(start, end);
      res.json(profit);
    } catch (error) {
      next(error);
    }
  },

  async stockReport(req, res, next) {
    try {
      const stock = await reportService.stockReport();
      res.json(stock);
    } catch (error) {
      next(error);
    }
  },

  async dueReport(req, res, next) {
    try {
      const due = await reportService.dueReport();
      res.json(due);
    } catch (error) {
      next(error);
    }
  }
};
