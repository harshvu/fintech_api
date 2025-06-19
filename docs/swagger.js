const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fintech API',
      version: '1.0.0',
      description: 'Docs',
    },
    servers: [{ url: 'http://147.93.27.17:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],

    // ✅ Add the tags here in your desired order
    tags: [
      { name: 'Auth', description: 'User authentication APIs' },
      { name: 'Users', description: 'User management APIs' },
      { name: 'Portfolio', description: 'Stock portfolio management' },
      { name: 'Train', description: 'Train AI model on stocks' },
      { name: 'Predict', description: 'Predict stock outcome (general)' },
      { name: 'Daily Updates', description: 'Daily predictions and results' },
      { name: 'Live Market Stock Prediction', description: 'Live market predictions (during trading hours)' },
      { name: 'News Updates', description: 'AI news update and analysis' }
    ]
  },
  apis: ['./routes/*.js'], // Path to all routes where Swagger comments exist
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
