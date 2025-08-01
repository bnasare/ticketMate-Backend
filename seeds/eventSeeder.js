const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const User = require('../src/models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ticketmate');
    console.log('MongoDB connected for seeding');
    console.log('Connected to:', process.env.MONGODB_URI ? 'Atlas Database' : 'Local Database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const dummyEvents = [
  // Music Events
  {
    title: "Pretty Girls Love Amapiano",
    date: "June 27th",
    time: "1:15 PM - 4:50 AM",
    location: "Accra",
    venue: "NO.5 Bar And Restaurant",
    price: "GH₵950",
    rating: "4.8",
    attendees: "4000+",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop",
    category: "Music",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/32.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
      "https://randomuser.me/api/portraits/men/54.jpg"
    ],
    tickets: [
      { type: "Regular", price: "GH₵950", description: "Standard entry", available: true },
      { type: "VIP", price: "GH₵1500", description: "VIP access with perks", available: true }
    ],
    description: "Pretty Girls Love Amapiano is a music and dance event organised by the party invasion team of Ghana. With DJ Williamo serving as the DJ and Arnold the MC.",
    organizer: {
      name: "AfroNation Events",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "2.5K",
      events: "12"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    title: "Reggae Night Live",
    date: "August 15th",
    time: "7:00 PM - 11:30 PM",
    location: "Accra",
    venue: "Marina Mall",
    price: "GH₵850",
    rating: "4.6",
    attendees: "1200+",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    category: "Music",
    isPopular: false,
    attendeeImages: [
      "https://randomuser.me/api/portraits/women/65.jpg",
      "https://randomuser.me/api/portraits/men/76.jpg"
    ],
    tickets: [
      { type: "General", price: "GH₵850", description: "General admission", available: true },
      { type: "VIP", price: "GH₵1200", description: "VIP experience", available: true }
    ],
    description: "Experience the best of reggae music with live performances from top reggae artists in Ghana.",
    organizer: {
      name: "Reggae Ghana",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "1.8K",
      events: "8"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    title: "Hip Hop Cypher",
    date: "July 20th",
    time: "8:00 PM - 12:00 AM",
    location: "Accra",
    venue: "Accra Hip Hop Center",
    price: "GH₵650",
    rating: "4.4",
    attendees: "800+",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=300&fit=crop",
    category: "Music",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/11.jpg",
      "https://randomuser.me/api/portraits/women/22.jpg"
    ],
    tickets: [
      { type: "Entry", price: "GH₵650", description: "Event entry", available: true }
    ],
    description: "The biggest hip hop cypher event featuring the best rappers from across Ghana.",
    organizer: {
      name: "Ghana Hip Hop",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "3.2K",
      events: "15"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },

  // Sports Events
  {
    title: "Football Training Camp",
    date: "July 25th",
    time: "6:00 AM - 9:00 AM",
    location: "Accra",
    venue: "Accra Sports Complex",
    price: "GH₵400",
    rating: "4.7",
    attendees: "150+",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    category: "Sports",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/44.jpg",
      "https://randomuser.me/api/portraits/men/55.jpg"
    ],
    tickets: [
      { type: "Training", price: "GH₵400", description: "Full training session", available: true }
    ],
    description: "Professional football training camp for aspiring players of all ages and skill levels.",
    organizer: {
      name: "Ghana Football Academy",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "5.1K",
      events: "25"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    title: "Basketball Skills Workshop",
    date: "July 30th",
    time: "4:00 PM - 7:00 PM",
    location: "Kumasi",
    venue: "Kumasi Basketball Court",
    price: "GH₵350",
    rating: "4.5",
    attendees: "80+",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop",
    category: "Sports",
    isPopular: false,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/33.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg"
    ],
    tickets: [
      { type: "Workshop", price: "GH₵350", description: "Skills training", available: true }
    ],
    description: "Learn basketball fundamentals and advanced techniques from professional coaches.",
    organizer: {
      name: "Ghana Basketball",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "2.3K",
      events: "18"
    },
    coordinates: {
      latitude: 6.6885,
      longitude: -1.6244
    }
  },

  // Arts Events
  {
    title: "Paint & Sip Night",
    date: "July 22nd",
    time: "7:00 PM - 10:00 PM",
    location: "Accra",
    venue: "Accra Art Studio",
    price: "GH₵300",
    rating: "4.8",
    attendees: "60+",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: "Arts",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/women/77.jpg",
      "https://randomuser.me/api/portraits/men/88.jpg"
    ],
    tickets: [
      { type: "Entry", price: "GH₵300", description: "Includes materials", available: true }
    ],
    description: "Relaxing evening of painting while enjoying your favorite drinks with friends.",
    organizer: {
      name: "Creative Ghana",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "1.5K",
      events: "12"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    title: "Digital Art Masterclass",
    date: "July 29th",
    time: "10:00 AM - 4:00 PM",
    location: "Accra",
    venue: "Accra Tech Hub",
    price: "GH₵450",
    rating: "4.9",
    attendees: "40+",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    category: "Arts",
    isPopular: false,
    attendeeImages: [
      "https://randomuser.me/api/portraits/women/12.jpg",
      "https://randomuser.me/api/portraits/men/23.jpg"
    ],
    tickets: [
      { type: "Masterclass", price: "GH₵450", description: "Full day session", available: true }
    ],
    description: "Learn digital art techniques from professional digital artists and illustrators.",
    organizer: {
      name: "Digital Artists Ghana",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "2.8K",
      events: "20"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },

  // Education Events
  {
    title: "Public Speaking Workshop",
    date: "July 24th",
    time: "9:00 AM - 3:00 PM",
    location: "Accra",
    venue: "Accra Business School",
    price: "GH₵500",
    rating: "4.7",
    attendees: "120+",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
    category: "Education",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/45.jpg",
      "https://randomuser.me/api/portraits/women/56.jpg"
    ],
    tickets: [
      { type: "Workshop", price: "GH₵500", description: "Full day training", available: true }
    ],
    description: "Develop confidence and skills in public speaking with expert trainers.",
    organizer: {
      name: "Toastmasters Ghana",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "4.2K",
      events: "35"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    title: "Entrepreneurship Summit",
    date: "July 31st",
    time: "8:00 AM - 6:00 PM",
    location: "Accra",
    venue: "Accra Conference Center",
    price: "GH₵800",
    rating: "4.8",
    attendees: "300+",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop",
    category: "Education",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/women/78.jpg",
      "https://randomuser.me/api/portraits/men/89.jpg"
    ],
    tickets: [
      { type: "Summit", price: "GH₵800", description: "Full summit access", available: true },
      { type: "VIP", price: "GH₵1200", description: "VIP networking access", available: true }
    ],
    description: "Connect with successful entrepreneurs and learn strategies for building successful businesses.",
    organizer: {
      name: "Ghana Entrepreneurs",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "8.5K",
      events: "45"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },

  // Food Events
  {
    title: "Wine Tasting Experience",
    date: "July 23rd",
    time: "6:00 PM - 9:00 PM",
    location: "Accra",
    venue: "Accra Wine Bar",
    price: "GH₵600",
    rating: "4.6",
    attendees: "45+",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    category: "Food",
    isPopular: false,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/13.jpg",
      "https://randomuser.me/api/portraits/women/24.jpg"
    ],
    tickets: [
      { type: "Tasting", price: "GH₵600", description: "Wine tasting session", available: true }
    ],
    description: "Sample exquisite wines from around the world with expert sommelier guidance.",
    organizer: {
      name: "Ghana Wine Club",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "1.2K",
      events: "15"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    title: "Chocolate Making Class",
    date: "July 25th",
    time: "3:00 PM - 6:00 PM",
    location: "Kumasi",
    venue: "Kumasi Chocolate Factory",
    price: "GH₵400",
    rating: "4.9",
    attendees: "25+",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "Food",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/women/46.jpg",
      "https://randomuser.me/api/portraits/men/57.jpg"
    ],
    tickets: [
      { type: "Class", price: "GH₵400", description: "Hands-on chocolate making", available: true }
    ],
    description: "Learn the art of chocolate making from bean to bar with professional chocolatiers.",
    organizer: {
      name: "Ghana Chocolate",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "2.1K",
      events: "22"
    },
    coordinates: {
      latitude: 6.6885,
      longitude: -1.6244
    }
  },

  // Tech Events
  {
    title: "Blockchain Workshop",
    date: "July 24th",
    time: "9:00 AM - 5:00 PM",
    location: "Accra",
    venue: "Accra Tech Hub",
    price: "GH₵700",
    rating: "4.8",
    attendees: "85+",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
    category: "Tech",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/79.jpg",
      "https://randomuser.me/api/portraits/women/80.jpg"
    ],
    tickets: [
      { type: "Workshop", price: "GH₵700", description: "Full day workshop", available: true }
    ],
    description: "Comprehensive introduction to blockchain technology and cryptocurrency development.",
    organizer: {
      name: "Ghana Blockchain",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "3.5K",
      events: "28"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  },
  {
    title: "AI & Machine Learning Summit",
    date: "August 5th",
    time: "9:00 AM - 6:00 PM",
    location: "Accra",
    venue: "Accra Conference Center",
    price: "GH₵900",
    rating: "4.9",
    attendees: "200+",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop",
    category: "Tech",
    isPopular: true,
    attendeeImages: [
      "https://randomuser.me/api/portraits/men/14.jpg",
      "https://randomuser.me/api/portraits/women/25.jpg"
    ],
    tickets: [
      { type: "Summit", price: "GH₵900", description: "Full summit access", available: true },
      { type: "VIP", price: "GH₵1400", description: "VIP with networking", available: true }
    ],
    description: "Explore the future of AI and machine learning with industry experts and thought leaders.",
    organizer: {
      name: "Ghana AI Society",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      isVerified: true,
      followers: "6.8K",
      events: "32"
    },
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870
    }
  }
];

const seedEvents = async () => {
  try {
    await connectDB();

    // Find a user to assign as creator (or create a default one)
    let defaultUser = await User.findOne({ email: 'admin@ticketmate.com' });
    
    if (!defaultUser) {
      console.log('Creating default admin user...');
      defaultUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@ticketmate.com',
        password: 'password123',
        username: 'admin',
        role: 'admin',
        isVerified: true
      });
      await defaultUser.save();
      console.log('Default admin user created');
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Add createdBy to each event
    const eventsWithCreator = dummyEvents.map(event => ({
      ...event,
      createdBy: defaultUser._id
    }));

    // Insert dummy events
    const createdEvents = await Event.insertMany(eventsWithCreator);
    console.log(`✅ Successfully seeded ${createdEvents.length} events to the database`);

    // Show breakdown by category
    const categories = ['Music', 'Sports', 'Arts', 'Education', 'Food', 'Tech'];
    for (const category of categories) {
      const count = createdEvents.filter(event => event.category === category).length;
      console.log(`   - ${category}: ${count} events`);
    }

    console.log('\n📍 Available endpoints:');
    console.log('   GET /api/events - Get all events');
    console.log('   GET /api/events/popular - Get popular events');
    console.log('   GET /api/events/category/:category - Get events by category');
    console.log('   GET /api/events/:id - Get event by ID');
    console.log('\n🎯 Example category endpoints:');
    categories.forEach(cat => {
      console.log(`   GET /api/events/category/${cat}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();