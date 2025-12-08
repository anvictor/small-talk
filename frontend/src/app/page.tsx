/**
 * Landing Page
 * Allows users to create a new chat room
 */

'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    // Generate unique room ID
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="container-center">
      <div className="card max-w-md w-full text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-3">
            Small-Talk
          </h1>
          <p className="text-gray-400 text-lg">
            Simple group messaging for family & friends
          </p>
        </div>

        {/* Features */}
        <div className="mb-8 space-y-3 text-left">
          <div className="flex items-start gap-3">
            <div className="bg-primary/20 rounded-full p-2 mt-1">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Real-time messaging</h3>
              <p className="text-sm text-gray-400">Instant text and voice messages</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-secondary/20 rounded-full p-2 mt-1">
              <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">No registration</h3>
              <p className="text-sm text-gray-400">Just share the link and start chatting</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-accent/20 rounded-full p-2 mt-1">
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Private rooms</h3>
              <p className="text-sm text-gray-400">Each room has a unique URL</p>
            </div>
          </div>
        </div>

        {/* Create Room Button */}
        <button
          onClick={createRoom}
          className="w-full btn-primary rounded-full py-4 text-lg font-bold text-white shadow-lg"
        >
          Create New Room
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Create a room and share the URL with your group
        </p>
      </div>
    </div>
  );
}
