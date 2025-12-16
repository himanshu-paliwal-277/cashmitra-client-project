export const isValidObjectId = (id) => {
  if (!id) return false;

  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

export const isValidEmail = (email) => {
  if (!email) return false;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;

  const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phonePattern.test(phone);
};

export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const isInRange = (value, min, max) => {
  if (value === undefined || value === null) return false;
  const numValue = Number(value);
  if (isNaN(numValue)) return false;
  return numValue >= min && numValue <= max;
};

export const isAlphanumeric = (str) => {
  if (!str) return false;
  const alphanumericPattern = /^[a-zA-Z0-9]+$/;
  return alphanumericPattern.test(str);
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true, message: 'Password is valid' };
};

