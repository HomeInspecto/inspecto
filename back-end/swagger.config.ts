import path from 'path';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inspecto API',
      version: '1.0.0',
      description: 'API for generating automated home inspection reports from audio and images.\n\n## Authentication\n\nMost endpoints require authentication. Click the "Authorize" button at the top right to enter your Bearer token.\n\n1. First, use the /api/auth/login endpoint to get your access token\n2. Click the "Authorize" button (lock icon) at the top of this page\n3. Enter your token (you can enter just the token without "Bearer" prefix)\n4. Click "Authorize" and then "Close"\n\nYour token will be included in all subsequent API requests.',
    },
    servers: [

      //hosted version
      { url: '/', description: 'Same origin' },

      //local host if needed
      { url: 'http://localhost:4000', description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login endpoint. You can enter just the token (without "Bearer" prefix).',
        },
      },
    },
    // Add global security (optional) to ensure the Authorize button appears
    // Individual endpoints can override this
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
