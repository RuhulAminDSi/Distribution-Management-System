import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
};
