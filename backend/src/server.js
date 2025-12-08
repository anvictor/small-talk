/**
 * Small-Talk Backend Server
 * Express + Socket.IO server for real-time messaging with voice support
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import { initializeSocketHandlers } from './socket.js';
import { storeVoiceMessage, getVoiceMessage } from './storage.js';

// Configuration
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'https://*.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [FRONTEND_URL, 'http://localhost:3000', 'https://*.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configure Multer for voice message uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Initialize Socket.IO event handlers
initializeSocketHandlers(io);

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * Voice message upload endpoint
 * Accepts audio file, stores it in memory, and returns a URL for retrieval
 */
app.post('/upload-voice', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Generate unique message ID
    const messageId = `voice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store voice message in memory
    storeVoiceMessage(messageId, req.file.buffer, req.file.mimetype);

    // Return URL for retrieving the voice message
    const url = `/voice/${messageId}`;
    
    res.json({
      success: true,
      messageId,
      url
    });

    console.log(`[API] Voice message uploaded: ${messageId} (${req.file.size} bytes)`);
  } catch (error) {
    console.error('[API] Error uploading voice message:', error);
    res.status(500).json({ error: 'Failed to upload voice message' });
  }
});

/**
 * Voice message retrieval endpoint
 * Serves the audio file from memory storage
 */
app.get('/voice/:messageId', (req, res) => {
  try {
    const { messageId } = req.params;
    const voiceMessage = getVoiceMessage(messageId);

    if (!voiceMessage) {
      return res.status(404).json({ error: 'Voice message not found' });
    }

    // Set appropriate headers
    res.set('Content-Type', voiceMessage.mimeType);
    res.set('Content-Length', voiceMessage.buffer.length);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    // Send the audio buffer
    res.send(voiceMessage.buffer);

    console.log(`[API] Voice message retrieved: ${messageId}`);
  } catch (error) {
    console.error('[API] Error retrieving voice message:', error);
    res.status(500).json({ error: 'Failed to retrieve voice message' });
  }
});

/**
 * Root endpoint - API info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Small-Talk Backend',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      uploadVoice: 'POST /upload-voice',
      getVoice: 'GET /voice/:messageId'
    }
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Small-Talk Backend Server Running        ║
╠════════════════════════════════════════════╣
║   Port: ${PORT.toString().padEnd(36)} ║
║   Frontend: ${FRONTEND_URL.padEnd(29)} ║
╚════════════════════════════════════════════╝
  `);
  console.log('[Server] Socket.IO server ready for connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
