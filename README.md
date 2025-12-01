# Spectr

Spectr is an intelligent inspection reporting tool designed for **independent home inspectors**. The platform streamlines end-to-end workflow, from inspection to final report generation by combining AI-assisted observations, intuitive mobile data capture, and automated report assembly.

Spectr provides a unified experience across web and mobile devices, empowering inspectors to spend **more time inspecting and less time writing**, by automating repetitive admin tasks and ensuring report quality and consistency.

## Current Features

- **Cross-platform mobile app** (iOS, Android, Web) built with React Native and Expo
- **User authentication** - Secure signup, login, and session management
- **Inspection management** - Create, view, and manage multiple inspections
- **Observation logging** - Log observations with details, sections, and field notes
- **Camera integration** - Capture photos directly within the app
- **Photo annotation tools** - Draw and annotate photos with drawing tools and SVG overlays
- **Report editing** - View and edit generated inspection reports
- **Audio transcription** - Transcribe audio recordings to field notes
- **AI text polishing** - Polish and refine transcriptions using AI (Cohere integration)
- **Scalable backend architecture** - RESTful API with Express.js
- **Database persistence** - Supabase integration for data storage
- **Secure data handling** - Encrypted tokens and secure API communication

## Planned Features

- **AI-powered template extraction** - Automatically extract inspection templates from uploaded reports
- **Guided template generator** - Interactive tool for creating consistent report templates
- **Customizable inspection templates** - Create and manage custom templates for different client needs
- **Enhanced report generation** - Advanced report customization and formatting options
- **Cloud-based data synchronization** - Real-time sync across multiple devices
- **Offline mode** - Continue working without internet connectivity
- **Advanced analytics** - Inspection statistics and insights dashboard
- **Client portal** - Allow clients to view and download their inspection reports

---

## Web Demo

Spectr was designed primarily for mobile devices. Until it is available on mobile app stores we are demoing an early [web-based version](https://early-mvp-demo-html.vercel.app/), so that users can get a feel for the UI and provide feeddback.

- [Web Demo](https://early-mvp-demo-html.vercel.app/)
- [Team Spectr Product Page (Final)](https://dandy-elements-644634.framer.app/)

## Current Issues in Progress

Visit our [Kanban Board](https://github.com/orgs/HomeInspecto/projects/1) to follow which features are currently in development.

## Quick Start

> **Note:** Spectr is designed primarily for mobile devices. A web demo is available at [early-mvp-demo-html.vercel.app](https://early-mvp-demo-html.vercel.app/), but for the best experience, please follow the mobile setup instructions below.

### Prerequisites

Before starting, ensure you have the following installed:

1. **Git**

   - Download from [git-scm.com](https://git-scm.com/downloads)
   - If you don't have a GitHub account, create one at [github.com](https://github.com/)
   - Set up SSH keys for GitHub (see [GitHub's SSH key guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh))

2. **Node.js** (latest version)

   - Download from [nodejs.org](https://nodejs.org/en/download)
   - Choose the installer for your operating system

3. **Expo Go** (Mobile App)
   - **iOS**: Download from the App Store
   - **Android**: Download from Google Play Store
   - Sign in to Expo Go with your Expo account credentials

### Project Setup

> **Important:** Ensure your mobile device and development machine are connected to the same Wi-Fi network.

1. **Clone the repository**

   ```bash
   git clone https://github.com/HomeInspecto/inspecto.git
   cd inspecto
   ```

2. **Configure environment variables**

   Create a `.env` file in the `front-end/` directory:

   ```bash
   cd front-end
   touch .env
   ```

   Add the following environment variables to `front-end/.env`:

   ```env
   EXPO_PUBLIC_API_URL=<your-api-url>
   EXPO_PUBLIC_REPORT_URL=<your-report-url>
   EXPO_PUBLIC_SECRET=<your-secret>
   ```

   > **Note:** Contact the project maintainers for the actual environment variable values.

3. **Install dependencies**

   ```bash
   cd front-end
   npm install
   ```

   > If prompted to run `npm audit fix` after installation, you can ignore it and proceed.

4. **Login to Expo**

   ```bash
   npx expo login
   ```

   Enter your Expo account credentials (should match the account you're signed into on Expo Go).

### Running the Project

1. **Start the development server**

   ```bash
   cd front-end
   npm run start -- --tunnel
   ```

   > **Note:** The `--tunnel` flag enables ngrok tunneling, which allows your mobile device to connect to the development server even if they're on different networks.

   **Troubleshooting:**

   - If you see "CommandError: ngrok tunnel took too long to connect", rerun the command
   - If prompted to download packages, answer "yes" and wait for them to download

2. **Connect your mobile device**

   **Option A: Scan QR Code**

   - A QR code will appear in your terminal
   - Scan it with your phone's camera (iOS) or the Expo Go app (Android)
   - The app should open automatically in Expo Go

   **Option B: Manual Connection in Expo Go**

   - Open Expo Go on your mobile device
   - Ensure you're signed in with the same Expo account
   - Look for "Inspection App on ..." under Development Servers
   - Tap it to load the app
   - If the option doesn't appear or disappears, restart the development server (`Ctrl+C` then rerun `npm run start -- --tunnel`)

3. **Verify the app is running**

   Once connected, the app should load on your mobile device. You can now test the application features.

### Testing the Application

After finishing the setup, you can either:

- **Sign up** with your own account, or
- **Sign in** using the test account used for live demos:
  - **Email:** `uvicspectr@gmail.com`
  - **Password:** `Test@1234`

### Alternative: Docker Development (Web)

For web development without mobile setup:

```bash
docker compose up --build
```

Access the web app at: http://localhost:8081

### Development Features

- **Hot Reloading**: Both frontend and backend automatically reload on file changes
- **File Watching**: Real-time file synchronization between host and containers
- **TypeScript Support**: Full TypeScript support for both frontend and backend
- **Cross-Platform**: React Native app works on iOS, Android, and Web
- **Expo Router**: File-based routing with Expo Router
- **Custom Components**: Reusable UI components with styled buttons
- **Express API**: RESTful API with Cohere AI integration ready
- **Camera & Gallery**: Take photos, view gallery, pinch-to-zoom, new photo tracking

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
