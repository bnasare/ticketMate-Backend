const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate: auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getBookingHistory,
  getBookingDetails
} = require('../controllers/paymentController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - type
 *         - quantity
 *       properties:
 *         type:
 *           type: string
 *           enum: [regular, vip, Regular, VIP]
 *           description: Type of ticket
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Number of tickets
 *         includesFriends:
 *           type: boolean
 *           description: Whether to include tickets for friends
 *     
 *     PaymentInitialization:
 *       type: object
 *       required:
 *         - eventId
 *         - tickets
 *         - paymentMethod
 *         - customerEmail
 *         - customerName
 *       properties:
 *         eventId:
 *           type: string
 *           description: ID of the event
 *         tickets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ticket'
 *         paymentMethod:
 *           type: string
 *           enum: [mobile_money, card, bank_transfer]
 *         customerEmail:
 *           type: string
 *           format: email
 *         customerName:
 *           type: string
 *         customerPhone:
 *           type: string
 *     
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         event:
 *           type: object
 *         tickets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ticket'
 *         totalAmount:
 *           type: number
 *         totalTickets:
 *           type: integer
 *         paymentReference:
 *           type: string
 *         paymentStatus:
 *           type: string
 *           enum: [pending, success, failed, cancelled, refunded]
 *         paymentMethod:
 *           type: string
 *         customerEmail:
 *           type: string
 *         customerName:
 *           type: string
 *         bookingDate:
 *           type: string
 *           format: date-time
 *         paymentDate:
 *           type: string
 *           format: date-time
 *         ticketNumbers:
 *           type: array
 *           items:
 *             type: string
 *         qrCode:
 *           type: string
 */

/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize payment for ticket purchase
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInitialization'
 *           example:
 *             eventId: "507f1f77bcf86cd799439011"
 *             tickets:
 *               - type: "regular"
 *                 quantity: 2
 *                 includesFriends: false
 *               - type: "vip"
 *                 quantity: 1
 *                 includesFriends: true
 *             paymentMethod: "mobile_money"
 *             customerEmail: "customer@example.com"
 *             customerName: "John Doe"
 *             customerPhone: "+233123456789"
 *     responses:
 *       200:
 *         description: Payment initialized successfully
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
 *                     bookingId:
 *                       type: string
 *                     reference:
 *                       type: string
 *                     paystackReference:
 *                       type: string
 *                     authorizationUrl:
 *                       type: string
 *                     accessCode:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     totalTickets:
 *                       type: integer
 *       400:
 *         description: Bad request - validation errors
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/initialize',
  auth,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('tickets').isArray({ min: 1 }).withMessage('At least one ticket is required'),
    body('tickets.*.type').isIn(['regular', 'vip', 'Regular', 'VIP']).withMessage('Ticket type must be regular, vip, Regular, or VIP'),
    body('tickets.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod').isIn(['card', 'bank', 'mobile_money', 'bank_transfer', 'ussd', 'qr', 'eft']).withMessage('Invalid payment method'),
    body('customerEmail').isEmail().withMessage('Valid email is required'),
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerPhone').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  handleValidationErrors,
  initializePayment
);

/**
 * @swagger
 * /api/payments/verify/{reference}:
 *   get:
 *     summary: Verify payment status
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference
 *     responses:
 *       200:
 *         description: Payment verification result
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
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: string
 *                     qrCode:
 *                       type: string
 *       404:
 *         description: Booking not found
 *       400:
 *         description: Payment verification failed
 *       500:
 *         description: Internal server error
 */
router.get('/verify/:reference', verifyPayment);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle Paystack webhook notifications
 *     tags: [Payments]
 *     description: This endpoint receives webhook notifications from Paystack
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 *       500:
 *         description: Webhook processing failed
 */
router.post('/webhook', handleWebhook);

/**
 * @swagger
 * /api/payments/bookings:
 *   get:
 *     summary: Get user's booking history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of bookings per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, cancelled, refunded]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Booking history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalBookings:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/bookings', auth, getBookingHistory);

/**
 * @swagger
 * /api/payments/bookings/{bookingId}:
 *   get:
 *     summary: Get specific booking details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: string
 *                     qrCode:
 *                       type: string
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get('/bookings/:bookingId', auth, getBookingDetails);

module.exports = router;