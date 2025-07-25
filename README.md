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
- `PUT /profile` - Update user profile (protected)
- `PATCH /preferences` - Update user preferences after onboarding (protected)
- `POST /logout` - Logout user (protected)
- `POST /forgot-password` - Send password reset email
- `POST /reset-password` - Reset password with token

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
PUT /api/auth/profile
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

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── validation.js       # Input validation middleware
│   ├── models/
│   │   └── User.js             # User schema
│   ├── routes/
│   │   └── auth.js             # Auth routes
│   ├── utils/
│   │   └── jwt.js              # JWT utilities
│   └── server.js               # Express server setup
├── tests/                      # Test files (to be implemented)
├── .env                        # Environment variables
├── .gitignore                  # Git ignore file
└── package.json               # Node.js dependencies
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

- Implement event management endpoints
- Add email verification
- Add password reset functionality
- Implement file upload for profile images
- Add comprehensive testing
- Add API documentation with Swagger
```