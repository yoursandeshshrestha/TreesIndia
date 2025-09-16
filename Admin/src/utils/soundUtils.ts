/**
 * Custom audio sound utility functions for admin chat using audio files
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
    const cachedAudio = audioCache.get(audioPath)!;
    // Clone the audio element to allow overlapping sounds
    return cachedAudio.cloneNode() as HTMLAudioElement;
  }

  // Create new audio element if not cached
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

  if (visualFeedback && typeof window !== "undefined") {
    // Add a subtle visual feedback
    const body = document.body;
    const originalTransition = body.style.transition;

    body.style.transition = "background-color 0.1s ease";
    body.style.backgroundColor = type === "receive" ? "#f0f9ff" : "#fef3c7";

    setTimeout(() => {
      body.style.backgroundColor = "";
      setTimeout(() => {
        body.style.transition = originalTransition;
      }, 100);
    }, 100);
  }
};

/**
 * Stop all currently playing sounds
 */
export const stopAllSounds = (): void => {
  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
};

/**
 * Set global volume for all sounds
 * @param volume - Volume level (0-1)
 */
export const setGlobalVolume = (volume: number): void => {
  const clampedVolume = Math.max(0, Math.min(1, volume));

  // Update volume settings for all sound types
  Object.keys(volumeSettings).forEach((type) => {
    volumeSettings[type as SoundType] = clampedVolume;
  });
};

/**
 * Check if audio is supported
 */
export const isAudioSupported = (): boolean => {
  try {
    const audio = new Audio();
    return !!(audio.canPlayType && audio.canPlayType("audio/mpeg"));
  } catch (error) {
    return false;
  }
};

/**
 * Initialize audio system
 */
export const initializeAudio = (): void => {
  // Preload audio files for better performance
  preloadAudio();

  // Enable audio context on first user interaction (required by browsers)
  if (typeof window !== "undefined") {
    const enableAudio = () => {
      // Create a silent audio context to enable audio
      try {
        const audio = new Audio();
        audio.volume = 0;
        audio
          .play()
          .then(() => {
            audio.pause();
          })
          .catch(() => {
            // Ignore errors
          });
      } catch (error) {
        // Ignore errors
      }
    };

    // Enable audio on first user interaction
    document.addEventListener("click", enableAudio, { once: true });
    document.addEventListener("keydown", enableAudio, { once: true });
    document.addEventListener("touchstart", enableAudio, { once: true });
  }
};

/**
 * Clean up audio resources
 */
export const cleanupAudio = (): void => {
  stopAllSounds();
  audioCache.clear();
};

/**
 * Add a new audio file for a sound type
 * @param type - The sound type
 * @param audioPath - Path to the audio file
 * @param volume - Default volume for this sound (0-1)
 */
export const addAudioFile = (
  type: SoundType,
  audioPath: string,
  volume: number = 0.8
): void => {
  audioFiles[type] = audioPath;
  volumeSettings[type] = volume;

  // Preload the new audio file
  const audio = new Audio(audioPath);
  audio.preload = "auto";
  audioCache.set(audioPath, audio);
};

/**
 * Get available sound types
 */
export const getAvailableSounds = (): SoundType[] => {
  return Object.keys(audioFiles) as SoundType[];
};

/**
 * Get audio file path for a sound type
 */
export const getAudioPath = (type: SoundType): string => {
  return audioFiles[type];
};
