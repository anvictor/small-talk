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

---

## 📚 Learning Guide: How It All Works

*This section explains the technologies and architecture for those learning web development.*

### Core Technologies Explained

#### **Next.js 14 (Frontend Framework)**

Next.js is a React framework that adds powerful features:

- **App Router**: New routing system using file-based routing
  - `app/page.tsx` → Landing page at `/`
  - `app/room/[roomId]/page.tsx` → Dynamic route at `/room/{any-id}`
- **Server Components**: Components that render on the server (faster initial load)
- **Client Components**: Interactive components marked with `'use client'`
- **Built-in optimization**: Automatic code splitting, image optimization

**Why we use it:** Makes React development easier with routing, optimization, and deployment.

#### **React 18 (UI Library)**

React lets us build interactive UIs using components:

```typescript
// Component example
function ChatWindow({ messages }) {
  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
    </div>
  );
}
```

**Key concepts used:**
- **Components**: Reusable UI pieces (ChatWindow, MessageInput, VoiceRecorder)
- **Hooks**: Functions that add features to components
  - `useState`: Store data that changes (e.g., recording state)
  - `useEffect`: Run code when component loads or updates
  - `useRef`: Reference DOM elements or store values that don't trigger re-renders
- **Props**: Pass data between components

#### **TypeScript (Type Safety)**

TypeScript adds types to JavaScript, catching errors before runtime:

```typescript
// Without TypeScript (JavaScript)
function sendMessage(text) {  // What type is text?
  socket.emit('send-message', text);
}

// With TypeScript
function sendMessage(text: string) {  // text must be a string
  socket.emit('send-message', text);
}
```

**Benefits:** Autocomplete, error detection, better documentation.

#### **Socket.IO (Real-time Communication)**

Socket.IO enables bidirectional communication between client and server:

**Traditional HTTP:**
```
Client: "Hey server, any new messages?" (request)
Server: "Here are the messages" (response)
[Client must ask again to get updates]
```

**WebSocket (Socket.IO):**
```
Client ←→ Server (persistent connection)
Server can push updates instantly without client asking
```

**How it works in our app:**

1. **Client connects:**
   ```typescript
   const socket = io('http://localhost:3001');
   ```

2. **Client joins room:**
   ```typescript
   socket.emit('join-room', { roomId: 'abc123' });
   ```

3. **Client sends message:**
   ```typescript
   socket.emit('send-message', { roomId: 'abc123', text: 'Hello!' });
   ```

4. **Server broadcasts to all in room:**
   ```javascript
   socket.to(roomId).emit('new-message', message);
   ```

5. **All clients receive instantly:**
   ```typescript
   socket.on('new-message', (message) => {
     setMessages(prev => [...prev, message]);
   });
   ```

#### **Express (Backend Framework)**

Express is a minimal web server framework for Node.js:

```javascript
const app = express();

// Define routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/upload-voice', (req, res) => {
  // Handle file upload
});

app.listen(3001);  // Start server on port 3001
```

**Why we use it:** Simple, flexible, perfect for APIs and WebSocket servers.

#### **Multer (File Upload Middleware)**

Multer handles multipart/form-data (file uploads):

```javascript
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload-voice', upload.single('audio'), (req, res) => {
  const audioFile = req.file;  // Multer parses the file
  // Store and process audio
});
```

**In our app:** Handles voice message uploads from the browser.

---

### Architecture & Data Flow

#### **How a Message Travels Through the System**

**Text Message Flow:**

```
1. User types in MessageInput component
   ↓
2. Component calls sendMessage() from useSocket hook
   ↓
3. useSocket emits 'send-message' via Socket.IO
   ↓
4. Backend receives event in socket.js
   ↓
5. Backend broadcasts 'new-message' to all users in room
   ↓
6. All clients receive via socket.on('new-message')
   ↓
7. ChatWindow component updates and displays message
```

**Voice Message Flow:**

```
1. User clicks microphone in VoiceRecorder
   ↓
2. Browser MediaRecorder API starts recording
   ↓
3. User clicks stop → audio saved as Blob
   ↓
4. VoiceRecorder uploads via HTTP POST to /upload-voice
   ↓
5. Backend (Multer) receives file, stores in memory
   ↓
6. Backend returns URL: https://backend.com/voice/{id}
   ↓
7. VoiceRecorder emits 'send-voice' with URL via Socket.IO
   ↓
8. Backend broadcasts to all users in room
   ↓
9. ChatWindow displays audio player with URL
   ↓
10. When played, browser fetches audio from /voice/{id}
```

#### **Frontend Architecture**

**File Structure:**
```
frontend/src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (wraps all pages)
│   ├── page.tsx                 # Landing page (/)
│   └── room/[roomId]/page.tsx   # Chat room (/room/{id})
├── components/                   # Reusable UI components
│   ├── ChatWindow.tsx           # Displays messages
│   ├── MessageInput.tsx         # Text input field
│   └── VoiceRecorder.tsx        # Record voice button
├── hooks/                        # Custom React hooks
│   ├── useSocket.ts             # Socket.IO logic
│   └── useNotifications.ts      # Browser notifications
└── styles/
    └── globals.css              # Global styles
```

**Component Breakdown:**

**1. Landing Page (`app/page.tsx`)**
- Simple page with "Create New Room" button
- Generates unique room ID: `${Date.now()}-${random()}`
- Redirects to `/room/{id}`

**2. Chat Room Page (`app/room/[roomId]/page.tsx`)**
- Main chat interface
- Uses `useSocket` hook to connect to backend
- Uses `useNotifications` for browser notifications
- Renders ChatWindow, MessageInput, VoiceRecorder

**3. useSocket Hook (`hooks/useSocket.ts`)**
- Manages Socket.IO connection
- Handles joining room, sending messages
- Listens for incoming messages
- Returns: `{ messages, sendMessage, sendVoice, isConnected }`

**4. ChatWindow Component (`components/ChatWindow.tsx`)**
- Displays list of messages
- Auto-scrolls to bottom on new message
- Renders text messages and voice players
- Shows user nicknames and timestamps

**5. MessageInput Component (`components/MessageInput.tsx`)**
- Text input field
- Send button
- Calls `sendMessage()` on submit

**6. VoiceRecorder Component (`components/VoiceRecorder.tsx`)**
- Microphone button
- Uses MediaRecorder API to record audio
- Uploads to backend via fetch()
- Emits voice message via Socket.IO

#### **Backend Architecture**

**File Structure:**
```
backend/src/
├── server.js    # Main server (Express + Socket.IO setup)
├── socket.js    # Socket.IO event handlers
└── storage.js   # In-memory voice message storage
```

**Module Breakdown:**

**1. server.js (Main Server)**

```javascript
// Create HTTP server
const app = express();
const httpServer = createServer(app);

// Attach Socket.IO to HTTP server
const io = new Server(httpServer, { cors: {...} });

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

// HTTP endpoints
app.post('/upload-voice', ...);  // Voice upload
app.get('/voice/:id', ...);      // Voice retrieval

// Start server
httpServer.listen(3001);
```

**Why HTTP + Socket.IO together?**
- Socket.IO needs an HTTP server to upgrade connections to WebSocket
- We use the same server for both real-time (Socket.IO) and REST (file uploads)

**2. socket.js (WebSocket Logic)**

Handles all real-time events:

```javascript
export function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    // User connected
    
    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);  // Add user to room
      // Assign nickname, notify others
    });
    
    socket.on('send-message', ({ roomId, text }) => {
      // Broadcast to everyone in room
      io.to(roomId).emit('new-message', {...});
    });
    
    socket.on('disconnect', () => {
      // User left, notify room
    });
  });
}
```

**Key concepts:**
- **Rooms**: Socket.IO groups connections (like chat rooms)
- **Broadcasting**: Send to all users except sender
- **Emit to room**: `io.to(roomId).emit()` sends to all in room

**3. storage.js (Voice Storage)**

Simple in-memory Map to store voice messages:

```javascript
const voiceMessages = new Map();

export function storeVoiceMessage(id, buffer, mimeType) {
  voiceMessages.set(id, { buffer, mimeType, timestamp: Date.now() });
}

export function getVoiceMessage(id) {
  return voiceMessages.get(id);
}
```

**Limitation:** Data lost on server restart. For production, use cloud storage (S3, R2).

---

### Key Learning Concepts

#### **1. Client-Server Architecture**

```
Frontend (Vercel)          Backend (Render)
     ↓                           ↓
  Browser                   Node.js Server
     ↓                           ↓
React Components  ←WebSocket→  Socket.IO
     ↓                           ↓
  User sees UI            Manages rooms/messages
```

**Separation of concerns:**
- Frontend: UI, user interaction
- Backend: Business logic, data management

#### **2. Real-time vs Request-Response**

**Request-Response (HTTP):**
- Client asks, server responds
- Good for: file uploads, one-time data fetching
- Example: Uploading voice message

**Real-time (WebSocket):**
- Persistent connection, bidirectional
- Good for: chat, live updates, notifications
- Example: Receiving new messages instantly

#### **3. State Management in React**

**Local State (useState):**
```typescript
const [messages, setMessages] = useState([]);
```
- Data specific to one component
- Re-renders component when changed

**Shared State (Props):**
```typescript
<ChatWindow messages={messages} />
```
- Pass data from parent to child

**Side Effects (useEffect):**
```typescript
useEffect(() => {
  socket.on('new-message', handleMessage);
  return () => socket.off('new-message');
}, []);
```
- Run code when component mounts/unmounts
- Set up/clean up Socket.IO listeners

#### **4. Environment Variables**

Different configs for development vs production:

```bash
# Development (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Production (Vercel)
NEXT_PUBLIC_BACKEND_URL=https://backend.onrender.com
```

**Why `NEXT_PUBLIC_`?**
- Next.js only exposes env vars with this prefix to the browser
- Keeps secrets (API keys) server-side only

#### **5. CORS (Cross-Origin Resource Sharing)**

Browser security prevents requests to different domains:

```
Frontend: https://app.vercel.app
Backend:  https://backend.onrender.com
         ↑ Different domains = CORS error!
```

**Solution:** Backend explicitly allows frontend:

```javascript
app.use(cors({
  origin: ['https://app.vercel.app'],
  credentials: true
}));
```

---

### Browser APIs Used

#### **MediaRecorder API (Voice Recording)**

```javascript
// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// Create recorder
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus'
});

// Collect audio chunks
recorder.ondataavailable = (e) => {
  chunks.push(e.data);
};

// Start/stop recording
recorder.start();
recorder.stop();

// Create audio file
const audioBlob = new Blob(chunks, { type: 'audio/webm' });
```

#### **Notifications API**

```javascript
// Request permission
const permission = await Notification.requestPermission();

// Show notification
if (permission === 'granted') {
  new Notification('New message', {
    body: 'Hello from Small-Talk!',
    icon: '/icon.png'
  });
}
```

#### **Fetch API (HTTP Requests)**

```javascript
// Upload file
const formData = new FormData();
formData.append('audio', audioBlob);

const response = await fetch('/upload-voice', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

---

### Common Patterns & Best Practices

#### **1. Custom Hooks**

Extract reusable logic:

```typescript
// Instead of duplicating Socket.IO code in every component
function useSocket(roomId) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const socket = io(backendUrl);
    socket.emit('join-room', { roomId });
    socket.on('new-message', (msg) => setMessages(prev => [...prev, msg]));
    return () => socket.disconnect();
  }, [roomId]);
  
  return { messages, sendMessage: (text) => socket.emit('send-message', { text }) };
}

// Now any component can use it
const { messages, sendMessage } = useSocket(roomId);
```

#### **2. Error Handling**

Always handle failures gracefully:

```typescript
try {
  const response = await fetch('/upload-voice', {...});
  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  alert('Failed to upload. Please try again.');
}
```

#### **3. Cleanup in useEffect**

Prevent memory leaks:

```typescript
useEffect(() => {
  socket.on('new-message', handleMessage);
  
  // Cleanup function runs when component unmounts
  return () => {
    socket.off('new-message', handleMessage);
  };
}, []);
```

#### **4. TypeScript Interfaces**

Define data structures:

```typescript
interface Message {
  id: string;
  type: 'text' | 'voice';
  sender: string;
  content: string;
  timestamp: number;
}

// Now TypeScript ensures correct usage
const message: Message = {
  id: '123',
  type: 'text',
  sender: 'User123',
  content: 'Hello!',
  timestamp: Date.now()
};
```

---

### Learning Resources

**Next.js:**
- Official Tutorial: https://nextjs.org/learn
- App Router Docs: https://nextjs.org/docs/app

**React:**
- Official Tutorial: https://react.dev/learn
- Hooks Reference: https://react.dev/reference/react

**Socket.IO:**
- Get Started: https://socket.io/get-started/chat
- Rooms Documentation: https://socket.io/docs/v4/rooms/

**TypeScript:**
- Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/

**Web APIs:**
- MediaRecorder: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- Notifications: https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

---



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
