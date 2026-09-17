# WakiliBot Web

Consumer-facing React application for WakiliBot, an AI-assisted financial consumer-protection service for Uganda.

## Features

- AI chat with conversation persistence and simulated streaming
- Account registration, login, logout, and password reset
- English and Ugandan-language selection
- Voice recording and voice-chat support
- Complaint submission and status workflows
- Document archive
- Responsive Material UI interface
- Redux Toolkit state management with persisted preferences

## Technology

- React 18
- Material UI
- Redux Toolkit and Redux Persist
- Axios and Fetch
- React Markdown

## Getting started

Requirements:

- Node.js 18 or newer
- npm

Install dependencies and run the development server:

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API

The API base URL is configured in `src/services/api.js`. The current configuration targets the hosted WakiliBot Agent API.

## Scripts

```bash
npm start       # Start the development server
npm test        # Run tests in watch mode
npm run build   # Create an optimized production build
```

## Production build

```bash
npm run build
```

Deploy the generated `build` directory using any static hosting provider.
