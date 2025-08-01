const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Please select a valid gender option'),
  handleValidationErrors
];

const validateLogin = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required')
    .custom((value) => {
      if (value.includes('@')) {
        const { isEmail } = require('validator');
        if (!isEmail(value)) {
          throw new Error('Please provide a valid email');
        }
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidationErrors
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid reset token format'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

const validateUpdatePreferences = [
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('categories.*')
    .optional()
    .isIn(['Dance', 'Tech Conference', 'Music', 'International Events', 'Festivals', 'Games', 'Sports', 'Education', 'Art', 'House Party', 'Cooking', 'Exhibition', 'Modelling', 'Gospel', 'Car Showroom and Drifting'])
    .withMessage('Invalid category selected'),
  body('ageRange')
    .optional()
    .isIn(['10-15', '16-20', '21-25', '25-30', '30-35', '36 and Above'])
    .withMessage('Invalid age range selected'),
  body('personality')
    .optional()
    .isIn(['Extrovert', 'Introvert', 'Ambivert'])
    .withMessage('Invalid personality type selected'),
  body('role')
    .optional()
    .isIn(['Event Creator', 'Event Attendee'])
    .withMessage('Invalid role selected'),
  body('priceRange.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum price must be a number'),
  body('priceRange.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum price must be a number')
    .custom((value, { req }) => {
      if (req.body.priceRange && req.body.priceRange.min && value < req.body.priceRange.min) {
        throw new Error('Maximum price must be greater than minimum price');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePreferences,
  handleValidationErrors
};