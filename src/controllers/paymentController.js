const paystackService = require('../services/paystackService');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');

const initializePayment = async (req, res) => {
  try {
    const {
      eventId,
      tickets,
      paymentMethod,
      customerEmail,
      customerName,
      customerPhone
    } = req.body;

    if (!eventId || !tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and tickets array are required'
      });
    }

    if (!customerEmail || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Customer email and name are required'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    let totalAmount = 0;
    let totalTickets = 0;
    const processedTickets = [];

    for (const ticket of tickets) {
      if (!ticket.type || !ticket.quantity || ticket.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each ticket must have type and valid quantity'
        });
      }

      const eventTicket = event.tickets.find(t => t.type.toLowerCase() === ticket.type.toLowerCase());
      if (!eventTicket) {
        return res.status(400).json({
          success: false,
          message: `Ticket type "${ticket.type}" not found for this event`
        });
      }

      const ticketPrice = parseFloat(eventTicket.price.replace(/[^\d.]/g, ''));
      const ticketTotal = ticketPrice * ticket.quantity;
      
      totalAmount += ticketTotal;
      totalTickets += ticket.quantity;
      
      processedTickets.push({
        type: ticket.type.toLowerCase(),
        quantity: ticket.quantity,
        price: ticketPrice,
        includesFriends: ticket.includesFriends || false
      });
    }

    const paymentReference = paystackService.generateReference();
    
    const booking = new Booking({
      user: req.user?.id,
      event: eventId,
      tickets: processedTickets,
      totalAmount,
      totalTickets,
      paymentReference,
      paymentMethod,
      customerEmail,
      customerName,
      customerPhone,
      paymentStatus: 'pending'
    });

    await booking.save();

    const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`;
    
    const transactionData = {
      email: customerEmail,
      amount: totalAmount,
      reference: paymentReference,
      callback_url: callbackUrl,
      metadata: {
        bookingId: booking._id.toString(),
        eventId: eventId,
        eventTitle: event.title,
        totalTickets: totalTickets,
        customerName: customerName,
        customerPhone: customerPhone || '',
        tickets: processedTickets
      }
    };

    const paystackResponse = await paystackService.initializeTransaction(transactionData);

    if (paystackResponse.status) {
      booking.paystackReference = paystackResponse.data.reference;
      await booking.save();

      res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          bookingId: booking._id,
          reference: paymentReference,
          paystackReference: paystackResponse.data.reference,
          authorizationUrl: paystackResponse.data.authorization_url,
          accessCode: paystackResponse.data.access_code,
          totalAmount: totalAmount,
          totalTickets: totalTickets,
          event: {
            id: event._id,
            title: event.title,
            date: event.date,
            venue: event.venue
          }
        }
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();
      
      res.status(400).json({
        success: false,
        message: paystackResponse.message || 'Failed to initialize payment'
      });
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    const booking = await Booking.findOne({ 
      paymentReference: reference 
    }).populate('event').populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.paymentStatus === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: {
          booking,
          tickets: booking.ticketNumbers,
          qrCode: booking.qrCode
        }
      });
    }

    const verification = await paystackService.verifyTransaction(booking.paystackReference || reference);

    if (verification.status && verification.data.status === 'success') {
      booking.paymentStatus = 'success';
      booking.paymentDate = new Date();
      booking.generateTicketNumbers();
      booking.generateQRCode();
      
      await booking.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          booking: {
            id: booking._id,
            reference: booking.paymentReference,
            status: booking.paymentStatus,
            totalAmount: booking.totalAmount,
            totalTickets: booking.totalTickets,
            paymentDate: booking.paymentDate,
            event: booking.event
          },
          tickets: booking.ticketNumbers,
          qrCode: booking.qrCode
        }
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();

      res.status(400).json({
        success: false,
        message: verification.data?.gateway_response || 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    
    if (!paystackService.verifyWebhookSignature(req.body, signature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body;
    
    if (event.event === 'charge.success') {
      const { reference } = event.data;
      
      const booking = await Booking.findOne({
        $or: [
          { paymentReference: reference },
          { paystackReference: reference }
        ]
      });

      if (booking && booking.paymentStatus === 'pending') {
        booking.paymentStatus = 'success';
        booking.paymentDate = new Date();
        booking.generateTicketNumbers();
        booking.generateQRCode();
        
        await booking.save();
        
        console.log(`Payment confirmed via webhook: ${reference}`);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

const getBookingHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const query = { user: userId };
    if (status) {
      query.paymentStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('event', 'title date venue location image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBookings: total
      }
    });

  } catch (error) {
    console.error('Booking history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;

    const booking = await Booking.findOne({
      _id: bookingId,
      ...(userId && { user: userId })
    }).populate('event').populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        booking,
        tickets: booking.ticketNumbers,
        qrCode: booking.qrCode
      }
    });

  } catch (error) {
    console.error('Booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getBookingHistory,
  getBookingDetails
};