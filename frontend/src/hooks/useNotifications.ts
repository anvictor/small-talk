/**
 * Custom React hook for browser notifications
 * Requests permission and shows notifications for new messages
 */

'use client';

import { useEffect, useCallback } from 'react';

export function useNotifications() {
  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('[Notifications] Permission:', permission);
        });
      }
    }
  }, []);

  // Show notification
  const showNotification = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      // Only show notification if tab is not focused
      if (document.hidden) {
        new Notification(title, {
          body,
          icon: '/icon.png', // Optional: add an icon
          badge: '/badge.png', // Optional: add a badge
          tag: 'small-talk-message', // Prevents duplicate notifications
        });
      }
    }
  }, []);

  return { showNotification };
}
