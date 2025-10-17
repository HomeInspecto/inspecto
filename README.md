# Inspecto

A full-stack application with Expo React Native frontend and Node.js/Express backend, containerized with Docker and configured for development with hot reloading.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git
- Node.js (for local development)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Running the Project

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inspecto
   ```

2. **Start the development environment**

   **Option A: Docker (Web Development)**
   ```bash
   docker compose up --build
   ```

   **Option B: Local Development (iOS/Android)**
   ```bash
   # Backend
   docker compose up back-end
   
   # Frontend (in another terminal)
   cd front-end
   npm install
   npm run ios    # for iOS
   # or
   npm run android # for Android
   # or
   npm run web    # for web
   ```

3. **Access the applications**
   - Frontend Web: http://localhost:8081 (Docker) or http://localhost:8081 (Local)
   - Backend: http://localhost:4000
   - Backend Health Check: http://localhost:4000/health
   - To check API endpoints: http://localhost:4000/api

### Development Features

- ✅ **Hot Reloading**: Both frontend and backend automatically reload on file changes
- ✅ **File Watching**: Real-time file synchronization between host and containers
- ✅ **TypeScript Support**: Full TypeScript support for both frontend and backend
- ✅ **Cross-Platform**: React Native app works on iOS, Android, and Web
- ✅ **Expo Router**: File-based routing with Expo Router
- ✅ **Custom Components**: Reusable UI components with styled buttons
- ✅ **Express API**: RESTful API with Cohere AI integration ready

### Project Structure

```
inspecto/
├── front-end/          # Expo React Native application
│   ├── app/            # Expo Router pages and layouts
│   │   ├── (tabs)/     # Tab-based navigation
│   │   └── _layout.tsx # Root layout
│   ├── components/     # Reusable UI components
│   │   ├── button.tsx  # Custom button component
│   │   └── ui/         # UI component library
│   ├── assets/         # Images and static assets
│   ├── constants/      # App constants and themes
│   ├── hooks/          # Custom React hooks
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

#### Using Docker (Web Development)
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

#### Local Development (iOS/Android)
```bash
# Backend
docker compose up back-end

# Frontend (in another terminal)
cd front-end
npm install
npm run ios    # for iOS
npm run android # for Android
npm run web 
```

#### Available Scripts
```bash
# Frontend scripts
cd front-end
npm run start     # Start Expo development server
npm run android   # Start with Android
npm run ios       # Start with iOS
npm run web       # Start with Web
npm run lint      # Run ESLint
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

**Port conflicts**: If ports 8081 or 4000 are in use, modify the ports in `docker-compose.yml`

**iOS Simulator issues**: 
- Ensure Xcode is installed and iOS Simulator is available
- Run `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` if needed

**Android Emulator issues**:
- Ensure Android Studio and Android SDK are installed
- Check available disk space (emulator needs 2-4GB free)
- Use `adb devices` to check if emulator is running

**Docker issues**:
- File watching not working: Ensure Docker has proper volume mount permissions
- Build failures: Try `docker compose down --remove-orphans` and rebuild
- Expo not found: Rebuild container with `docker compose up --build`

**Development workflow**:
- Use Docker for web development
- Use local development for iOS/Android development
- Backend can run in Docker while frontend runs locally

### Contributing

1. Create a feature branch
2. Make your changes
3. The CI pipeline will automatically run tests
4. Create a pull request

---

Built with ❤️ using Expo React Native, Express, TypeScript, and Docker