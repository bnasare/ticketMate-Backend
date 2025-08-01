const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TicketMate API',
      version: '1.0.0',
      description: 'API documentation for TicketMate backend services',
      contact: {
        name: 'TicketMate Team'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://ticketmate-backend.onrender.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            username: {
              type: 'string',
              example: 'johndoe'
            },
            phoneNumber: {
              type: 'string',
              example: '+233244123456'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'prefer-not-to-say'],
              example: 'male'
            },
            profileImage: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/avatar.jpg'
            },
            location: {
              type: 'string',
              example: 'Accra, Ghana'
            },
            preferences: {
              type: 'object',
              properties: {
                categories: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['Dance', 'Tech Conference', 'Music', 'International Events', 'Festivals', 'Games', 'Sports', 'Education', 'Art', 'House Party', 'Cooking', 'Exhibition', 'Modelling', 'Gospel', 'Car Showroom and Drifting']
                  }
                },
                ageRange: {
                  type: 'string',
                  enum: ['10-15', '16-20', '21-25', '25-30', '30-35', '36 and Above']
                },
                personality: {
                  type: 'string',
                  enum: ['Extrovert', 'Introvert', 'Ambivert']
                },
                role: {
                  type: 'string',
                  enum: ['Event Creator', 'Event Attendee']
                },
                priceRange: {
                  type: 'object',
                  properties: {
                    min: { type: 'number' },
                    max: { type: 'number' }
                  }
                }
              }
            },
            isOnline: {
              type: 'boolean',
              example: false
            },
            isVerified: {
              type: 'boolean',
              example: true
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Event: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439012'
            },
            title: {
              type: 'string',
              example: 'Pretty Girls Love Amapiano'
            },
            date: {
              type: 'string',
              example: 'June 27th'
            },
            time: {
              type: 'string',
              example: '1:15 PM - 4:50 AM'
            },
            location: {
              type: 'string',
              example: 'Accra'
            },
            venue: {
              type: 'string',
              example: 'NO.5 Bar And Restaurant'
            },
            price: {
              type: 'string',
              example: 'GH₵950'
            },
            rating: {
              type: 'string',
              example: '4.8'
            },
            attendees: {
              type: 'string',
              example: '4000+'
            },
            image: {
              type: 'string',
              format: 'uri',
              example: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'
            },
            category: {
              type: 'string',
              enum: ['Music', 'Sports', 'Arts', 'Education', 'Food', 'Tech'],
              example: 'Music'
            },
            isPopular: {
              type: 'boolean',
              example: true
            },
            attendeeImages: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              example: ['https://randomuser.me/api/portraits/men/32.jpg']
            },
            tickets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'VIP'
                  },
                  price: {
                    type: 'string',
                    example: 'GH₵1500'
                  },
                  description: {
                    type: 'string',
                    example: 'VIP access with perks'
                  },
                  available: {
                    type: 'boolean',
                    example: true
                  }
                }
              }
            },
            description: {
              type: 'string',
              example: 'Pretty Girls Love Amapiano is a music and dance event organised by the party invasion team of Ghana.'
            },
            organizer: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'AfroNation Events'
                },
                avatar: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
                },
                isVerified: {
                  type: 'boolean',
                  example: true
                },
                followers: {
                  type: 'string',
                  example: '2.5K'
                },
                events: {
                  type: 'string',
                  example: '12'
                }
              }
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  example: 5.6037
                },
                longitude: {
                  type: 'number',
                  example: -0.1870
                }
              }
            },
            createdBy: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'cancelled'],
              example: 'published'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        EventInput: {
          type: 'object',
          required: ['title', 'date', 'time', 'location', 'venue', 'price', 'image', 'category', 'description'],
          properties: {
            title: {
              type: 'string',
              maxLength: 100,
              example: 'Amazing Music Festival'
            },
            date: {
              type: 'string',
              example: 'December 25th'
            },
            time: {
              type: 'string',
              example: '7:00 PM - 11:00 PM'
            },
            location: {
              type: 'string',
              example: 'Accra'
            },
            venue: {
              type: 'string',
              example: 'National Theatre'
            },
            price: {
              type: 'string',
              example: 'GH₵500'
            },
            image: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/event-image.jpg'
            },
            category: {
              type: 'string',
              enum: ['Music', 'Sports', 'Arts', 'Education', 'Food', 'Tech'],
              example: 'Music'
            },
            description: {
              type: 'string',
              example: 'A fantastic music event with top artists'
            },
            isPopular: {
              type: 'boolean',
              example: false
            },
            attendeeImages: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              }
            },
            tickets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'General'
                  },
                  price: {
                    type: 'string',
                    example: 'GH₵500'
                  },
                  description: {
                    type: 'string',
                    example: 'General admission'
                  },
                  available: {
                    type: 'boolean',
                    example: true
                  }
                }
              }
            },
            organizer: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Event Organizers Ghana'
                },
                avatar: {
                  type: 'string',
                  format: 'uri'
                },
                isVerified: {
                  type: 'boolean',
                  example: false
                },
                followers: {
                  type: 'string',
                  example: '1K'
                },
                events: {
                  type: 'string',
                  example: '5'
                }
              }
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number'
                },
                longitude: {
                  type: 'number'
                }
              }
            }
          }
        },
        UserRegister: {
          type: 'object',
          required: ['firstName', 'lastName', 'username', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              maxLength: 50,
              example: 'John'
            },
            lastName: {
              type: 'string',
              maxLength: 50,
              example: 'Doe'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 30,
              example: 'johndoe'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123'
            },
            phoneNumber: {
              type: 'string',
              example: '+233244123456'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'prefer-not-to-say'],
              example: 'male'
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['emailOrUsername', 'password'],
          properties: {
            emailOrUsername: {
              type: 'string',
              example: 'johndoe'
            },
            password: {
              type: 'string',
              example: 'password123'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        EventsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            count: {
              type: 'number',
              example: 10
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Event'
              }
            }
          }
        },
        EventResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              $ref: '#/components/schemas/Event'
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: {
              type: 'string',
              example: 'abc123def456'
            },
            newPassword: {
              type: 'string',
              minLength: 6,
              example: 'newpassword123'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/server.js']
};

const specs = swaggerJSDoc(options);
module.exports = specs;