function validate(schema) {
  return (req, res, next) => {
    try {
      if (!schema) return next();
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validated = parsed;
      next();
    } catch (err) {
      err.statusCode = 400;
      err.errorCode = "BAD_REQUEST";
      next(err);
    }
  };
}

module.exports = { validate };