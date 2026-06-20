const userService = require('../services/user.service');

const userController = {
  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      res.json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
  },

  async updateProfile(req, res) {
    try {
      const updatedUser = await userService.updateProfile(req.user.id, req.body);

      if (!updatedUser) {
        return res.status(400).json({ success: false, message: 'No valid fields to update' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error updating profile' });
    }
  }
};

module.exports = userController;