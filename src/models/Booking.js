const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  tickets: [{
    type: {
      type: String,
      enum: ['regular', 'vip'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    includesFriends: {
      type: Boolean,
      default: false
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  totalTickets: {
    type: Number,
    required: true
  },
  paymentReference: {
    type: String,
    required: true,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['mobile_money', 'card', 'bank_transfer'],
    required: true
  },
  paystackReference: {
    type: String,
    unique: true,
    sparse: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  paymentDate: {
    type: Date
  },
  qrCode: {
    type: String
  },
  ticketNumbers: [{
    type: String
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ paymentReference: 1 });
bookingSchema.index({ paystackReference: 1 });
bookingSchema.index({ paymentStatus: 1 });

bookingSchema.methods.generateTicketNumbers = function() {
  const numbers = [];
  const prefix = this.event.toString().substring(0, 6).toUpperCase();
  
  for (let i = 0; i < this.totalTickets; i++) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().substring(-6);
    numbers.push(`${prefix}-${timestamp}-${random}`);
  }
  
  this.ticketNumbers = numbers;
  return numbers;
};

bookingSchema.methods.generateQRCode = function() {
  const qrData = {
    bookingId: this._id,
    eventId: this.event,
    reference: this.paymentReference,
    tickets: this.totalTickets,
    ticketNumbers: this.ticketNumbers
  };
  
  this.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');
  return this.qrCode;
};

module.exports = mongoose.model('Booking', bookingSchema);