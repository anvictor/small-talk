# Small-Talk

A minimal web messenger application for small group communication with text and voice messaging support.

## Features

- 🚀 **Real-time messaging** - Instant text and voice messages via WebSocket (Socket.IO)
- 🎤 **Voice messages** - Record and share voice messages using browser MediaRecorder API
- 🔗 **Simple sharing** - Create a room and share the unique URL
- 👤 **No registration** - Auto-generated random nicknames (e.g., "User123")
- 🔔 **Browser notifications** - Get notified when new messages arrive
- 🎨 **Modern UI** - Beautiful, premium design with gradients and animations
- 🔒 **Private rooms** - Each room is isolated with its own unique ID

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **Socket.IO Client**

### Backend
- **Node.js**
- **Express**
- **Socket.IO**
- **Multer** (file uploads)

## Prerequisites

- Node.js 18+ and npm

## Local Development Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3001`.

You should see:
```
╔════════════════════════════════════════════╗
║   Small-Talk Backend Server Running        ║
╠════════════════════════════════════════════╣
║   Port: 3001                               ║
║   Frontend: http://localhost:3000          ║
╚════════════════════════════════════════════╝
```

### 3. Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`.

### 4. Test the Application

1. Open `http://localhost:3000` in your browser
2. Click "Create New Room"
3. You'll be redirected to a unique room URL (e.g., `/room/room-1234567890-abc123`)
4. Copy the room URL and open it in another browser window or incognito mode
5. Start chatting!

**Test features:**
- Send text messages
- Click the microphone button to record voice messages
- Check browser notifications (allow permissions when prompted)
- Verify messages appear in real-time across all connected clients

## Deployment

### Backend Deployment (Render, Railway, or Fly.io)

The backend requires a platform that supports persistent WebSocket connections. **Vercel serverless functions cannot be used for the backend.**

#### Option 1: Deploy to Render (Free Tier)

1. Create a free account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
5. Click "Create Web Service"
6. Copy the deployed backend URL (e.g., `https://your-backend.onrender.com`)

#### Option 2: Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `FRONTEND_URL`: Your Vercel frontend URL
5. Deploy and copy the URL

### Frontend Deployment (Vercel)

1. Create account at [vercel.com](https://vercel.com)
2. Click "New Project" → Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_BACKEND_URL`: Your backend URL from Render/Railway (e.g., `https://your-backend.onrender.com`)
4. Click "Deploy"

### Post-Deployment

1. Update the backend's `FRONTEND_URL` environment variable with your Vercel URL
2. Redeploy the backend if needed
3. Test the deployed application by creating a room and sharing the link

## Architecture

### Backend (`/backend`)

```
backend/
├── src/
│   ├── server.js      # Express + Socket.IO server
│   ├── socket.js      # Socket.IO event handlers
│   └── storage.js     # In-memory voice message storage
└── package.json
```

**Key Components:**
- **Express Server**: HTTP server for voice message uploads
- **Socket.IO**: Real-time WebSocket communication
- **Room Management**: Tracks users per room, assigns random nicknames
- **Voice Storage**: Temporary in-memory storage for voice messages (24h retention)

**API Endpoints:**
- `GET /health` - Health check
- `POST /upload-voice` - Upload voice message (returns message ID and URL)
- `GET /voice/:messageId` - Retrieve voice message audio

**Socket.IO Events:**
- `join-room` - User joins a room
- `send-message` - Send text message
- `send-voice` - Send voice message metadata
- `new-message` - Broadcast message to room
- `user-joined` / `user-left` - User presence updates

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   └── room/[roomId]/page.tsx  # Chat room page
│   ├── components/
│   │   ├── ChatWindow.tsx          # Message list display
│   │   ├── MessageInput.tsx        # Text input
│   │   └── VoiceRecorder.tsx       # Voice recording
│   ├── hooks/
│   │   ├── useSocket.ts            # Socket.IO connection
│   │   └── useNotifications.ts     # Browser notifications
│   └── styles/
│       └── globals.css             # Global styles + animations
└── package.json
```

**Key Features:**
- **useSocket Hook**: Manages Socket.IO connection, room joining, message sending
- **useNotifications Hook**: Handles browser notification permissions and display
- **ChatWindow**: Auto-scrolling message list with text and voice message rendering
- **VoiceRecorder**: MediaRecorder API integration for audio recording and upload

## Troubleshooting

### Backend won't start
- Ensure Node.js 18+ is installed: `node --version`
- Check if port 3001 is available
- Verify all dependencies are installed: `npm install`

### Frontend can't connect to backend
- Check that `NEXT_PUBLIC_BACKEND_URL` environment variable is set correctly
- Verify backend is running and accessible
- Check browser console for CORS errors
- Ensure backend CORS configuration includes your frontend URL

### Voice messages not working
- Grant microphone permissions in browser
- Check browser console for MediaRecorder errors
- Verify backend `/upload-voice` endpoint is accessible
- Ensure audio format (webm) is supported by your browser

### Notifications not appearing
- Grant notification permissions when prompted
- Notifications only appear when tab is not focused
- Check browser notification settings

### Messages not appearing in real-time
- Verify Socket.IO connection status (check header indicator)
- Check browser console for WebSocket errors
- Ensure both clients are in the same room (same URL)

## Limitations

- **No persistence**: Messages and voice recordings are lost on server restart
- **In-memory storage**: Voice messages stored in server memory (not suitable for large scale)
- **No authentication**: Anyone with the room URL can join
- **No message history**: New users don't see previous messages
- **Session-based**: Rooms exist only while users are connected

## Future Enhancements

For production use, consider:
- Database integration (PostgreSQL, MongoDB) for message persistence
- Cloud storage (AWS S3, Cloudflare R2) for voice messages
- User authentication and profiles
- Message encryption
- File sharing
- Typing indicators
- Read receipts
- Room passwords/access control

## License

MIT

---

**Created for family use - simple, fast, and private group communication.**
