import { query } from '../config/database.js';

export const uploadController = {
  async uploadProfilePicture(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = parseInt(req.params.id);
      const picturePath = `/uploads/profile_pictures/${req.file.filename}`;

      await query('UPDATE users SET profile_picture = ? WHERE id = ?', [picturePath, userId]);

      res.json({
        message: 'Profile picture uploaded successfully',
        profile_picture: picturePath
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProfilePicture(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      await query('UPDATE users SET profile_picture = ? WHERE id = ?', [null, userId]);
      res.json({ message: 'Profile picture removed' });
    } catch (error) {
      next(error);
    }
  }
};
