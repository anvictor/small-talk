/**
 * ChatWindow Component
 * Displays scrollable list of messages with auto-scroll to latest
 */

'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/hooks/useSocket';

interface ChatWindowProps {
  messages: Message[];
  currentNickname: string | null;
}

export default function ChatWindow({ messages, currentNickname }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div className="text-gray-400">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.nickname === currentNickname;
          
          return (
            <div
              key={message.id}
              className={`message-enter flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isOwnMessage
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                    : 'glass text-white'
                }`}
              >
                {/* Nickname and timestamp */}
                <div className="flex items-center justify-between mb-1 gap-3">
                  <span className="text-xs font-semibold opacity-90">
                    {message.nickname}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                {/* Message content */}
                {message.type === 'text' ? (
                  <p className="text-sm break-words">{message.content}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <audio
                      controls
                      src={message.url}  // message.url now contains full URL from backend
                      className="max-w-full"
                      style={{ height: '32px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
