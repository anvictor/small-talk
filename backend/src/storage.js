/**
 * In-memory storage for voice messages
 * Voice messages are stored temporarily and will be lost on server restart
 * For production use, consider integrating cloud storage (AWS S3, Cloudflare R2, etc.)
 */

// Map to store voice message buffers: messageId -> { buffer: Buffer, mimeType: string, timestamp: number }
const voiceMessages = new Map();

/**
 * Store a voice message buffer
 * @param {string} messageId - Unique identifier for the voice message
 * @param {Buffer} buffer - Audio data buffer
 * @param {string} mimeType - MIME type of the audio (e.g., 'audio/webm')
 */
export function storeVoiceMessage(messageId, buffer, mimeType) {
  voiceMessages.set(messageId, {
    buffer,
    mimeType,
    timestamp: Date.now()
  });
  
  console.log(`[Storage] Stored voice message: ${messageId} (${buffer.length} bytes)`);
}

/**
 * Retrieve a voice message buffer
 * @param {string} messageId - Unique identifier for the voice message
 * @returns {Object|null} Voice message data or null if not found
 */
export function getVoiceMessage(messageId) {
  return voiceMessages.get(messageId) || null;
}

/**
 * Delete old voice messages (older than 24 hours)
 * This prevents memory leaks from accumulating voice messages
 */
export function cleanupOldMessages() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  let deletedCount = 0;
  
  for (const [messageId, data] of voiceMessages.entries()) {
    if (now - data.timestamp > maxAge) {
      voiceMessages.delete(messageId);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`[Storage] Cleaned up ${deletedCount} old voice messages`);
  }
}

// Run cleanup every hour
setInterval(cleanupOldMessages, 60 * 60 * 1000);
