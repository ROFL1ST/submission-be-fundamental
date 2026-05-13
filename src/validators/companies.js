const Joi = require('joi');

const companySchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z]/).required().messages({
    'string.pattern.base': 'Company name must start with a letter',
  }),
  location: Joi.string().required(),
  description: Joi.string().allow('', null),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().pattern(/^[a-zA-Z]/).messages({
    'string.pattern.base': 'Company name must start with a letter',
  }),
  location: Joi.string(),
  description: Joi.string().allow('', null),
}).min(1);

module.exports = { companySchema, updateCompanySchema };
