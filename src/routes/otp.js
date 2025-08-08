const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const {
  sendOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/otpController');

/**
 * @swagger
 * components:
 *   schemas:
 *     OTPRequest:
 *       type: object
 *       required:
 *         - phoneNumber
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: Phone number in Ghana format
 *         purpose:
 *           type: string
 *           enum: [signup, login, password_reset]
 *           default: signup
 *     
 *     OTPVerification:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - otp
 *       properties:
 *         phoneNumber:
 *           type: string
 *           description: Phone number in Ghana format
 *         otp:
 *           type: string
 *           description: 6-digit OTP code
 *         purpose:
 *           type: string
 *           enum: [signup, login, password_reset]
 *           default: signup
 */

/**
 * @swagger
 * /api/otp/send:
 *   post:
 *     summary: Send OTP via SMS
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *           example:
 *             phoneNumber: "0244123456"
 *             purpose: "signup"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '/send',
  [
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('purpose').optional().isIn(['signup', 'login', 'password_reset']).withMessage('Invalid purpose')
  ],
  handleValidationErrors,
  sendOTP
);

/**
 * @swagger
 * /api/otp/verify:
 *   post:
 *     summary: Verify OTP code
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPVerification'
 *           example:
 *             phoneNumber: "0244123456"
 *             otp: "123456"
 *             purpose: "signup"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */
router.post(
  '/verify',
  [
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('purpose').optional().isIn(['signup', 'login', 'password_reset']).withMessage('Invalid purpose')
  ],
  handleValidationErrors,
  verifyOTP
);

/**
 * @swagger
 * /api/otp/resend:
 *   post:
 *     summary: Resend OTP code
 *     tags: [OTP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OTPRequest'
 *           example:
 *             phoneNumber: "0244123456"
 *             purpose: "signup"
 *     responses:
 *       200:
 *         description: New OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
  '/resend',
  [
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('purpose').optional().isIn(['signup', 'login', 'password_reset']).withMessage('Invalid purpose')
  ],
  handleValidationErrors,
  resendOTP
);

module.exports = router;