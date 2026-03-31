import { invoiceService } from '../services/invoiceService.js';

export const invoiceController = {
  async findAll(req, res, next) {
    try {
      const { page = 1, limit = 20, retailer_id, status, start_date, end_date, search } = req.query;
      const result = await invoiceService.findAll(
        parseInt(page),
        parseInt(limit),
        retailer_id ? parseInt(retailer_id) : null,
        status,
        start_date,
        end_date,
        search
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const invoice = await invoiceService.findById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const invoice = await invoiceService.create(req.body, req.user.id);
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  },

  async updatePayment(req, res, next) {
    try {
      const { amount } = req.body;
      const invoice = await invoiceService.updatePayment(req.params.id, parseFloat(amount), req.user.id);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }
};
