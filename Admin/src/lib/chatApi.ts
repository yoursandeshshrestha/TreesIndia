import { apiClient } from "./api-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Chat API response types
export interface ChatRoomsResponse {
  chat_rooms: ChatRoom[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ChatRoomResponse {
  chat_room: ChatRoom;
}

export interface MessageResponse {
  message: ChatMessage;
}

// Chat message types
export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  message: string;
  message_type: "text" | "image" | "file" | "location" | "system";
  is_read: boolean;
  read_at: string | null;
  read_by: number[];
  attachments: string[];
  status: "sent" | "delivered" | "read" | "failed";
  reply_to_message_id: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  sender?: {
    id: number;
    name: string;
    avatar: string;
    user_type: string;
  };
}

// Chat room types
export interface ChatRoom {
  id: number;
  room_type: "booking" | "property" | "worker_inquiry";
  room_name: string;
  booking_id: number | null;
  property_id: number | null;
  worker_inquiry_id: number | null;
  is_active: boolean;
  last_message_at: string | null;
  closed_at: string | null;
  closed_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  chat_messages?: ChatMessage[];
  booking?: {
    id: number;
    booking_reference: string;
    status: string;
    user: {
      id: number;
      name: string;
      phone: string;
    };
    service: {
      id: number;
      name: string;
    };
  };
}

// Get all chat rooms (admin only)
export async function fetchAllChatRooms(params?: {
  page?: number;
  limit?: number;
}): Promise<ChatRoomsResponse> {
  try {
    const searchParams = new URLSearchParams();
    // Set defaults: page=1, limit=20
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${API_BASE_URL}/admin/chat/rooms?${searchParams.toString()}`;
    const response = await apiClient.get(url);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching all chat rooms:", error);
    throw error;
  }
}

// Get messages for a chat room
export async function fetchChatMessages(
  roomId: number,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<MessagesResponse> {
  try {
    const searchParams = new URLSearchParams();
    // Set defaults: page=1, limit=50
    const page = params?.page || 1;
    const limit = params?.limit || 50;

    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${API_BASE_URL}/chat/rooms/${roomId}/messages?${searchParams.toString()}`;
    const response = await apiClient.get(url);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
}

// Send a message (admin)
export async function sendAdminMessage(
  roomId: number,
  messageData: {
    message: string;
    message_type?: "text" | "image" | "file";
  }
): Promise<MessageResponse> {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/admin/chat/rooms/${roomId}/messages`,
      messageData
    );

    return response.data.data;
  } catch (error) {
    console.error("Error sending admin message:", error);
    throw error;
  }
}

// Close a chat room (admin only)
export async function closeChatRoom(roomId: number): Promise<void> {
  try {
    await apiClient.post(`${API_BASE_URL}/admin/chat/rooms/${roomId}/close`);
  } catch (error) {
    console.error("Error closing chat room:", error);
    throw error;
  }
}
