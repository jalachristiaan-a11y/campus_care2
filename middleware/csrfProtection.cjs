const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (req.get('X-CSRF-Protection') !== '1') {
    return res.status(403).json({
      message: 'This request could not be verified. Refresh the page and try again.',
    });
  }

  return next();
};

module.exports = csrfProtection;
