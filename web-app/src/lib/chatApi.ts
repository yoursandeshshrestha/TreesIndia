import { authenticatedFetch } from "./auth-api";
import { ChatMessage, ChatRoom } from "@/lib/supabase";

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

// Get user's chat rooms
export async function fetchUserChatRooms(params?: {
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

    const url = `${API_BASE_URL}/chat/rooms?${searchParams.toString()}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user chat rooms:", error);
    throw error;
  }
}

// Get chat history (including closed rooms)
export async function fetchChatHistory(params?: {
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

    const url = `${API_BASE_URL}/chat/history?${searchParams.toString()}`;
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
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
    const response = await authenticatedFetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
}

// Send a message
export async function sendChatMessage(
  roomId: number,
  messageData: {
    message: string;
    message_type?: "text" | "image" | "file";
  }
): Promise<MessageResponse> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/chat/rooms/${roomId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: number): Promise<void> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/chat/messages/${messageId}/read`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

// Get or create chat room for a booking
export async function fetchBookingChatRoom(
  bookingId: number
): Promise<ChatRoomResponse> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/chat/bookings/${bookingId}/room`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching booking chat room:", error);
    throw error;
  }
}
