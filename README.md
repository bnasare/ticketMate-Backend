# TicketMate Backend API

Node.js backend server for the TicketMate event discovery and ticketing application.

## Features

- **User Authentication**: Complete registration and login system
- **User Onboarding**: Multi-step preference collection (categories, age, personality, role)
- **Profile Management**: Update user information and preferences
- **JWT Authorization**: Secure token-based authentication
- **MongoDB Integration**: Robust data persistence with Mongoose
- **Input Validation**: Comprehensive request validation and sanitization
- **Security Middleware**: Rate limiting, CORS, helmet protection
- **Event Personalization**: Category-based event recommendations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` file with your configuration:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Server port (default: 3001)

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (protected)
- `PATCH /profile` - Update user profile (protected)
- `PATCH /preferences` - Update user preferences after onboarding (protected)
- `POST /logout` - Logout user (protected)
- `POST /forgot-password` - Send password reset email
- `POST /reset-password` - Reset password with token

### Event Routes (`/api/events`)

- `GET /` - Get all published events
- `GET /popular` - Get popular events
- `GET /category/:category` - Get events by category (Music, Sports, Arts, Education, Food, Tech)
- `GET /just-for-you` - Get personalized events based on user preferences (protected)
- `GET /:id` - Get specific event by ID
- `POST /` - Create new event (protected)
- `PATCH /:id` - Update event (protected, owner/admin only)
- `DELETE /:id` - Delete event (protected, owner/admin only)

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Paapa",
  "lastName": "Cobbold",
  "username": "PaapaC",
  "email": "paapa@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+233123456789",
  "gender": "male"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "paapa@example.com",
  "password": "SecurePass123"
}
```

#### Update User Preferences (After Onboarding)
```bash
PATCH /api/auth/preferences
Content-Type: application/json
Authorization: Bearer <token>

{
  "categories": ["Music", "Sports", "Tech Conference"],
  "ageRange": "21-25",
  "personality": "Extrovert",
  "role": "Event Attendee",
  "priceRange": {
    "min": 50,
    "max": 500
  }
}
```

#### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "paapa@example.com"
}

# Response includes:
{
  "success": true,
  "message": "Password reset token generated successfully",
  "data": {
    "resetToken": "abc123...",
    "resetUrl": "http://localhost:3000/reset-password?token=abc123...",
    "mailtoLink": "mailto:user@example.com?subject=...",
    "email": "user@example.com",
    "expiresIn": "10 minutes"
  }
}
```

#### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456...",
  "newPassword": "NewSecurePass123"
}
```

#### Update User Profile
```bash
PATCH /api/auth/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Paapa",
  "lastName": "Cobbold",
  "phoneNumber": "+233987654321",
  "location": "KNUST, Kumasi",
  "isOnline": true
}
```

#### Create Event
```bash
POST /api/events
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "KNUST Tech Conference 2024",
  "description": "Annual technology conference featuring the latest innovations",
  "category": "Tech",
  "date": "2024-12-15T09:00:00.000Z",
  "time": "09:00",
  "location": "KNUST Great Hall",
  "price": 50,
  "maxAttendees": 500,
  "isPopular": false,
  "status": "published"
}
```

#### Get Events by Category
```bash
GET /api/events/category/Music
```

#### Get Just For You Events (Personalized)
```bash
GET /api/events/just-for-you
Authorization: Bearer <token>
```

#### Update Event
```bash
PATCH /api/events/507f1f77bcf86cd799439012
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Event Title",
  "price": 75,
  "maxAttendees": 600
}
```

## Swagger Documentation

Interactive API documentation is available at `/api-docs` when the server is running:
- **Local**: http://localhost:3001/api-docs
- Complete API reference with request/response schemas
- Try out endpoints directly from the browser

## Current Status

✅ **Working Features:**
- User registration and authentication
- JWT token-based authorization  
- User profile management and preferences
- Password reset functionality
- Event CRUD operations
- Event filtering by category
- Popular events endpoint
- Personalized event recommendations
- MongoDB database integration
- Swagger API documentation
- Security middleware (helmet, cors, rate limiting)

## Project Structure

```
backend/
├── docs/                       # Generated API documentation
│   ├── API_DOCUMENTATION.md   
│   ├── api-docs.html
│   └── swagger.json
├── scripts/
│   └── generate-docs.js        # Documentation generator
├── seeds/
│   └── eventSeeder.js          # Database seeding
├── src/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── swagger.js          # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   └── eventController.js  # Event management logic
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── validation.js      # Input validation middleware
│   ├── models/
│   │   ├── User.js            # User schema with preferences
│   │   └── Event.js           # Event schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── events.js          # Event routes
│   ├── utils/
│   │   └── jwt.js             # JWT utilities
│   └── server.js              # Express server setup
├── tests/                     # Test files (to be implemented)
├── .env                       # Environment variables
├── .gitignore                 # Git ignore file
└── package.json              # Node.js dependencies
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet.js security headers
- Environment-based configurations

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

### Database Schema

The User model includes:
- **Personal Information**: firstName, lastName, username, email, gender
- **Authentication**: password, verification status, role permissions
- **Profile Data**: phoneNumber, profileImage, location, isOnline status
- **User Preferences**: 
  - categories (event types from onboarding)
  - ageRange (10-15, 16-20, 21-25, 25-30, 30-35, 36+)
  - personality (Extrovert, Introvert, Ambivert)
  - role (Event Creator, Event Attendee)
  - priceRange (min/max budget)
- **Security Tokens**: reset password, email verification

### Supported Event Categories
Dance, Tech Conference, Music, International Events, Festivals, Games, Sports, Education, Art, House Party, Cooking, Exhibition, Modelling, Gospel, Car Showroom and Drifting

## Environment Variables

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ticketmate
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Next Steps

- ✅ ~~Implement event management endpoints~~ **COMPLETED**
- ✅ ~~Add password reset functionality~~ **COMPLETED**  
- ✅ ~~Add API documentation with Swagger~~ **COMPLETED**
- Add email verification for user registration
- Implement file upload for profile images
- Add comprehensive testing suite
- Add event image upload functionality
- Implement event booking/ticketing system
- Add event search and filtering
- Add real-time notifications
- Implement event analytics and reporting