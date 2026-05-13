function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.details[0].message,
        data: null,
      });
    }
    next();
  };
}

module.exports = { validate };
