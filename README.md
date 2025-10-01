# Inspecto

A full-stack application with Next.js frontend and Node.js/Express backend, containerized with Docker and configured for development with hot reloading.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Running the Project

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inspecto
   ```

2. **Start the development environment**
   ```bash
   docker compose up --build
   ```

3. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000
   - Backend Health Check: http://localhost:4000/health

### Development Features

- ✅ **Hot Reloading**: Both frontend and backend automatically reload on file changes
- ✅ **File Watching**: Real-time file synchronization between host and containers
- ✅ **TypeScript Support**: Full TypeScript support for both frontend and backend
- ✅ **Tailwind CSS**: Styled with Tailwind CSS v3
- ✅ **Express API**: RESTful API with Cohere AI integration ready

### Project Structure

```
inspecto/
├── front-end/          # Next.js React application
│   ├── src/app/        # App router pages
│   ├── package.json    # Frontend dependencies
│   └── Dockerfile      # Frontend container config
├── back-end/           # Node.js Express API
│   ├── server.ts       # Express server
│   ├── package.json    # Backend dependencies
│   └── Dockerfile      # Backend container config
├── docker-compose.yml  # Multi-container orchestration
└── .github/workflows/  # CI/CD pipelines
```

### Available Commands

#### Using Docker (Recommended)
```bash
# Start development environment
docker compose up --build

# Stop services
docker compose down

# View logs
docker compose logs

# View specific service logs
docker compose logs front-end
docker compose logs back-end
```

#### Local Development (Without Docker)
```bash
# Frontend
cd front-end
npm install
npm run dev

# Backend
cd back-end
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:
```env
COHERE_API_KEY=your_cohere_api_key_here
```

### CI/CD

The project includes GitHub Actions workflows for:
- **Frontend CI**: Runs on pull requests to `main` branch when frontend files change
- **Backend CI**: Runs on pull requests to `main` branch when backend files change
- **Deployment**: Configured for continuous deployment

### Troubleshooting

**Port conflicts**: If ports 3000 or 4000 are in use, modify the ports in `docker-compose.yml`

**File watching not working**: Ensure Docker has proper volume mount permissions

**Build failures**: Try `docker compose down --remove-orphans` and rebuild

### Contributing

1. Create a feature branch
2. Make your changes
3. The CI pipeline will automatically run tests
4. Create a pull request

---

Built with ❤️ using Next.js, Express, TypeScript, and Docker