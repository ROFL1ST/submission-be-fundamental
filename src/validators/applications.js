const Joi = require('joi');

const applicationSchema = Joi.object({
  userid: Joi.string().uuid().required(),
  jobid: Joi.string().uuid().required(),
  status: Joi.string().default('pending'),
});

const updateApplicationSchema = Joi.object({
  status: Joi.string().required(),
});

module.exports = { applicationSchema, updateApplicationSchema };
