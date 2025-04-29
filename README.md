# YJS Chat App

A collaborative, real-time chat application built with React, Zustand, Yjs, and y-webrtc. Supports multiple channels, threads, typing indicators, and user presence, all synchronized via Yjs and WebRTC.

## Features
- Real-time chat with multiple channels and threads
- User presence and typing indicators
- Local persistence with IndexedDB
- Peer-to-peer sync via y-webrtc (WebRTC)
- Modern React UI with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd yjs-chat
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` to set your signaling server(s):
```
VITE_SIGNALING_SERVERS=ws://localhost:4444
```
You can provide a comma-separated list for multiple servers.

### Running the App (Locally)
Start the Vite dev server:
```bash
npm run dev
```

Start the y-webrtc signaling server (for local development):
```bash
npm run server
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production
```bash
npm run build
```

## Docker Deployment (All-in-One)
A Dockerfile and docker-compose.yml are provided to run both the frontend and the signaling server in a single container.

### Build and Run
```bash
docker compose up --build
```
- The frontend will be served on port 80.
- The signaling server will be available on port 4444.
- You can set `VITE_SIGNALING_SERVERS` in your `.env` or as an environment variable at build/run time.

## Workspace Initialization
- The app supports both sample and system data initialization for new workspaces.
- The shared setup logic is in `src/utils/sampleData.ts` and can be reused for custom setups.

## Recommendations for Production
- Use environment variables for signaling server URLs (see `.env.example`).
- Deploy the signaling server(s) on a reliable host or use public Yjs signaling servers.
- Use HTTPS in production for secure WebRTC connections.
- Consider scaling signaling servers for larger deployments.

## License
MIT
