const {
  generateCSRFToken,
  validateCSRFToken,
} = require('../utils/security.utils');


const generateToken = (req, res, next) => {
  
  const csrfToken = generateCSRFToken();

  
  req.session.csrfToken = csrfToken;

  
  res.setHeader('X-CSRF-Token', csrfToken);

  next();
};


const validateToken = (req, res, next) => {
  
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  
  if (req.skipCSRF) {
    return next();
  }

  
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  
  const storedToken = req.session?.csrfToken;

  
  if (!validateCSRFToken(token, storedToken)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token',
    });
  }

  next();
};

module.exports = {
  generateToken,
  validateToken,
};
