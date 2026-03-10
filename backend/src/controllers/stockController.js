import { stockService } from '../services/stockService.js';

export const stockController = {
  async getHistory(req, res, next) {
    try {
      const { product_id, start_date, end_date } = req.query;
      const history = await stockService.getHistory(
        product_id ? parseInt(product_id) : null,
        start_date,
        end_date
      );
      res.json(history);
    } catch (error) {
      next(error);
    }
  },

  async createPurchaseOrder(req, res, next) {
    try {
      const po = await stockService.createPurchaseOrder(req.body, req.user.id);
      res.status(201).json(po);
    } catch (error) {
      next(error);
    }
  },

  async receivePurchaseOrder(req, res, next) {
    try {
      const po = await stockService.receivePurchaseOrder(req.params.id, req.user.id);
      res.json(po);
    } catch (error) {
      next(error);
    }
  },

  async getPurchaseOrders(req, res, next) {
    try {
      const { status } = req.query;
      const orders = await stockService.getPurchaseOrders(status);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
};
