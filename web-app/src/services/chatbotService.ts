const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ChatbotSession {
  session_id: string;
  is_active: boolean;
  last_message_at: string;
  current_context: Record<string, unknown>;
  query_type?: string;
  location: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  message_type: string;
  created_at: string;
  context?: Record<string, unknown>;
  data_results?: Record<string, unknown>;
  suggestions?: string[];
  needs_more_info?: boolean;
  next_step?: string;
}

export interface ChatbotSuggestion {
  id: number;
  text: string;
  action: string;
  action_data: Record<string, unknown>;
  category: string;
  priority: number;
  is_active: boolean;
  usage_count: number;
}

export interface CreateSessionRequest {
  user_id?: number;
  location: string;
  context?: Record<string, unknown>;
}

export interface SendMessageRequest {
  session_id: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ChatbotService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/chatbot`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Chatbot API request failed:", error);
      throw error;
    }
  }

  async createSession(
    request: CreateSessionRequest
  ): Promise<ApiResponse<ChatbotSession>> {
    return this.makeRequest<ChatbotSession>("/session", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getSession(sessionId: string): Promise<ApiResponse<ChatbotSession>> {
    return this.makeRequest<ChatbotSession>(`/session/${sessionId}`);
  }

  async sendMessage(
    request: SendMessageRequest
  ): Promise<ApiResponse<ChatMessage>> {
    return this.makeRequest<ChatMessage>(
      `/session/${request.session_id}/message`,
      {
        method: "POST",
        body: JSON.stringify({
          session_id: request.session_id,
          message: request.message,
          context: request.context || {},
        }),
      }
    );
  }

  async getSuggestions(
    category?: string,
    limit?: number
  ): Promise<ApiResponse<ChatbotSuggestion[]>> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/suggestions?${queryString}`
      : "/suggestions";

    return this.makeRequest<ChatbotSuggestion[]>(endpoint);
  }

  async getUserSessions(): Promise<ApiResponse<ChatbotSession[]>> {
    return this.makeRequest<ChatbotSession[]>("/sessions");
  }

  async deleteSession(sessionId: string): Promise<ApiResponse<null>> {
    return this.makeRequest<null>(`/session/${sessionId}`, {
      method: "DELETE",
    });
  }

  async healthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.makeRequest<Record<string, unknown>>("/health");
  }
}

export const chatbotService = new ChatbotService();
export default chatbotService;
