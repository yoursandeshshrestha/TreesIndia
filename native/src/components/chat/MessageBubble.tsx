import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

interface MessageBubbleProps {
  message: string | null;
  isSent: boolean;
  timestamp: string;
  isRead?: boolean;
  senderName?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isPending?: boolean;
  uploadError?: string;
  localFileUri?: string;
}

/**
 * MessageBubble component displays a chat message with appropriate styling
 * Sent messages: green background, right-aligned
 * Received messages: gray background, left-aligned
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSent,
  timestamp,
  isRead = false,
  senderName,
  imageUrl,
  videoUrl,
  isPending = false,
  uploadError,
  localFileUri,
}) => {
  const [imageLoadError, setImageLoadError] = useState(false);

  // Use local file URI if pending and the message has that type, otherwise use server URL
  const displayImageUrl = (isPending && imageUrl) ? localFileUri : imageUrl;
  const displayVideoUrl = (isPending && videoUrl) ? localFileUri : videoUrl;

  /**
   * Format timestamp to show time in HH:MM format or relative date
   */
  const formatTimestamp = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

      // If today, show time only
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }

      // If yesterday
      if (diffDays === 1) {
        return 'Yesterday';
      }

      // If within a week, show day name
      if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }

      // Otherwise show date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  /**
   * Handle opening video
   */
  const handleOpenVideo = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open video');
      }
    } catch (error) {
      console.error('[MessageBubble] Error opening video:', error);
      Alert.alert('Error', 'Failed to open video');
    }
  };

  /**
   * Handle opening image (future: could open in a modal viewer)
   */
  const handleOpenImage = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open image');
      }
    } catch (error) {
      console.error('[MessageBubble] Error opening image:', error);
      Alert.alert('Error', 'Failed to open image');
    }
  };

  return (
    <View
      className={`flex-row mb-3 ${isSent ? 'justify-end' : 'justify-start'}`}
    >
      <View className={`max-w-[80%] ${isSent ? 'items-end' : 'items-start'}`}>
        {/* Sender name for received messages */}
        {!isSent && senderName && (
          <Text
            className="text-xs text-[#6B7280] mb-1 px-1"
            style={{ fontFamily: 'Inter-Medium' }}
          >
            {senderName}
          </Text>
        )}

        {/* Message bubble */}
        <View
          className={`rounded-2xl ${(displayImageUrl || displayVideoUrl) ? 'p-2' : 'px-4 py-3'} ${
            isSent
              ? 'bg-[#00a871] rounded-tr-sm'
              : 'bg-[#F3F4F6] rounded-tl-sm'
          }`}
        >
          {/* Image attachment */}
          {displayImageUrl && !imageLoadError && (
            <View className="relative" style={{ maxWidth: 280 }}>
              <TouchableOpacity
                onPress={() => !isPending && handleOpenImage(displayImageUrl)}
                activeOpacity={isPending ? 1 : 0.9}
                disabled={isPending}
              >
                <Image
                  source={{ uri: displayImageUrl }}
                  className="w-full rounded-lg"
                  style={{ aspectRatio: 1, minHeight: 200 }}
                  resizeMode="cover"
                  onError={() => setImageLoadError(true)}
                />
              </TouchableOpacity>

              {/* Loading overlay for pending upload */}
              {isPending && !uploadError && (
                <View className="absolute inset-0 bg-black/40 rounded-lg items-center justify-center">
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text
                    className="text-white text-xs mt-2"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Uploading...
                  </Text>
                </View>
              )}

              {/* Error overlay for failed upload */}
              {uploadError && (
                <View className="absolute inset-0 bg-red-900/60 rounded-lg items-center justify-center">
                  <Text
                    className="text-white text-xs text-center px-2"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Upload failed
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Image load error fallback */}
          {displayImageUrl && imageLoadError && (
            <View className="w-full rounded-lg bg-[#E5E7EB] items-center justify-center" style={{ aspectRatio: 1, minHeight: 200, maxWidth: 280 }}>
              <ImageIcon size={48} color="#9CA3AF" />
              <Text
                className="text-[#6B7280] text-xs mt-2"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                Image unavailable
              </Text>
            </View>
          )}

          {/* Video attachment with play button overlay */}
          {displayVideoUrl && (
            <View className="relative" style={{ maxWidth: 280 }}>
              <TouchableOpacity
                onPress={() => !isPending && handleOpenVideo(displayVideoUrl)}
                activeOpacity={isPending ? 1 : 0.9}
                disabled={isPending}
                className="w-full rounded-lg bg-[#1F2937] items-center justify-center overflow-hidden"
                style={{ aspectRatio: 1, minHeight: 200 }}
              >
                {/* Play button overlay */}
                {!isPending && !uploadError && (
                  <View className="absolute inset-0 items-center justify-center bg-black/30">
                    <View className="w-16 h-16 rounded-full bg-white/90 items-center justify-center">
                      <PlayIcon size={32} color="#00a871" />
                    </View>
                  </View>
                )}

                {/* Video label */}
                <View className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded">
                  <Text
                    className="text-white text-xs"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Video
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Loading overlay for pending upload */}
              {isPending && !uploadError && (
                <View className="absolute inset-0 bg-black/40 rounded-lg items-center justify-center">
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text
                    className="text-white text-xs mt-2"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Uploading...
                  </Text>
                </View>
              )}

              {/* Error overlay for failed upload */}
              {uploadError && (
                <View className="absolute inset-0 bg-red-900/60 rounded-lg items-center justify-center">
                  <Text
                    className="text-white text-xs text-center px-2"
                    style={{ fontFamily: 'Inter-Medium' }}
                  >
                    Upload failed
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Message text */}
          {message && (
            <Text
              className={`text-base ${(displayImageUrl || displayVideoUrl) ? 'mt-2' : ''} ${
                isSent ? 'text-white' : 'text-[#111928]'
              } ${(displayImageUrl || displayVideoUrl) ? 'px-2 pb-1' : ''}`}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              {message}
            </Text>
          )}
        </View>

        {/* Timestamp and read status */}
        <View className="flex-row items-center mt-1 px-1">
          <Text
            className="text-xs text-[#9CA3AF]"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            {formatTimestamp(timestamp)}
          </Text>

          {/* Read status checkmarks for sent messages */}
          {isSent && (
            <View className="ml-1">
              {isRead ? (
                // Double checkmark (read)
                <View className="flex-row">
                  <Text className="text-xs text-[#00a871]">✓</Text>
                  <Text className="text-xs text-[#00a871] -ml-1">✓</Text>
                </View>
              ) : (
                // Single checkmark (sent but not read)
                <Text className="text-xs text-[#9CA3AF]">✓</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

/**
 * Play icon SVG component
 */
const PlayIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 3l14 9-14 9V3z"
      fill={color}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Image icon SVG component
 */
const ImageIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={8.5} cy={8.5} r={1.5} fill={color} />
    <Path
      d="M21 15l-5-5L5 21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
