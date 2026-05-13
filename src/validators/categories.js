const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z]/).required().messages({
    'string.pattern.base': 'Category name must start with a letter',
  }),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z]/).required().messages({
    'string.pattern.base': 'Category name must start with a letter',
  }),
});

module.exports = { categorySchema, updateCategorySchema };
