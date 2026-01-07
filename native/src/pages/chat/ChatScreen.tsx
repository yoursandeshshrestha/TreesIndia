import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations } from '../../store/slices/chatSlice';
import { ConversationListItem } from '../../components/chat/ConversationListItem';
import { SimpleConversation } from '../../types/chat';
import ChatIcon from '../../components/icons/ChatIcon';

interface ChatScreenProps {
  onNavigateToConversation?: (
    conversationId: number,
    workerInfo: {
      id: number;
      name: string;
      phone?: string;
      profileImage?: string;
    }
  ) => void;
}

/**
 * ChatScreen - Main chat list showing all conversations
 * Displays conversations with workers from bookings
 */
export default function ChatScreen(props: ChatScreenProps) {
  const { onNavigateToConversation } = props;
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Get current user
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  // Get conversations from Redux
  const conversations = useAppSelector((state) => state.chat.conversations);
  const isLoading = useAppSelector((state) => state.chat.isLoading);
  const unreadCounts = useAppSelector((state) => state.chat.unreadCounts);


  /**
   * Load conversations on mount
   */
  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchConversations({ page: 1, limit: 20 }));
    }
  }, [dispatch, currentUserId]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchConversations({ page: 1, limit: 20 })).unwrap();
    } catch (error) {
      console.error('[ChatScreen] Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  /**
   * Handle conversation press
   */
  const handleConversationPress = useCallback(
    (conversation: SimpleConversation) => {
      if (!currentUserId || !onNavigateToConversation) {
        return;
      }

      // Determine the other user (worker)
      // Backend uses snake_case (user_1_data, user_2_data)
      const isUser1 = conversation.user_1 === currentUserId;
      const otherUser = isUser1
        ? (conversation.user_2_data || conversation.User2Data)
        : (conversation.user_1_data || conversation.User1Data);
      const otherUserId = isUser1 ? conversation.user_2 : conversation.user_1;

      if (!otherUserId) {
        return;
      }

      onNavigateToConversation(conversation.id, {
        id: otherUserId,
        name: otherUser?.name || 'Unknown User',
        phone: otherUser?.phone,
        profileImage: otherUser?.profile_image_url || otherUser?.avatar,
      });
    },
    [currentUserId, onNavigateToConversation]
  );

  /**
   * Render individual conversation item
   */
  const renderConversation = ({ item }: { item: SimpleConversation }) => {
    if (!currentUserId) {
      return null;
    }

    return (
      <ConversationListItem
        conversation={item}
        currentUserId={currentUserId}
        unreadCount={unreadCounts[item.id] || 0}
        onPress={() => handleConversationPress(item)}
      />
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (isLoading && !refreshing) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#055c3a" />
          <Text
            className="text-[#6B7280] text-sm mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading conversations...
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-12 px-8">
        {/* Chat Icon */}
        <View className="w-20 h-20 rounded-full bg-[#F0FDF4] items-center justify-center mb-4">
          <ChatIcon size={40} color="#055c3a" />
        </View>

        <Text
          className="text-[#111928] text-lg mb-2 text-center"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          No conversations yet
        </Text>
        <Text
          className="text-[#6B7280] text-sm text-center"
          style={{ fontFamily: 'Inter-Regular' }}
        >
          Start a conversation with a worker from your bookings
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-[#E5E7EB]">
        <Text
          className="text-xl font-semibold text-[#111928] flex-1"
          style={{ fontFamily: 'Inter-SemiBold' }}
        >
          Messages
        </Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#055c3a']}
            tintColor="#055c3a"
          />
        }
        contentContainerStyle={
          conversations.length === 0 ? { flex: 1 } : { paddingHorizontal: 16, paddingVertical: 8 }
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
