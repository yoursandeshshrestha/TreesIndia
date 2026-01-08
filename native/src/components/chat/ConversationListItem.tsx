import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SimpleConversation } from '../../types/chat';

interface ConversationListItemProps {
  conversation: SimpleConversation;
  currentUserId: number;
  unreadCount?: number;
  onPress: () => void;
}

/**
 * ConversationListItem component - WhatsApp style
 * Shows: profile picture, name, last message, timestamp, and unread badge
 */
export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  currentUserId,
  unreadCount = 0,
  onPress,
}) => {
  /**
   * Get the other user in the conversation (not the current user)
   */
  const getOtherUser = () => {
    if (conversation.user_1 === currentUserId) {
      return conversation.user_2_data || conversation.User2Data;
    } else {
      return conversation.user_1_data || conversation.User1Data;
    }
  };

  const otherUser = getOtherUser();
  const displayName = otherUser?.name || 'Unknown User';
  const avatarUrl = otherUser?.profile_image_url || otherUser?.avatar;
  const lastMessage = conversation.last_message_text || 'Tap to start chatting';
  const lastMessageTime = conversation.last_message_created_at;
  const hasUnread = unreadCount > 0;
  const isSentByMe = conversation.last_message_sender_id === currentUserId;

  /**
   * Format timestamp WhatsApp style
   */
  const formatTimestamp = (dateString?: string): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Today: show time (HH:MM)
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }

      // Yesterday
      if (diffDays === 1) {
        return 'Yesterday';
      }

      // This week: show day name
      if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }

      // Older: show date
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white px-6 py-3"
      activeOpacity={0.95}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}
    >
      <View className="flex-row items-start">
        {/* Profile Picture - WhatsApp style */}
        <View className="mr-3">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-[52px] h-[52px] rounded-full"
              style={{ backgroundColor: '#DDD' }}
            />
          ) : (
            <View className="w-[52px] h-[52px] rounded-full bg-[#DDD] items-center justify-center">
              <Text
                className="text-[#666] text-xl"
                style={{ fontFamily: 'Inter-SemiBold' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Content - Name, Message, Time, Badge */}
        <View className="flex-1">
          {/* Top Row: Name and Timestamp */}
          <View className="flex-row items-center justify-between mb-1">
            {/* Name */}
            <Text
              className="text-[17px] text-[#000] flex-1"
              style={{
                fontFamily: hasUnread ? 'Inter-SemiBold' : 'Inter-Medium',
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            {/* Timestamp */}
            {lastMessageTime && (
              <Text
                className={`text-[13px] ml-2 ${hasUnread ? 'text-[#25D366]' : 'text-[#667781]'}`}
                style={{
                  fontFamily: hasUnread ? 'Inter-Medium' : 'Inter-Regular',
                }}
              >
                {formatTimestamp(lastMessageTime)}
              </Text>
            )}
          </View>

          {/* Bottom Row: Message and Badge */}
          <View className="flex-row items-center justify-between">
            {/* Last Message */}
            <View className="flex-row items-center flex-1">
              {/* Show "You: " prefix if sent by current user */}
              {isSentByMe && lastMessage !== 'Tap to start chatting' && (
                <Text
                  className="text-[15px] text-[#667781]"
                  style={{
                    fontFamily: hasUnread ? 'Inter-Medium' : 'Inter-Regular',
                  }}
                >
                  You:{' '}
                </Text>
              )}

              <Text
                className={`text-[15px] flex-1 ${hasUnread ? 'text-[#111]' : 'text-[#667781]'}`}
                style={{
                  fontFamily: hasUnread ? 'Inter-Medium' : 'Inter-Regular',
                }}
                numberOfLines={1}
              >
                {lastMessage}
              </Text>
            </View>

            {/* Unread Badge - WhatsApp green */}
            {hasUnread && (
              <View className="bg-[#25D366] rounded-full min-w-[20px] h-[20px] items-center justify-center px-1.5 ml-2">
                <Text
                  className="text-white text-[12px]"
                  style={{
                    fontFamily: 'Inter-Bold',
                    lineHeight: 14,
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
