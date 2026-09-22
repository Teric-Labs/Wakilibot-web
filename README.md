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

Base URLs are configured in `src/services/api.js` via environment variables, each falling back to the hosted production service if unset:

- `REACT_APP_AGENT_API_URL` — chat/voice endpoints (defaults to the hosted WakiliBot Agent API)
- `REACT_APP_BACKEND_API_URL` — auth/complaints/documents endpoints (defaults to the hosted WakiliBot Core API)

Text-to-speech uses [tts.atekervoices.com](https://tts.atekervoices.com/docs) (`/v1/audio/speech/stream`), which streams raw PCM audio rather than returning a file URL — `MessageBubble.jsx` decodes and plays it via the Web Audio API instead of a plain `<audio>` element.

`docker-compose.yml` in the parent `phosai/` directory sets both URLs to the local `agent`/`backend` containers (`localhost:8001`/`localhost:8000`) for local development.

## Testing

```bash
CI=true npm test -- --watchAll=false
```

48 tests across 7 suites: the language Redux slice, the API service layer (including the TTS streaming client, mocking `axios`/`fetch` as appropriate), and component tests for `LoginPage`, `SignupPage`, `ComplaintForm`, and `MessageBubble` (Web Audio API playback, mocked since jsdom has no native implementation). `npm test` alone launches Jest in interactive watch mode.

## Docker

```bash
docker build -t wakilibot-web .
docker run --rm -p 3000:3000 wakilibot-web
```

This is a dev-server image (`npm start`), matching how the parent `phosai/docker-compose.yml` runs it — not a production static build.

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
