import { useRouter } from "next/navigation";
import {
  OptimizedBookingResponse,
  DetailedBookingResponse,
} from "@/types/booking";

// Helper type for user objects that might have different ID field names
type UserWithId = {
  id?: number;
  ID?: number;
};

/**
 * Utility function to navigate to chat page with user context
 * @param router - Next.js router instance
 * @param booking - Booking object containing user information
 */
export const navigateToChat = (
  router: ReturnType<typeof useRouter>,
  booking: OptimizedBookingResponse | DetailedBookingResponse
) => {
  // Navigate to chat page with user context
  // The chat page will handle finding or creating a conversation with the user
  router.push("/dashboard/communication/chat");

  // Store user context in sessionStorage for the chat page to pick up
  if (typeof window !== "undefined") {
    // Handle both lowercase 'id' and uppercase 'ID' for user
    const userWithId = booking.user as UserWithId;
    const userId = userWithId.id || userWithId.ID;
    const userName = booking.user.name;
    const userPhone = booking.user.phone;
    const bookingId = 'id' in booking ? booking.id : booking.ID; // Handle both cases
    
    if (!userId) {
      console.error("Failed to extract user ID from booking:", { 
        booking, 
        user: booking.user,
        userId 
      });
      throw new Error("Unable to extract user ID from booking");
    }
    
    const userContext = {
      userId: userId,
      userName: userName,
      userPhone: userPhone,
      bookingId: bookingId,
      bookingReference: booking.booking_reference,
      timestamp: Date.now(),
    };

    console.log("Storing chat user context:", userContext);
    sessionStorage.setItem("chatUserContext", JSON.stringify(userContext));
  }
};

/**
 * Get stored chat user context from sessionStorage
 */
export const getChatUserContext = () => {
  if (typeof window === "undefined") return null;

  try {
    const context = sessionStorage.getItem("chatUserContext");
    if (!context) return null;

    const parsed = JSON.parse(context);

    // Check if context is not too old (5 minutes)
    const isRecent = Date.now() - parsed.timestamp < 5 * 60 * 1000;
    if (!isRecent) {
      sessionStorage.removeItem("chatUserContext");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error parsing chat user context:", error);
    sessionStorage.removeItem("chatUserContext");
    return null;
  }
};

/**
 * Clear stored chat user context
 */
export const clearChatUserContext = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("chatUserContext");
  }
};
