// Chat Type Definitions

// User data structure (minimal fields for chat)
export interface ChatUser {
  id: number;
  ID?: number;
  name?: string;
  phone?: string;
  profile_image_url?: string;
  avatar?: string;
}

// Simple Conversation (1-on-1 chat between two users)
export interface SimpleConversation {
  id: number;
  user_1: number;
  user_2: number;
  last_message_id?: number;
  last_message_text?: string;
  last_message_created_at?: string;
  last_message_sender_id?: number;
  created_at: string;
  updated_at: string;
  // Optional user data populated by backend (backend uses snake_case)
  user_1_data?: ChatUser;
  user_2_data?: ChatUser;
  // Legacy PascalCase fields (for backwards compatibility)
  User1Data?: ChatUser;
  User2Data?: ChatUser;
}

// Simple Conversation Message
export interface SimpleConversationMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string | null;
  is_read: boolean;
  read_at: string | null;
  attachment_type?: 'image' | 'video' | null;
  image_url?: string | null;
  video_url?: string | null;
  cloudinary_public_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Optional sender data populated by backend
  Sender?: ChatUser;
  sender?: ChatUser; // Backend uses lowercase
  // Optional conversation data populated by backend
  conversation?: SimpleConversation;
  // Optimistic UI fields
  isPending?: boolean; // True while message is being uploaded
  uploadError?: string; // Error message if upload failed
  localFileUri?: string; // Local file URI for optimistic display
}

// Pagination info
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_more?: boolean;
}

// Chat Redux State
export interface ChatState {
  conversations: SimpleConversation[];
  messages: Record<number, SimpleConversationMessage[]>; // conversationId -> messages[]
  activeConversationId: number | null;
  pagination: {
    conversations: PaginationInfo | null;
    messages: Record<number, PaginationInfo>; // conversationId -> pagination
  };
  isLoading: boolean;
  isSendingMessage: boolean;
  error: string | null;
  unreadCounts: Record<number, number>; // conversationId -> unread count
  typingUsers: Record<number, number[]>; // conversationId -> typing user IDs
}

// API Request/Response Types

export interface CreateConversationRequest {
  user_1: number;
  user_2: number;
}

export interface CreateConversationResponse {
  success: boolean;
  data: {
    conversation: SimpleConversation;
  };
}

export interface GetConversationsResponse {
  success: boolean;
  data: SimpleConversation[];
  pagination?: PaginationInfo;
}

export interface GetConversationByIdResponse {
  success: boolean;
  data: {
    conversation: SimpleConversation;
  };
}

export interface GetMessagesResponse {
  success: boolean;
  data: SimpleConversationMessage[];
  pagination?: PaginationInfo;
}

export interface SendMessageRequest {
  message: string;
  attachment_type?: 'image' | 'video';
  image_url?: string;
  video_url?: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    message: SimpleConversationMessage;
  };
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
}

// WebSocket Types

export type WebSocketMessageType =
  | 'message'
  | 'conversation_message'
  | 'typing'
  | 'message_read'
  | 'pong'
  | 'error'
  | 'connection_status';

export interface WebSocketMessage {
  type?: WebSocketMessageType;
  event?: string; // Backend uses 'event' instead of 'type'
  conversation_id?: number;
  message?: SimpleConversationMessage; // Backend sends message directly at root level
  data?: {
    message?: SimpleConversationMessage;
    conversation_id?: number;
    user_id?: number;
    is_typing?: boolean;
    message_id?: number;
    read_at?: string;
  };
  error?: string;
  timestamp?: string;
}

export type WebSocketConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'reconnecting'
  | 'error';

export interface WebSocketState {
  status: WebSocketConnectionStatus;
  conversationId: number | null;
  error: string | null;
  reconnectAttempts: number;
  lastConnectedAt: string | null;
}

// Helper Types

export interface ChatNavigationParams {
  conversationId: number;
  workerId: number;
  workerName: string;
  workerPhone?: string;
  workerProfileImage?: string;
}

export interface WorkerInfo {
  id: number;
  name: string;
  phone?: string;
  profileImage?: string;
}
