const Joi = require('joi');

const jobSchema = Joi.object({
  companyid: Joi.string().uuid().required(),
  categoryid: Joi.string().uuid().required(),
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  jobtype: Joi.string().allow('', null),
  experiencelevel: Joi.string().allow('', null),
  locationtype: Joi.string().allow('', null),
  locationcity: Joi.string().allow('', null),
  salarymin: Joi.number().integer().allow(null),
  salarymax: Joi.number().integer().allow(null),
  issalaryvisible: Joi.boolean().default(true),
  status: Joi.string().default('open'),
});

const updateJobSchema = Joi.object({
  companyid: Joi.string().uuid(),
  categoryid: Joi.string().uuid(),
  title: Joi.string(),
  description: Joi.string().allow('', null),
  jobtype: Joi.string().allow('', null),
  experiencelevel: Joi.string().allow('', null),
  locationtype: Joi.string().allow('', null),
  locationcity: Joi.string().allow('', null),
  salarymin: Joi.number().integer().allow(null),
  salarymax: Joi.number().integer().allow(null),
  issalaryvisible: Joi.boolean(),
  status: Joi.string(),
}).min(1);

module.exports = { jobSchema, updateJobSchema };
