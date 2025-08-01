# 🎫 TicketMate API Documentation

## Overview
Complete API documentation for the TicketMate event management platform. This RESTful API provides endpoints for event management, user authentication, and profile management.

## 🚀 Base URLs
- **Production**: `https://ticketmate-backend.onrender.com`
- **Development**: `http://localhost:3001`

## 🔐 Authentication
The API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

## 📊 Response Format
All API responses follow a consistent format:
```json
{
  "success": true,
  "message": "Description of the action",
  "data": { /* Response data */ }
}
```

## 📂 Event Categories
Available categories: **Music**, **Sports**, **Arts**, **Education**, **Food**, **Tech**

---

## 🎉 Event Endpoints

### Get All Events
```http
GET /api/events
```
Returns all published events.

**Response Example:**
```json
{
  "success": true,
  "count": 13,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Pretty Girls Love Amapiano",
      "date": "June 27th",
      "time": "1:15 PM - 4:50 AM",
      "location": "Accra",
      "venue": "NO.5 Bar And Restaurant",
      "price": "GH₵950",
      "category": "Music",
      "isPopular": true,
      "description": "Pretty Girls Love Amapiano is a music and dance event...",
      "organizer": {
        "name": "AfroNation Events",
        "isVerified": true
      }
    }
  ]
}
```

### Get Popular Events
```http
GET /api/events/popular
```
Returns events marked as popular.

### Get Events by Category
```http
GET /api/events/category/{category}
```
Returns events in a specific category.

**Parameters:**
- `category` (path): One of `Music`, `Sports`, `Arts`, `Education`, `Food`, `Tech`

**Example:**
```http
GET /api/events/category/Music
```

### Get Event by ID
```http
GET /api/events/{id}
```
Returns a specific event by its ID.

### Create Event (Auth Required)
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Amazing Music Festival",
  "date": "December 25th",
  "time": "7:00 PM - 11:00 PM", 
  "location": "Accra",
  "venue": "National Theatre",
  "price": "GH₵500",
  "image": "https://example.com/event-image.jpg",
  "category": "Music",
  "description": "A fantastic music event with top artists",
  "organizer": {
    "name": "Event Organizers Ghana",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### Update Event (Auth Required)
```http
PUT /api/events/{id}
Authorization: Bearer {token}
```
Update an existing event (only by owner or admin).

### Delete Event (Auth Required)
```http
DELETE /api/events/{id}
Authorization: Bearer {token}
```
Delete an event (only by owner or admin).

---

## 👤 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phoneNumber": "+233244123456",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* User object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailOrUsername": "john.doe@example.com",
  "password": "password123"
}
```

### Get User Profile (Auth Required)
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

### Update Profile (Auth Required)
```http
PATCH /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+233244123456",
  "location": "Accra, Ghana"
}
```

### Update Preferences (Auth Required)
```http
PATCH /api/auth/preferences
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "categories": ["Music", "Tech", "Sports"],
  "ageRange": "21-25",
  "personality": "Extrovert",
  "role": "Event Attendee",
  "priceRange": {
    "min": 100,
    "max": 1000
  }
}
```

### Logout (Auth Required)
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

---

## 📁 Documentation Files

This API documentation is available in multiple formats:

1. **Interactive Swagger UI**: Available at `/api-docs` when the server is running
2. **HTML Documentation**: `docs/api-docs.html` - Standalone HTML file with Swagger UI
3. **JSON Specification**: `docs/swagger.json` - OpenAPI 3.0 specification
4. **YAML Specification**: `docs/swagger.yaml` - OpenAPI 3.0 specification in YAML format
5. **Markdown Guide**: `docs/API_DOCUMENTATION.md` - This human-readable guide

## 🛠️ Development

### Viewing Documentation Locally
1. Start the server: `npm run dev`
2. Visit: `http://localhost:3001/api-docs`

### Generating Documentation
```bash
npm run docs:generate
```
This will update the JSON and YAML specification files.

## 📊 Sample Data

The database has been populated with **13 sample events** across all categories:
- **Music Events**: Pretty Girls Love Amapiano, Reggae Night Live, Hip Hop Cypher
- **Sports Events**: Football Training Camp, Basketball Skills Workshop  
- **Arts Events**: Paint & Sip Night, Digital Art Masterclass
- **Education Events**: Public Speaking Workshop, Entrepreneurship Summit
- **Food Events**: Wine Tasting Experience, Chocolate Making Class
- **Tech Events**: Blockchain Workshop, AI & Machine Learning Summit

## 🔄 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🌐 CORS

CORS is configured to allow requests from the frontend domain. In development mode, all origins are allowed.

---

*Last updated: August 2025 | TicketMate API v1.0.0*