const paystackService = require('../services/paystackService');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');

const initializePayment = async (req, res) => {
  console.log('=== PAYMENT INITIALIZATION STARTED ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Auth header:', req.headers.authorization);
  console.log('User object:', req.user);
  
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

    console.log('=== EVENT DEBUG INFO ===');
    console.log('Event ID:', eventId);
    console.log('Event title:', event.title);
    console.log('Event tickets:', JSON.stringify(event.tickets, null, 2));
    console.log('Number of tickets in event:', event.tickets ? event.tickets.length : 0);
    console.log('=== END EVENT DEBUG INFO ===');

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

      console.log('=== TICKET MATCHING DEBUG ===');
      console.log('Looking for ticket type:', ticket.type);
      console.log('Available ticket types:', event.tickets ? event.tickets.map(t => t.type) : 'No tickets array');
      console.log('Event tickets array:', event.tickets);
      console.log('Doing case-insensitive comparison...');
      
      // More flexible ticket matching - try multiple approaches
      let eventTicket = null;
      
      if (event.tickets && Array.isArray(event.tickets)) {
        // First try exact case-insensitive match
        eventTicket = event.tickets.find(t => {
          const match = t.type && t.type.toLowerCase() === ticket.type.toLowerCase();
          console.log(`Comparing "${t.type}" (${t.type?.toLowerCase()}) === "${ticket.type}" (${ticket.type.toLowerCase()}): ${match}`);
          return match;
        });
        
        // If no match, try partial matching
        if (!eventTicket) {
          console.log('Exact match failed, trying partial matching...');
          eventTicket = event.tickets.find(t => {
            if (!t.type) return false;
            const eventTypeNormalized = t.type.toLowerCase().trim();
            const requestTypeNormalized = ticket.type.toLowerCase().trim();
            const partialMatch = eventTypeNormalized.includes(requestTypeNormalized) || 
                               requestTypeNormalized.includes(eventTypeNormalized);
            console.log(`Partial match "${eventTypeNormalized}" vs "${requestTypeNormalized}": ${partialMatch}`);
            return partialMatch;
          });
        }
        
        // If still no match, try first ticket as fallback for "regular" type
        if (!eventTicket && ticket.type.toLowerCase().includes('regular') && event.tickets.length > 0) {
          console.log('No match found, using first ticket as fallback for regular type');
          eventTicket = event.tickets[0];
        }
      }
      
      console.log('Found matching ticket:', eventTicket ? 'YES' : 'NO');
      if (eventTicket) {
        console.log('Matched ticket:', eventTicket);
      }
      console.log('=== END TICKET MATCHING DEBUG ===');
      
      if (!eventTicket) {
        return res.status(400).json({
          success: false,
          message: `Ticket type "${ticket.type}" not found for this event. Available types: ${event.tickets ? event.tickets.map(t => t.type).join(', ') : 'none'}`
        });
      }

      // Better price parsing that handles "Free" tickets explicitly
      let ticketPrice = 0;
      if (eventTicket.price && eventTicket.price.toLowerCase().includes('free')) {
        ticketPrice = 0;
      } else {
        const numericPart = eventTicket.price.replace(/[^\d.]/g, '');
        ticketPrice = numericPart ? parseFloat(numericPart) : 0;
      }
      const ticketTotal = ticketPrice * ticket.quantity;
      
      console.log('=== TICKET PRICE DEBUG ===');
      console.log('Original price string:', eventTicket.price);
      console.log('Parsed price:', ticketPrice);
      console.log('Ticket quantity:', ticket.quantity);
      console.log('Ticket total:', ticketTotal);
      console.log('=== END TICKET PRICE DEBUG ===');
      
      totalAmount += ticketTotal;
      totalTickets += ticket.quantity;
      
      processedTickets.push({
        type: ticket.type.toLowerCase(),
        quantity: ticket.quantity,
        price: ticketPrice,
        includesFriends: ticket.includesFriends || false
      });
    }

    console.log('=== TOTAL AMOUNT CHECK ===');
    console.log('Total amount:', totalAmount);
    console.log('Total tickets:', totalTickets);
    console.log('Is free tickets:', totalAmount === 0);
    console.log('=== END AMOUNT CHECK ===');

    // Handle free tickets - don't process payment through Paystack
    if (totalAmount === 0) {
      const paymentReference = paystackService.generateReference();
      
      if (!req.user || (!req.user._id && !req.user.id)) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required - user not found'
        });
      }
      
      const userId = req.user._id || req.user.id;
      const booking = new Booking({
        user: req.user._id,
        event: eventId,
        tickets: processedTickets,
        totalAmount,
        totalTickets,
        paymentReference,
        paymentMethod: 'free',
        customerEmail,
        customerName,
        customerPhone,
        paymentStatus: 'success',
        paymentDate: new Date()
      });

      booking.generateTicketNumbers();
      booking.generateQRCode();
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Free tickets booked successfully',
        data: {
          userId: req.user._id,
          bookingId: booking._id,
          reference: paymentReference,
          totalAmount: totalAmount,
          totalTickets: totalTickets,
          tickets: booking.ticketNumbers,
          qrCode: booking.qrCode,
          event: {
            id: event._id,
            title: event.title,
            date: event.date,
            venue: event.venue
          }
        }
      });
    }

    const paymentReference = paystackService.generateReference();
    
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required - user not found'
      });
    }
    
    const userId = req.user._id || req.user.id;
    const booking = new Booking({
      user: req.user._id,
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

    // const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/callback`;
    
    const transactionData = {
      email: customerEmail,
      amount: totalAmount,
      reference: paymentReference,
      // callback_url: callbackUrl,
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

    console.log('=== PAYSTACK TRANSACTION DATA ===');
    console.log('Transaction data:', JSON.stringify(transactionData, null, 2));
    console.log('=== END TRANSACTION DATA ===');
    
    const paystackResponse = await paystackService.initializeTransaction(transactionData);

    if (paystackResponse.status) {
      booking.paystackReference = paystackResponse.data.reference;
      await booking.save();

      res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          userId: req.user._id,
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
    console.error('=== PAYMENT INITIALIZATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('=== END ERROR DEBUG ===');
    
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
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