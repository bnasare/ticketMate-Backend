const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  date: {
    type: String,
    required: [true, 'Event date is required'],
    trim: true
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true
  },
  price: {
    type: String,
    required: [true, 'Event price is required'],
    trim: true
  },
  rating: {
    type: String,
    default: "4.0"
  },
  attendees: {
    type: String,
    default: "0+"
  },
  image: {
    type: String,
    required: [true, 'Event image is required']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['Music', 'Sports', 'Arts', 'Education', 'Food', 'Tech']
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  attendeeImages: [{
    type: String
  }],
  tickets: [{
    type: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  organizer: {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    followers: {
      type: String,
      default: "0"
    },
    events: {
      type: String,
      default: "0"
    }
  },
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'published'
  }
}, {
  timestamps: true
});

eventSchema.index({ category: 1 });
eventSchema.index({ isPopular: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);