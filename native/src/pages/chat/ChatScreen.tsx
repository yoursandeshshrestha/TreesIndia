import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConversations, fetchTotalUnreadCount } from '../../store/slices/chatSlice';
import { ConversationListItem } from '../../components/chat/ConversationListItem';
import { SimpleConversation } from '../../types/chat';
import ChatIcon from '../../components/icons/ChatIcon';
import SearchIcon from '../../components/icons/SearchIcon';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Get current user
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  // Get conversations from Redux
  const conversations = useAppSelector((state) => state.chat.conversations);
  const isLoading = useAppSelector((state) => state.chat.isLoading);
  const unreadCounts = useAppSelector((state) => state.chat.unreadCounts);

  /**
   * Filter conversations based on search query
   */
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return conversations;
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter((conversation) => {
      // Get other user data
      const isUser1 = conversation.user_1 === currentUserId;
      const otherUser = isUser1
        ? conversation.user_2_data || conversation.User2Data
        : conversation.user_1_data || conversation.User1Data;

      // Check if name matches
      const name = otherUser?.name?.toLowerCase() || '';
      const nameMatches = name.includes(query);

      // Check if last message matches
      const lastMessage = conversation.last_message_text?.toLowerCase() || '';
      const messageMatches = lastMessage.includes(query);

      return nameMatches || messageMatches;
    });
  }, [conversations, searchQuery, currentUserId]);

  /**
   * Load conversations and unread count on mount
   */
  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchConversations({ page: 1, limit: 20 }));
      dispatch(fetchTotalUnreadCount());
    }
  }, [dispatch, currentUserId]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchConversations({ page: 1, limit: 20 })).unwrap();
      await dispatch(fetchTotalUnreadCount()).unwrap();
    } catch (error) {
      // Error handling
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
        ? conversation.user_2_data || conversation.User2Data
        : conversation.user_1_data || conversation.User1Data;
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
          <Text className="mt-4 text-sm text-[#6B7280]" style={{ fontFamily: 'Inter-Regular' }}>
            Loading conversations...
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        {/* Chat Icon */}
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#F0FDF4]">
          <ChatIcon size={40} color="#055c3a" />
        </View>

        <Text
          className="mb-2 text-center text-lg text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          No conversations yet
        </Text>
        <Text
          className="text-center text-sm text-[#6B7280]"
          style={{ fontFamily: 'Inter-Regular' }}>
          Start a conversation with a worker from your bookings
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="border-b border-[#E5E7EB] px-6 py-4">
        <Text
          className="mb-3 font-semibold text-xl text-[#111928]"
          style={{ fontFamily: 'Inter-SemiBold' }}>
          Messages
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center rounded-lg bg-[#F3F4F6] px-3 py-2.5">
          <SearchIcon size={18} color="#9CA3AF" />
          <TextInput
            className="ml-2 flex-1 text-[15px] text-[#111928]"
            style={{ fontFamily: 'Inter-Regular' }}
            placeholder="Search conversations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="ml-2"
              activeOpacity={0.7}>
              <Text className="text-lg text-[#9CA3AF]">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
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
        contentContainerStyle={filteredConversations.length === 0 ? { flex: 1 } : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}
