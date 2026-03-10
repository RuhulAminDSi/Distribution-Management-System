import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  async findAll(req, res, next) {
    try {
      const { page = 1, limit = 20, retailer_id, start_date, end_date } = req.query;
      const result = await paymentService.findAll(
        parseInt(page),
        parseInt(limit),
        retailer_id ? parseInt(retailer_id) : null,
        start_date,
        end_date
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const payment = await paymentService.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      res.json(payment);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const payment = await paymentService.create(req.body, req.user.id);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  },

  async getRetailerPayments(req, res, next) {
    try {
      const payments = await paymentService.getRetailerPayments(req.params.retailerId);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }
};
