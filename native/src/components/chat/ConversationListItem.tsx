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
 * ConversationListItem component displays a preview of a conversation
 * Shows: worker name, last message, timestamp, and unread badge
 */
export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  currentUserId,
  unreadCount = 0,
  onPress,
}) => {
  /**
   * Get the other user in the conversation (not the current user)
   * Backend uses snake_case (user_1_data, user_2_data)
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
  const lastMessage = conversation.last_message_text || 'No messages yet';
  const lastMessageTime = conversation.last_message_created_at;
  const hasUnread = unreadCount > 0;

  /**
   * Format timestamp to show relative time
   */
  const formatTimestamp = (dateString?: string): string => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diff / (1000 * 60));
      const diffHours = Math.floor(diff / (1000 * 60 * 60));
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return 'Just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border-b border-[#E5E7EB] px-4 py-4"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Profile Picture */}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-12 h-12 rounded-full mr-3"
            style={{ backgroundColor: '#F0FDF4' }}
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-[#F0FDF4] items-center justify-center mr-3">
            <Text
              className="text-[#055c3a] text-lg"
              style={{ fontFamily: 'Inter-SemiBold' }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Conversation Info */}
        <View className="flex-1">
          {/* Name and Timestamp */}
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-[#111928] text-base flex-1"
              style={{ fontFamily: 'Inter-SemiBold' }}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            {lastMessageTime && (
              <Text
                className={`text-xs ml-2 ${
                  hasUnread ? 'text-[#00a871]' : 'text-[#9CA3AF]'
                }`}
                style={{
                  fontFamily: hasUnread ? 'Inter-SemiBold' : 'Inter-Regular',
                }}
              >
                {formatTimestamp(lastMessageTime)}
              </Text>
            )}
          </View>

          {/* Last Message and Unread Badge */}
          <View className="flex-row items-center">
            <Text
              className={`flex-1 text-sm ${
                hasUnread ? 'text-[#4B5563]' : 'text-[#9CA3AF]'
              }`}
              style={{
                fontFamily: hasUnread ? 'Inter-Medium' : 'Inter-Regular',
              }}
              numberOfLines={1}
            >
              {lastMessage}
            </Text>

            {/* Unread Badge */}
            {hasUnread && (
              <View className="w-6 h-6 rounded-full bg-[#00a871] items-center justify-center ml-2">
                <Text
                  className="text-white text-xs"
                  style={{ fontFamily: 'Inter-Bold' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
