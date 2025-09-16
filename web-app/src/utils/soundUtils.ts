/**
 * Custom audio sound utility functions for web-app chat using audio files
 */

export type SoundType =
  | "send"
  | "receive"
  | "notification"
  | "success"
  | "error"
  | "typing"
  | "message_read"
  | "connection_established"
  | "connection_lost"
  | "message_sent"
  | "message_delivered"
  | "new_chat";

// Audio file mappings
const audioFiles: Record<SoundType, string> = {
  send: "/audio/message-iphone.mp3",
  receive: "/audio/message-iphone.mp3",
  notification: "/audio/message-iphone.mp3",
  success: "/audio/message-iphone.mp3",
  error: "/audio/message-iphone.mp3",
  typing: "/audio/message-iphone.mp3",
  message_read: "/audio/message-iphone.mp3",
  connection_established: "/audio/message-iphone.mp3",
  connection_lost: "/audio/message-iphone.mp3",
  message_sent: "/audio/message-iphone.mp3",
  message_delivered: "/audio/message-iphone.mp3",
  new_chat: "/audio/message-iphone.mp3",
};

// Volume settings for different sound types
const volumeSettings: Record<SoundType, number> = {
  send: 0.6,
  receive: 0.8,
  notification: 0.9,
  success: 0.7,
  error: 0.8,
  typing: 0.3,
  message_read: 0.4,
  connection_established: 0.6,
  connection_lost: 0.7,
  message_sent: 0.5,
  message_delivered: 0.4,
  new_chat: 0.8,
};

// Cache for audio elements to improve performance
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Preload audio files for better performance
 */
export const preloadAudio = (): void => {
  Object.values(audioFiles).forEach((audioPath) => {
    if (!audioCache.has(audioPath)) {
      const audio = new Audio(audioPath);
      audio.preload = "auto";
      audioCache.set(audioPath, audio);
    }
  });
};

/**
 * Get or create audio element for a sound type
 */
const getAudioElement = (type: SoundType): HTMLAudioElement => {
  const audioPath = audioFiles[type];

  if (audioCache.has(audioPath)) {
    return audioCache.get(audioPath)!.cloneNode() as HTMLAudioElement;
  }

  const audio = new Audio(audioPath);
  audioCache.set(audioPath, audio);
  return audio.cloneNode() as HTMLAudioElement;
};

/**
 * Play a custom sound effect using audio files
 * @param type - The type of sound to play
 */
export const playSound = (type: SoundType): void => {
  try {
    const audio = getAudioElement(type);
    const volume = volumeSettings[type];

    // Set volume
    audio.volume = Math.max(0, Math.min(1, volume));

    // Play the sound
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  } catch (error) {
    console.log("Error playing sound:", error);
  }
};

/**
 * Play a custom sound with specific volume
 * @param type - The type of sound to play
 * @param volume - Volume level (0-1)
 */
export const playSoundWithVolume = (type: SoundType, volume: number): void => {
  try {
    const audio = getAudioElement(type);

    // Set custom volume
    audio.volume = Math.max(0, Math.min(1, volume));

    // Play the sound
    audio.play().catch((error) => {
      console.log("Audio playback failed:", error);
    });
  } catch (error) {
    console.log("Error playing sound:", error);
  }
};

/**
 * Play a notification sound with visual feedback
 * @param type - The type of sound to play
 * @param visualFeedback - Whether to show visual feedback (default: true)
 */
export const playNotificationSound = (
  type: SoundType,
  visualFeedback: boolean = true
): void => {
  playSound(type);

  if (visualFeedback) {
    // Add visual feedback if needed (e.g., vibration, flash)
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }
};
