# API Documentation Setup with Swagger/OpenAPI

This guide explains how to implement and maintain API documentation using Swagger/OpenAPI in the Daily Balance App.

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Usage](#usage)
4. [Route Documentation Examples](#route-documentation-examples)
5. [Maintenance](#maintenance)

## Installation

Install the required packages:

```bash
npm install swagger-jsdoc swagger-ui-express
```

## Configuration

1. Create a Swagger configuration file at `config/swagger.js`:

```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Daily Balance App API',
      version: '1.0.0',
      description: 'API documentation for Daily Balance Application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
```

2. Update your `server.js` to include Swagger:

```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// ... existing code ...

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
```

## Usage

Access your API documentation at: `http://your-api-url/api-docs`

## Route Documentation Examples

### Authentication Routes

```javascript
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
```

### Protected Routes

```javascript
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authenticated
 */
```

## Maintenance

### Adding New Routes

1. Document each route using JSDoc comments above the route definition
2. Include the following information:
   - Route description
   - Request parameters
   - Request body schema
   - Response schema
   - Possible error responses
   - Authentication requirements

### Schema Definitions

Define reusable schemas in your Swagger configuration:

```javascript
// In config/swagger.js
components: {
  schemas: {
    User: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'User\'s username'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User\'s email address'
        }
      }
    }
  }
}
```

### Best Practices

1. Group related endpoints using tags
2. Provide clear descriptions for all parameters
3. Include example requests and responses
4. Document all possible response status codes
5. Keep documentation up to date with code changes

### Example Route Groups

Your API has the following route groups:

1. Auth/User Routes (`/api/users/*`)
   - Registration
   - Login
   - Profile management
   - Points management

2. Journal Routes (`/api/users/journal/*`)
   - Create journal entries
   - Update entries
   - Get journal history

3. Activity Report Routes (`/api/activity/*`)
   - Get today's journal
   - Generate activity response
   - Save activity points
   - Get weekly points

4. Dashboard Routes (`/api/dashboard/*`)
   - Get recommendations

5. Friends Routes (`/api/friends/*`)
   - Send/accept/reject friend requests
   - Get friends list
   - Search users

6. Dev Routes (`/api/dev/*`)
   - Debug endpoints
   - Reset user data

Document each group separately and use appropriate tags to organize the documentation.

## Testing Documentation

1. Start your server
2. Visit `/api-docs` in your browser
3. Test each endpoint using the Swagger UI
4. Verify that all parameters and responses are correctly documented

## Troubleshooting

Common issues and solutions:

1. Documentation not showing up:
   - Check file paths in swagger configuration
   - Verify JSDoc comments syntax

2. Schema validation errors:
   - Verify OpenAPI syntax in documentation
   - Check for missing required fields

3. Authentication not working in Swagger UI:
   - Verify security scheme configuration
   - Check token format in requests 