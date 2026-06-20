const User = require('../models/user.model');

const userService = {
  async getProfile(userId) {
    return await User.findById(userId);
  },

  async updateProfile(userId, updateData) {
    return await User.update(userId, updateData);
  }
};

module.exports = userService;