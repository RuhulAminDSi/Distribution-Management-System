import { stockService } from '../services/stockService.js';

export const orderController = {
  async findAll(req, res, next) {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const orders = await stockService.getPurchaseOrders(
        parseInt(page), parseInt(limit), search, status
      );
      res.json(orders);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const po = await stockService.getPurchaseOrderById(req.params.id);
      if (!po) return res.status(404).json({ error: 'Order not found' });
      res.json(po);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const po = await stockService.createPurchaseOrder(req.body, req.user.id);
      res.status(201).json(po);
    } catch (error) {
      next(error);
    }
  }
};
