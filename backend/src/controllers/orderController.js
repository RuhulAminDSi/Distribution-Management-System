import { stockService } from '../services/stockService.js';

export const orderController = {
  async findAll(req, res, next) {
    try {
      const { status } = req.query;
      const orders = await stockService.getPurchaseOrders(status);
      res.json(orders);
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
