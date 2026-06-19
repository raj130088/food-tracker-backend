const validationSchemas = require('../utils/validation');

const validate = (schemaName) => (req, res, next) => {
  try {
    const schema = validationSchemas[schemaName];
    if (!schema) {
      return next();
    }

    const validated = schema.parse(req.body);
    req.body = validated;   // Replace with validated data
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors || error.message
    });
  }
};

module.exports = validate;