import { chatbotService } from '../services/chatbotService.js';

export const chatbotController = {
  async chat(req, res, next) {
    try {
      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ reply: 'Please provide a message.' });
      }
      const result = await chatbotService.processMessage(message.trim());
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
