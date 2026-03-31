import { companyService, categoryService } from '../services/companyService.js';

export const companyController = {
  async findAll(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await companyService.findAll(parseInt(page), parseInt(limit), search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const company = await companyService.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const company = await companyService.create(req.body);
      res.status(201).json(company);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const company = await companyService.update(req.params.id, req.body);
      res.json(company);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await companyService.delete(req.params.id);
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

export const categoryController = {
  async findAll(req, res, next) {
    try {
      const { company_id } = req.query;
      const categories = await categoryService.findAll(company_id ? parseInt(company_id) : null);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const category = await categoryService.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const category = await categoryService.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const category = await categoryService.update(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await categoryService.delete(req.params.id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};
