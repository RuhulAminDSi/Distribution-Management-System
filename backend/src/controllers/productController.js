import { productService } from '../services/productService.js';

export const productController = {
  async findAll(req, res, next) {
    try {
      const { page = 1, limit = 20, search, company_id, category_id } = req.query;
      const result = await productService.findAll(
        parseInt(page),
        parseInt(limit),
        search,
        company_id ? parseInt(company_id) : null,
        category_id ? parseInt(category_id) : null
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const product = await productService.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getLowStock(req, res, next) {
    try {
      const products = await productService.getLowStock();
      res.json(products);
    } catch (error) {
      next(error);
    }
  },

  async getExpired(req, res, next) {
    try {
      const products = await productService.getExpired();
      res.json(products);
    } catch (error) {
      next(error);
    }
  },

  async getExpiringSoon(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const products = await productService.getExpiringSoon(parseInt(days));
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
};
