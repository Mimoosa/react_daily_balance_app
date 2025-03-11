const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Daily Balance App API',
      version: '1.0.0',
      description: 'API documentation for Daily Balance Application',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.PRODUCTION_URL 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { 
              type: 'string',
              description: 'Unique identifier for the user'
            },
            username: { 
              type: 'string',
              description: 'User\'s username'
            },
            password: { 
              type: 'string',
              description: 'Hashed password',
              writeOnly: true
            },
            friends: {
              type: 'array',
              items: {
                type: 'string',
                description: 'User IDs of friends'
              }
            },
            friendRequests: {
              type: 'object',
              properties: {
                sent: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      user: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                },
                received: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      user: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            },
            points: {
              type: 'object',
              properties: {
                Physical: { type: 'number' },
                Cognitive: { type: 'number' },
                Social: { type: 'number' },
                Psychological: { type: 'number' }
              }
            },
            totalPoints: {
              type: 'object',
              properties: {
                Physical: { type: 'number' },
                Cognitive: { type: 'number' },
                Social: { type: 'number' },
                Psychological: { type: 'number' }
              }
            },
            streak: {
              type: 'object',
              properties: {
                count: { type: 'number' },
                lastEntryDate: { type: 'string', format: 'date-time' },
                bestStreak: { type: 'number' }
              }
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
        Journal: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            user: { type: 'string' },
            analysis: {
              type: 'object',
              properties: {
                mood: { type: 'string' },
                summary: { type: 'string' },
                suggestions: { 
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            },
            points: {
              type: 'object',
              properties: {
                Physical: { type: 'number' },
                Cognitive: { type: 'number' },
                Social: { type: 'number' },
                Psychological: { type: 'number' }
              }
            },
            activitiesProcessed: { type: 'boolean' },
            activitiesCalculatedAt: { 
              type: 'string', 
              format: 'date-time',
              nullable: true 
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  // Path to the API docs
  apis: [
    './backend/routes/*.js',
    './backend/models/*.js'
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs; 