const swaggerOptions = {
  definition: {

    //API info
    openapi: '3.0.0',
    info: {
      title: 'Inspecto Home Inspection API',
      version: '1.0.0',
      description: 'API for generating automated home inspection reports from audio and images.',
    },
    servers: [
      {
        url: 'http://localhost:4000/api', //URL to see endpoints in browser (swagger UI)
        description: 'Development Server',
      },
    ],

    //security info for authorizing on swagger UI
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
        BearerAuth: [], //login token for endpoints
    }],
  },

  apis: ['./src/routes/*.ts'], //where swagger looks to find endpoint files
};

export default swaggerOptions;
