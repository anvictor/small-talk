/**
 * Custom React hook for Socket.IO connection management
 * Handles connection, room joining, and message sending/receiving
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Get backend URL from environment variable or use localhost for development
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Message {
  id: string;
  type: 'text' | 'voice';
  content?: string; // For text messages
  url?: string; // For voice messages
  duration?: number; // For voice messages
  nickname: string;
  timestamp: number;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  messages: Message[];
  nickname: string | null;
  participants: string[];
  joinRoom: (roomId: string) => void;
  sendMessage: (content: string) => void;
  sendVoice: (messageId: string, url: string, duration?: number) => void;
}

export function useSocket(roomId?: string): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Only initialize once
    if (socketRef.current) return;

    console.log('[Socket] Connecting to:', BACKEND_URL);
    
    const newSocket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    // Nickname assignment
    newSocket.on('nickname-assigned', (assignedNickname: string) => {
      console.log('[Socket] Nickname assigned:', assignedNickname);
      setNickname(assignedNickname);
    });

    // Participants list
    newSocket.on('participants-list', (participantsList: string[]) => {
      console.log('[Socket] Participants:', participantsList);
      setParticipants(participantsList);
    });

    // New message received
    newSocket.on('new-message', (message: Message) => {
      console.log('[Socket] New message:', message);
      setMessages((prev) => [...prev, message]);
    });

    // User joined
    newSocket.on('user-joined', (data: { nickname: string; timestamp: number }) => {
      console.log('[Socket] User joined:', data.nickname);
      setParticipants((prev) => [...prev, data.nickname]);
    });

    // User left
    newSocket.on('user-left', (data: { nickname: string; timestamp: number }) => {
      console.log('[Socket] User left:', data.nickname);
      setParticipants((prev) => prev.filter((p) => p !== data.nickname));
    });

    // Cleanup on unmount
    return () => {
      console.log('[Socket] Cleaning up connection');
      newSocket.close();
      socketRef.current = null;
    };
  }, []);

  // Join room when roomId is provided
  useEffect(() => {
    if (socket && connected && roomId) {
      console.log('[Socket] Joining room:', roomId);
      socket.emit('join-room', roomId);
    }
  }, [socket, connected, roomId]);

  // Send text message
  const sendMessage = useCallback((content: string) => {
    if (!socket || !connected) {
      console.warn('[Socket] Cannot send message: not connected');
      return;
    }

    socket.emit('send-message', { content });
  }, [socket, connected]);

  // Send voice message metadata
  const sendVoice = useCallback((messageId: string, url: string, duration?: number) => {
    if (!socket || !connected) {
      console.warn('[Socket] Cannot send voice: not connected');
      return;
    }

    socket.emit('send-voice', { messageId, url, duration });
  }, [socket, connected]);

  // Join a specific room
  const joinRoom = useCallback((newRoomId: string) => {
    if (!socket || !connected) {
      console.warn('[Socket] Cannot join room: not connected');
      return;
    }

    console.log('[Socket] Joining room:', newRoomId);
    socket.emit('join-room', newRoomId);
  }, [socket, connected]);

  return {
    socket,
    connected,
    messages,
    nickname,
    participants,
    joinRoom,
    sendMessage,
    sendVoice,
  };
}
