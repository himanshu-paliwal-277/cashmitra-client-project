const xss = require('xss');
const crypto = require('crypto');

const sanitizeData = (data) => {
  if (typeof data === 'string') {
    return xss(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }

  return data;
};

const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

const hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

const generateCSRFToken = () => {
  return generateSecureToken();
};

const validateCSRFToken = (token, storedToken) => {
  if (!token || !storedToken) {
    return false;
  }
  return token === storedToken;
};

module.exports = {
  sanitizeData,
  generateSecureToken,
  hashData,
  generateCSRFToken,
  validateCSRFToken,
};
