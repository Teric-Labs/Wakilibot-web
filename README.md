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

## Configuration

Copy `.env.example` to `.env` and set your service URLs:

```bash
cp .env.example .env
npm start
```

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_AGENT_URL` | No | WakiliBot Agent API base URL for chat/voice (default: hosted Render service) |
| `REACT_APP_BACKEND_URL` | No | WakiliBot Core API base URL for auth/complaints/documents (default: hosted Render service) |
| `REACT_APP_ASR_CONTROL_URL` | No | Real-time ASR control WebSocket (default: `ws://stt-control.atekervoices.com/control`) |
| `REACT_APP_ASR_DATA_URL` | No | Real-time ASR data WebSocket (default: `ws://stt-data.atekervoices.com`) |
| `REACT_APP_TTS_WS_URL` | No | Spark TTS streaming WebSocket — use `wss://` when the site is served over HTTPS to avoid mixed-content blocks (default: `wss://tts.atekervoices.com/v1/audio/speech/stream/ws`) |

All `REACT_APP_*` vars are baked into the bundle at build time by Create React App — they cannot be changed after the image is built.

Text-to-speech streams raw PCM audio via the Web Audio API rather than returning a file URL — `MessageBubble.jsx` decodes and plays it directly instead of using a plain `<audio>` element.

`docker-compose.yml` in the parent `phosai/` directory sets `REACT_APP_AGENT_URL` and `REACT_APP_BACKEND_URL` to the local `agent`/`backend` containers for local development.

## Testing

```bash
CI=true npm test -- --watchAll=false
```

48 tests across 7 suites: the language Redux slice, the API service layer (including the TTS streaming client, mocking `axios`/`fetch` as appropriate), and component tests for `LoginPage`, `SignupPage`, `ComplaintForm`, and `MessageBubble` (Web Audio API playback, mocked since jsdom has no native implementation). `npm test` alone launches Jest in interactive watch mode.

## Docker

The image is published to GHCR on every merge to `main`. Pull and run it directly:

```bash
docker run -p 3000:3000 ghcr.io/teric-labs/wakilibot-web:latest
```

Pass service URLs to point it at your backend and agent:

```bash
docker run \
  -e REACT_APP_AGENT_URL=https://your-agent.onrender.com \
  -e REACT_APP_BACKEND_URL=https://your-backend.onrender.com \
  -p 3000:3000 ghcr.io/teric-labs/wakilibot-web:latest
```

### Build locally

```bash
docker build -t wakilibot-web .
docker run -p 3000:3000 wakilibot-web
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
