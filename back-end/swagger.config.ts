import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inspecto API',
      version: '1.0.0',
      description: 'API for generating automated home inspection reports from audio and images.',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development Server',
      },
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
  },

  // 👇 Use absolute paths; include controllers and (optionally) routes
  apis: [
    path.resolve(process.cwd(), './server.ts'),
    path.resolve(process.cwd(), './controllers/*.ts'),
    path.resolve(process.cwd(), './routes/*.ts'),
  ],
};

export default swaggerOptions;
