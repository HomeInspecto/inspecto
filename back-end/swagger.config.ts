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

<<<<<<< HEAD
  // 👇 Use absolute paths; include controllers and (optionally) routes
  apis: [
    path.resolve(process.cwd(), './server.ts'),
    path.resolve(process.cwd(), './controllers/*.ts'),
    path.resolve(process.cwd(), './routes/*.ts'),
  ],
=======
  apis: ['./routes/*.ts'], //where swagger looks to find endpoint files
>>>>>>> d00002fa78ab3bb309a270591524a6c599552bc0
};

export default swaggerOptions;
