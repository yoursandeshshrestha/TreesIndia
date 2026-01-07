import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMessages,
  sendChatMessage,
  sendChatMessageWithFile,
  markConversationAsRead,
  addMessage,
  setActiveConversation,
  addOptimisticMessage,
} from '../../store/slices/chatSlice';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { chatWebSocketService } from '../../services/websocket/chat.websocket';
import { tokenStorage } from '../../services/api/base';
import { SimpleConversationMessage, WebSocketMessage } from '../../types/chat';
import { PickedFile } from '../../utils/fileUpload';

interface ChatConversationScreenProps {
  conversationId: number;
  workerId: number;
  workerName: string;
  workerPhone?: string;
  workerProfileImage?: string;
  onBack: () => void;
}

/**
 * ChatConversationScreen - Main chat interface for messaging with a worker
 * Features: real-time messaging, pagination, typing indicators, read status
 */
const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({
  conversationId,
  workerId,
  workerName,
  onBack,
}) => {
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get current user from auth state
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  // Get messages and state from Redux
  const messagesFromStore = useAppSelector(
    (state) => state.chat.messages[conversationId]
  );
  // Use useMemo to memoize empty array to prevent unnecessary rerenders
  const messages = useMemo(
    () => messagesFromStore || [],
    [messagesFromStore]
  );
  const isLoading = useAppSelector((state) => state.chat.isLoading);
  const isSendingMessage = useAppSelector((state) => state.chat.isSendingMessage);
  const pagination = useAppSelector(
    (state) => state.chat.pagination.messages[conversationId]
  );
  const currentPage = pagination?.page || 1;
  const hasMore = pagination?.has_more ?? (pagination && pagination.page < pagination.total_pages);

  /**
   * Load messages on mount
   */
  useEffect(() => {
    dispatch(setActiveConversation(conversationId));
    dispatch(fetchMessages({ conversationId, page: 1, limit: 50 }));

    // Mark conversation as read when opening
    dispatch(markConversationAsRead({ conversationId }));

    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [dispatch, conversationId]);

  /**
   * Connect WebSocket on mount
   */
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        if (!token) {
          console.error('[ChatConversation] No access token available');
          return;
        }

        // Connect to WebSocket
        chatWebSocketService.connect(conversationId, token);

        // Listen for incoming messages
        const handleWebSocketMessage = (wsMessage: WebSocketMessage) => {
          if (!wsMessage) {
            return;
          }

          // Backend uses 'event' field and sends message at root level
          const messageType = wsMessage.type || wsMessage.event;
          const incomingMessage = wsMessage.message || wsMessage.data?.message;

          if ((messageType === 'message' || messageType === 'conversation_message') && incomingMessage) {
            // Add message to Redux store
            dispatch(
              addMessage({
                conversationId,
                message: incomingMessage,
              })
            );

            // Auto-scroll to bottom
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        };

        chatWebSocketService.on('message', handleWebSocketMessage);

        // Cleanup
        return () => {
          chatWebSocketService.off('message', handleWebSocketMessage);
        };
      } catch (error) {
        console.error('[ChatConversation] Error connecting WebSocket:', error);
      }
    };

    connectWebSocket();

    // Disconnect WebSocket on unmount
    return () => {
      chatWebSocketService.disconnect();
    };
  }, [conversationId, dispatch]);

  /**
   * Auto-scroll to bottom when messages load or new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isLoading]);

  /**
   * Handle sending message
   */
  const handleSendMessage = useCallback(
    async (messageText: string) => {
      try {
        // Send via Redux (which calls API)
        await dispatch(
          sendChatMessage({
            conversationId,
            message: messageText,
          })
        ).unwrap();

        // Auto-scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('[ChatConversation] Error sending message:', error);
      }
    },
    [dispatch, conversationId]
  );

  /**
   * Handle sending message with file (with optimistic UI)
   */
  const handleSendMessageWithFile = useCallback(
    async (messageText: string, file: PickedFile) => {
      // Generate temporary ID (negative to avoid conflicts)
      const tempId = -Date.now();

      // Determine attachment type
      const attachmentType = file.mimeType.startsWith('video/') ? 'video' : 'image';

      try {
        // Add optimistic message immediately
        dispatch(
          addOptimisticMessage({
            conversationId,
            tempId,
            message: messageText,
            senderId: currentUserId!,
            localFileUri: file.uri,
            attachmentType,
          })
        );

        // Auto-scroll to bottom to show the pending message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Send via Redux (which calls API)
        // The fulfilled reducer will automatically replace the pending message
        await dispatch(
          sendChatMessageWithFile({
            conversationId,
            messageText,
            fileUri: file.uri,
            fileName: file.fileName,
            mimeType: file.mimeType,
          })
        ).unwrap();
      } catch (error) {
        console.error('[ChatConversation] Error sending message with file:', error);
        // The rejected reducer will automatically mark the pending message as failed
      }
    },
    [dispatch, conversationId, currentUserId]
  );

  /**
   * Handle load more messages (pagination)
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) {
      return;
    }

    setIsLoadingMore(true);

    try {
      await dispatch(
        fetchMessages({
          conversationId,
          page: currentPage + 1,
          limit: 50,
        })
      ).unwrap();
    } catch (error) {
      console.error('[ChatConversation] Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, conversationId, currentPage, hasMore, isLoadingMore, isLoading]);

  /**
   * Render individual message
   */
  const renderMessage = ({ item }: { item: SimpleConversationMessage | { message: SimpleConversationMessage } }) => {
    // Defensive: handle case where item is wrapped in a 'message' field
    let actualItem: SimpleConversationMessage;
    if ('message' in item && typeof item.message === 'object' && item.message !== null && 'id' in item.message) {
      actualItem = item.message as SimpleConversationMessage;
    } else {
      actualItem = item as SimpleConversationMessage;
    }

    const isSent = actualItem.sender_id === currentUserId;
    const senderName = !isSent ? (actualItem.sender?.name || actualItem.Sender?.name || workerName) : undefined;

    // Defensive: ensure message is a string
    let messageText: string | null = null;
    if (typeof actualItem.message === 'string') {
      messageText = actualItem.message;
    } else if (actualItem.message && typeof actualItem.message === 'object') {
      // If message is an object with a 'message' field, extract it
      messageText = (actualItem.message as any)?.message || null;
    }

    return (
      <MessageBubble
        message={messageText}
        isSent={isSent}
        timestamp={actualItem.created_at}
        isRead={actualItem.is_read}
        senderName={senderName}
        imageUrl={actualItem.image_url}
        videoUrl={actualItem.video_url}
        isPending={actualItem.isPending}
        uploadError={actualItem.uploadError}
        localFileUri={actualItem.localFileUri}
      />
    );
  };

  /**
   * Render header with pagination loader
   */
  const renderListHeader = () => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#00a871" />
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#00a871" />
          <Text
            className="text-[#6B7280] text-sm mt-4"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Loading messages...
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-12">
        <Text
          className="text-[#6B7280] text-base"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          Start the conversation
        </Text>
        <Text
          className="text-[#9CA3AF] text-sm mt-2 text-center px-8"
          style={{ fontFamily: 'Inter-Regular' }}
        >
          Send a message to {workerName}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#E5E7EB]">
        {/* Back Button */}
        <TouchableOpacity
          onPress={onBack}
          className="mr-3 p-2 -ml-2"
          activeOpacity={0.7}
        >
          <BackIcon />
        </TouchableOpacity>

        {/* Worker Name */}
        <View className="flex-1">
          <Text
            className="text-[#111928] text-lg"
            style={{ fontFamily: 'Inter-SemiBold' }}
            numberOfLines={1}
          >
            {workerName}
          </Text>
          <Text
            className="text-[#6B7280] text-sm"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Worker
          </Text>
        </View>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item?.id?.toString() || `message-${index}`}
          contentContainerClassName="px-4 py-4"
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          inverted={false}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />

        {/* Chat Input */}
        <View className="pb-4">
          <ChatInput
            onSend={handleSendMessage}
            onSendWithFile={handleSendMessageWithFile}
            placeholder="Type a message..."
            disabled={isLoading && messages.length === 0}
            isSending={isSendingMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * Back icon SVG component
 */
const BackIcon: React.FC = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12l7 7M5 12l7-7"
      stroke="#111928"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ChatConversationScreen;
