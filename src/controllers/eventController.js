const Event = require('../models/Event');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'published' })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

const getEventsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['Music', 'Sports', 'Arts', 'Education', 'Food', 'Tech'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Valid categories are: ' + validCategories.join(', ')
      });
    }

    const events = await Event.find({ 
      category: category,
      status: 'published' 
    })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      category: category,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events by category',
      error: error.message
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('createdBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: populatedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
};

const getPopularEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      isPopular: true,
      status: 'published' 
    })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching popular events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular events',
      error: error.message
    });
  }
};

const getJustForYouEvents = async (req, res) => {
  try {
    const User = require('../models/User');
    let preferenceBasedEvents = [];
    let user = null;

    if (req.user) {
      user = await User.findById(req.user.id);
    }

    if (user && user.preferences && user.preferences.categories && user.preferences.categories.length > 0) {
      const userCategories = user.preferences.categories.map(cat => {
        const categoryMap = {
          'Dance': 'Music',
          'Tech Conference': 'Tech',
          'International Events': 'Music',
          'Festivals': 'Music',
          'Games': 'Sports',
          'Art': 'Arts',
          'House Party': 'Music',
          'Cooking': 'Food',
          'Exhibition': 'Arts',
          'Modelling': 'Arts',
          'Gospel': 'Music',
          'Car Showroom and Drifting': 'Sports'
        };
        return categoryMap[cat] || cat;
      });

      const uniqueCategories = [...new Set(userCategories)];

      preferenceBasedEvents = await Event.find({ 
        category: { $in: uniqueCategories },
        status: 'published' 
      })
        .populate('createdBy', 'firstName lastName email')
        .sort({ rating: -1, attendees: -1, createdAt: -1 });
    }

    if (preferenceBasedEvents.length < 5) {
      const popularEvents = await Event.find({ 
        isPopular: true,
        status: 'published',
        _id: { $nin: preferenceBasedEvents.map(event => event._id) }
      })
        .populate('createdBy', 'firstName lastName email')
        .sort({ rating: -1, attendees: -1, createdAt: -1 });

      preferenceBasedEvents = [...preferenceBasedEvents, ...popularEvents];
    }

    if (preferenceBasedEvents.length < 5) {
      const additionalEvents = await Event.find({ 
        status: 'published',
        _id: { $nin: preferenceBasedEvents.map(event => event._id) }
      })
        .populate('createdBy', 'firstName lastName email')
        .sort({ rating: -1, attendees: -1, createdAt: -1 });

      preferenceBasedEvents = [...preferenceBasedEvents, ...additionalEvents];
    }

    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const shuffledEvents = shuffleArray(preferenceBasedEvents).slice(0, 5);

    res.json({
      success: true,
      count: shuffledEvents.length,
      data: shuffledEvents
    });
  } catch (error) {
    console.error('Error fetching just for you events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching just for you events',
      error: error.message
    });
  }
};

module.exports = {
  getAllEvents,
  getEventsByCategory,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getPopularEvents,
  getJustForYouEvents
};