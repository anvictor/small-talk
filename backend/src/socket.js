/**
 * Socket.IO event handlers for real-time messaging
 * Manages room-based communication, user presence, and message broadcasting
 */

import { storeVoiceMessage } from './storage.js';

// Map to track users in each room: roomId -> Set of { socketId, nickname }
const rooms = new Map();

/**
 * Generate a random nickname for a user
 * @returns {string} Random nickname like "User123" or "Guest456"
 */
function generateNickname() {
  const prefixes = ['User', 'Guest', 'Visitor', 'Friend', 'Member'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `${prefix}${number}`;
}

/**
 * Initialize Socket.IO event handlers
 * @param {Server} io - Socket.IO server instance
 */
export function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    
    let currentRoom = null;
    let currentNickname = null;

    /**
     * Handle user joining a room
     * Assigns a random nickname and broadcasts join event to room participants
     */
    socket.on('join-room', (roomId) => {
      // Leave previous room if any
      if (currentRoom) {
        socket.leave(currentRoom);
        removeUserFromRoom(currentRoom, socket.id);
      }

      // Join new room
      currentRoom = roomId;
      currentNickname = generateNickname();
      socket.join(roomId);

      // Add user to room tracking
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add({ socketId: socket.id, nickname: currentNickname });

      console.log(`[Socket] ${currentNickname} (${socket.id}) joined room: ${roomId}`);

      // Notify user of their assigned nickname
      socket.emit('nickname-assigned', currentNickname);

      // Notify room participants about new user
      socket.to(roomId).emit('user-joined', {
        nickname: currentNickname,
        timestamp: Date.now()
      });

      // Send current participant list to the new user
      const participants = Array.from(rooms.get(roomId) || []).map(u => u.nickname);
      socket.emit('participants-list', participants);
    });

    /**
     * Handle text message sending
     * Broadcasts message to all participants in the room
     */
    socket.on('send-message', (data) => {
      if (!currentRoom || !currentNickname) {
        console.warn(`[Socket] Message from unjoined user: ${socket.id}`);
        return;
      }

      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'text',
        content: data.content,
        nickname: currentNickname,
        timestamp: Date.now()
      };

      console.log(`[Socket] Message in ${currentRoom} from ${currentNickname}: ${data.content.substring(0, 50)}`);

      // Broadcast to all users in the room (including sender)
      io.to(currentRoom).emit('new-message', message);
    });

    /**
     * Handle voice message metadata
     * The actual audio file is uploaded via HTTP endpoint
     * This event broadcasts the voice message metadata to room participants
     */
    socket.on('send-voice', (data) => {
      if (!currentRoom || !currentNickname) {
        console.warn(`[Socket] Voice message from unjoined user: ${socket.id}`);
        return;
      }

      const message = {
        id: data.messageId,
        type: 'voice',
        url: data.url, // URL to retrieve the voice message
        duration: data.duration || 0,
        nickname: currentNickname,
        timestamp: Date.now()
      };

      console.log(`[Socket] Voice message in ${currentRoom} from ${currentNickname}: ${data.messageId}`);

      // Broadcast to all users in the room (including sender)
      io.to(currentRoom).emit('new-message', message);
    });

    /**
     * Handle user disconnect
     * Removes user from room and notifies other participants
     */
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);

      if (currentRoom && currentNickname) {
        removeUserFromRoom(currentRoom, socket.id);

        // Notify room participants about user leaving
        socket.to(currentRoom).emit('user-left', {
          nickname: currentNickname,
          timestamp: Date.now()
        });
      }
    });
  });

  console.log('[Socket] Event handlers initialized');
}

/**
 * Remove a user from room tracking
 * @param {string} roomId - Room identifier
 * @param {string} socketId - Socket identifier
 */
function removeUserFromRoom(roomId, socketId) {
  const room = rooms.get(roomId);
  if (room) {
    // Find and remove user by socketId
    for (const user of room) {
      if (user.socketId === socketId) {
        room.delete(user);
        break;
      }
    }

    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
      console.log(`[Socket] Room ${roomId} is now empty and removed`);
    }
  }
}
