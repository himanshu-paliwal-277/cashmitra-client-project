/**
 * Utility functions for data validation beyond express-validator
 */

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {String} id - The ID to validate
 * @returns {Boolean} - Whether the ID is valid
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  // MongoDB ObjectId is a 24 character hex string
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

/**
 * Validates if a string is a valid email address
 * @param {String} email - The email to validate
 * @returns {Boolean} - Whether the email is valid
 */
const isValidEmail = (email) => {
  if (!email) return false;
  // Basic email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

/**
 * Validates if a string is a valid phone number
 * @param {String} phone - The phone number to validate
 * @returns {Boolean} - Whether the phone number is valid
 */
const isValidPhone = (phone) => {
  if (!phone) return false;
  // Basic phone validation pattern (allows various formats)
  const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phonePattern.test(phone);
};

/**
 * Validates if a string is a valid URL
 * @param {String} url - The URL to validate
 * @returns {Boolean} - Whether the URL is valid
 */
const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validates if a value is within a specified range
 * @param {Number} value - The value to validate
 * @param {Number} min - The minimum allowed value
 * @param {Number} max - The maximum allowed value
 * @returns {Boolean} - Whether the value is within range
 */
const isInRange = (value, min, max) => {
  if (value === undefined || value === null) return false;
  const numValue = Number(value);
  if (isNaN(numValue)) return false;
  return numValue >= min && numValue <= max;
};

/**
 * Validates if a string contains only alphanumeric characters
 * @param {String} str - The string to validate
 * @returns {Boolean} - Whether the string is alphanumeric
 */
const isAlphanumeric = (str) => {
  if (!str) return false;
  const alphanumericPattern = /^[a-zA-Z0-9]+$/;
  return alphanumericPattern.test(str);
};

/**
 * Validates if a password meets security requirements
 * @param {String} password - The password to validate
 * @returns {Object} - Validation result and message
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is valid' };
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isInRange,
  isAlphanumeric,
  validatePassword
};