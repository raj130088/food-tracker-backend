const User = require('../models/user.model');

const userController = {
  // Get current user profile
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
  },

  // Update user profile/goals
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updatedUser = await User.update(userId, req.body);

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