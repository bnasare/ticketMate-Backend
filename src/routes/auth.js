const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  updatePreferences,
  logout,
  forgotPassword,
  resetPassword 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword, 
  validateUpdatePreferences 
} = require('../middleware/validation');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.patch('/preferences', authenticate, validateUpdatePreferences, updatePreferences);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

module.exports = router;