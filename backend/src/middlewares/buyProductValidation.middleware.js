const { body, validationResult } = require('express-validator');

// Comprehensive validation for creating buy products
const validateCreateBuyProduct = [
  // Required fields
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand must be between 2 and 100 characters'),

  // Optional boolean field
  body('isRefurbished')
    .optional()
    .isBoolean()
    .withMessage('isRefurbished must be a boolean'),

  // Images validation - allow both arrays and objects
  body('images')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  // Badges validation
  body('badges.qualityChecks')
    .optional()
    .isString()
    .withMessage('Quality checks badge must be a string'),
  body('badges.warranty')
    .optional()
    .isString()
    .withMessage('Warranty badge must be a string'),
  body('badges.refundPolicy')
    .optional()
    .isString()
    .withMessage('Refund policy badge must be a string'),
  body('badges.assurance')
    .optional()
    .isString()
    .withMessage('Assurance badge must be a string'),

  // Pricing validation
  body('pricing.mrp')
    .optional()
    .isNumeric()
    .withMessage('MRP must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('MRP must be a positive number');
      }
      return true;
    }),
  body('pricing.discountedPrice')
    .optional()
    .isNumeric()
    .withMessage('Discounted price must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Discounted price must be a positive number');
      }
      return true;
    }),
  body('pricing.discountPercent')
    .optional()
    .isNumeric()
    .withMessage('Discount percent must be a number')
    .custom((value) => {
      if (value < 0 || value > 100) {
        throw new Error('Discount percent must be between 0 and 100');
      }
      return true;
    }),

  // Condition options validation - allow both arrays and objects
  body('conditionOptions')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('conditionOptions.*.label')
    .optional()
    .isString()
    .withMessage('Condition label must be a string'),
  body('conditionOptions.*.price')
    .optional()
    .isNumeric()
    .withMessage('Condition price must be a number'),

  // Variants validation - allow both arrays and objects
  body('variants')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('variants.*.variantId')
    .optional()
    .isString()
    .withMessage('Variant ID must be a string'),
  body('variants.*.storage')
    .optional()
    .isString()
    .withMessage('Storage must be a string'),
  body('variants.*.color')
    .optional()
    .isString()
    .withMessage('Color must be a string'),
  body('variants.*.price')
    .optional()
    .isNumeric()
    .withMessage('Variant price must be a number'),
  body('variants.*.stock')
    .optional()
    .isBoolean()
    .withMessage('Stock must be a boolean'),

  // Add-ons validation - allow both arrays and objects
  body('addOns')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('addOns.*.name')
    .optional()
    .isString()
    .withMessage('Add-on name must be a string'),
  body('addOns.*.cost')
    .optional()
    .isNumeric()
    .withMessage('Add-on cost must be a number'),
  body('addOns.*.description')
    .optional()
    .isString()
    .withMessage('Add-on description must be a string'),

  // Offers validation - allow both arrays and objects
  body('offers')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('offers.*.type')
    .optional()
    .isString()
    .withMessage('Offer type must be a string'),
  body('offers.*.value')
    .optional()
    .isString()
    .withMessage('Offer value must be a string'),
  body('offers.*.conditions')
    .optional()
    .isString()
    .withMessage('Offer conditions must be a string'),

  // Rating validation
  body('rating.average')
    .optional()
    .isNumeric()
    .withMessage('Rating average must be a number')
    .custom((value) => {
      if (value < 0 || value > 5) {
        throw new Error('Rating average must be between 0 and 5');
      }
      return true;
    }),
  body('rating.totalReviews')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total reviews must be a non-negative integer'),

  // Reviews validation - allow both arrays and objects
  body('reviews')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('reviews.*.reviewer')
    .optional()
    .isString()
    .withMessage('Reviewer name must be a string'),
  body('reviews.*.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Review rating must be between 1 and 5'),
  body('reviews.*.comment')
    .optional()
    .isString()
    .withMessage('Review comment must be a string'),

  // Payment options validation
  body('paymentOptions.emiAvailable')
    .optional()
    .isBoolean()
    .withMessage('EMI available must be a boolean'),
  body('paymentOptions.emiPlans')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('paymentOptions.methods')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),

  // Availability validation
  body('availability.inStock')
    .optional()
    .isBoolean()
    .withMessage('In stock must be a boolean'),
  body('availability.deliveryPincode')
    .optional()
    .isString()
    .withMessage('Delivery pincode must be a string'),
  body('availability.estimatedDelivery')
    .optional()
    .isString()
    .withMessage('Estimated delivery must be a string'),

  // Top specs validation
  body('topSpecs.screenSize')
    .optional()
    .isString()
    .withMessage('Screen size must be a string'),
  body('topSpecs.chipset')
    .optional()
    .isString()
    .withMessage('Chipset must be a string'),
  body('topSpecs.pixelDensity')
    .optional()
    .isString()
    .withMessage('Pixel density must be a string'),
  body('topSpecs.networkSupport')
    .optional()
    .isString()
    .withMessage('Network support must be a string'),
  body('topSpecs.simSlots')
    .optional()
    .isString()
    .withMessage('SIM slots must be a string'),

  // Product details validation (comprehensive)
  body('productDetails.frontCamera.resolution')
    .optional()
    .isString()
    .withMessage('Front camera resolution must be a string'),
  body('productDetails.frontCamera.features')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),

  body('productDetails.rearCamera.setup')
    .optional()
    .isString()
    .withMessage('Rear camera setup must be a string'),
  body('productDetails.rearCamera.features')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),

  body('productDetails.networkConnectivity.wifi')
    .optional()
    .isString()
    .withMessage('WiFi must be a string'),
  body('productDetails.networkConnectivity.wifiFeatures')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('productDetails.networkConnectivity.has3p5mmJack')
    .optional()
    .isBoolean()
    .withMessage('3.5mm jack availability must be a boolean'),

  body('productDetails.display.type')
    .optional()
    .isString()
    .withMessage('Display type must be a string'),
  body('productDetails.display.size')
    .optional()
    .isString()
    .withMessage('Display size must be a string'),

  body('productDetails.general.brand')
    .optional()
    .isString()
    .withMessage('General brand must be a string'),
  body('productDetails.general.modelNumber')
    .optional()
    .isString()
    .withMessage('Model number must be a string'),

  body('productDetails.memoryStorage.phoneVariants')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('productDetails.memoryStorage.expandableStorage')
    .optional()
    .isBoolean()
    .withMessage('Expandable storage must be a boolean'),

  body('productDetails.performance.chipset')
    .optional()
    .isString()
    .withMessage('Performance chipset must be a string'),
  body('productDetails.performance.os')
    .optional()
    .isString()
    .withMessage('Operating system must be a string'),

  body('productDetails.battery.type')
    .optional()
    .isString()
    .withMessage('Battery type must be a string'),

  body('productDetails.design.colors')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('productDetails.design.weight')
    .optional()
    .isString()
    .withMessage('Weight must be a string'),

  body('productDetails.sensorsMisc.fingerprintScanner')
    .optional()
    .isBoolean()
    .withMessage('Fingerprint scanner must be a boolean'),
  body('productDetails.sensorsMisc.sensors')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),

  // Description validation
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  // Trust metrics validation
  body('trustMetrics.devicesSold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Devices sold must be a non-negative integer'),
  body('trustMetrics.qualityChecks')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quality checks must be a non-negative integer'),

  // Related products validation - allow both arrays and objects
  body('relatedProducts')
    .optional()
    .custom((value) => {
      if (value && typeof value === 'object') {
        return true; // Accept both arrays and objects
      }
      return true;
    }),
  body('relatedProducts.*.id')
    .optional()
    .isString()
    .withMessage('Related product ID must be a string'),
  body('relatedProducts.*.name')
    .optional()
    .isString()
    .withMessage('Related product name must be a string'),
  body('relatedProducts.*.price')
    .optional()
    .isNumeric()
    .withMessage('Related product price must be a number'),

  // Legal validation
  body('legal.terms')
    .optional()
    .isString()
    .withMessage('Terms must be a string'),
  body('legal.privacy')
    .optional()
    .isString()
    .withMessage('Privacy must be a string'),
  body('legal.copyright')
    .optional()
    .isString()
    .withMessage('Copyright must be a string'),

  // Admin fields validation
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt()
    .withMessage('Sort order must be an integer')
];

// Validation for updating buy products (similar but all optional)
const validateUpdateBuyProduct = [
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID format'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Brand must be between 2 and 100 characters'),

  // Include all the same validations as create but make them optional
  ...validateCreateBuyProduct.map(validation => {
    // Make all validations optional for update
    if (validation.builder && validation.builder.fields) {
      validation.builder.fields.forEach(field => {
        field.optional = true;
      });
    }
    return validation;
  })
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

module.exports = {
  validateCreateBuyProduct,
  validateUpdateBuyProduct,
  handleValidationErrors
};