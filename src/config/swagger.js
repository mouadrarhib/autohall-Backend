// src/config/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

const openapiDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Autohall API',
    version: '1.0.0',
    description: 'Backend API documentation for Autohall',
  },
  servers: [
    { url: `http://localhost:${process.env.PORT || 4000}`, description: 'Local' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ BearerAuth: [] }],
};

export const swaggerSpec = swaggerJSDoc({
  definition: openapiDefinition,
  // Scan your route/controller files where you’ll place JSDoc comments:
  apis: [
    './src/routes/**/*.js',
    './src/controllers/**/*.js',
  ],
});
