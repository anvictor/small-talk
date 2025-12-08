/**
 * Room Page
 * Main chat interface for a specific room
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useNotifications } from '@/hooks/useNotifications';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [copied, setCopied] = useState(false);

  const { connected, messages, nickname, participants, sendMessage, sendVoice } = useSocket(roomId);
  const { showNotification } = useNotifications();

  // Show notification for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Don't notify for own messages
      if (lastMessage.nickname !== nickname) {
        const content = lastMessage.type === 'text' 
          ? lastMessage.content 
          : '🎤 Voice message';
        
        showNotification(
          `New message from ${lastMessage.nickname}`,
          content || ''
        );
      }
    }
  }, [messages, nickname, showNotification]);

  const copyRoomUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-dark-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold gradient-text">Small-Talk</h1>
              <p className="text-sm text-gray-400">
                {connected ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Connected as {nickname || 'Guest'}
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Connecting...
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Participants count */}
              <div className="text-sm text-gray-400">
                <span className="font-semibold text-white">{participants.length}</span> online
              </div>

              {/* Copy room URL button */}
              <button
                onClick={copyRoomUrl}
                className="bg-dark-card hover:bg-dark-border border border-dark-border rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Share Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <ChatWindow messages={messages} currentNickname={nickname} />
      </main>

      {/* Input Area */}
      <footer className="glass border-t border-dark-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <MessageInput onSendMessage={sendMessage} disabled={!connected} />
          <VoiceRecorder onSendVoice={sendVoice} disabled={!connected} />
        </div>
      </footer>
    </div>
  );
}
