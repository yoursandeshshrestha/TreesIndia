import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

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

// Real-time subscription types
export interface RealtimeMessage {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: ChatMessage;
  old: ChatMessage | null;
}

export interface RealtimeRoom {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: ChatRoom;
  old: ChatRoom | null;
}
