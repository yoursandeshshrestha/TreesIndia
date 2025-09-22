
# In-App Notifications Documentation

This document outlines the implementation of the in-app notification system in the backend (Go) and the web app (Next.js). It is intended to be a reference for implementing the same functionality in the Flutter application.

## Backend (Go)

The backend uses a combination of REST APIs and WebSockets to handle in-app notifications.

### REST APIs

The REST APIs are used for fetching notifications, marking them as read, and getting notification counts.

**Base URL:** `/api/v1/in-app-notifications`

**Authentication:** All endpoints require user authentication.

| Method | Endpoint                  | Description                                   |
| ------ | ------------------------- | --------------------------------------------- |
| `GET`  | `/`                       | Get a paginated list of notifications.        |
| `GET`  | `/unread-count`           | Get the number of unread notifications.       |
| `PATCH`| `/read-all`               | Mark all notifications as read.               |
| `GET`  | `/stats`                  | Get notification statistics.                  |

**Query Parameters for `GET /`:**

*   `limit`: Number of notifications per page (default: 20, max: 100).
*   `page`: Page number (default: 1).
*   `type`: Filter by notification type.
*   `is_read`: Filter by read status.

### WebSocket

WebSockets are used for real-time notification updates.

**Endpoint:** `ws://localhost:8080/api/v1/in-app-notifications/ws`

**Authentication:** The WebSocket connection is authenticated using a JWT token passed as a query parameter: `?token=<jwt_token>`.

#### WebSocket Events

**Client to Server:**

*   `join`: Sent when a client joins the notification channel.
*   `mark_read`: Sent to mark a specific notification as read.
    *   **Data:** `{ "notification_id": <number> }`
*   `mark_all_read`: Sent to mark all notifications as read.
*   `ping`: Sent to keep the connection alive.

**Server to Client:**

*   `new_notification`: Sent when a new notification is created.
    *   **Data:** The notification object.
*   `unread_count_update`: Sent when the unread count changes.
    *   **Data:** `{ "unread_count": <number> }`
*   `notification_read`: Sent when a notification is marked as read.
    *   **Data:** `{ "notification_id": <number>, "is_read": true }`
*   `all_notifications_read`: Sent when all notifications are marked as read.
*   `pong`: Sent in response to a `ping`.

### Key Backend Files

*   `controllers/in_app_notification_controller.go`: Defines the REST API handlers.
*   `controllers/notification_websocket_controller.go`: Handles WebSocket connections and events.
*   `routes/in_app_notification_routes.go`: Defines the API and WebSocket routes.
*   `services/in_app_notification_service.go`: Contains the business logic for creating, fetching, and managing notifications.
*   `services/notification_websocket_service.go`: Manages WebSocket clients and broadcasting messages.

## Web App (Next.js)

The web app uses React hooks and a WebSocket service to interact with the backend notification system.

### WebSocket Handling

The `notificationWebSocketService` singleton (`src/services/notificationWebSocketService.ts`) manages the WebSocket connection.

*   **`connect(token)`:** Establishes a connection to the WebSocket server.
*   **`disconnect()`:** Closes the WebSocket connection.
*   **`send(message)`:** Sends a message to the WebSocket server.

The `useNotificationWebSocket` hook (`src/hooks/useNotificationWebSocket.ts`) provides a simple interface for components to interact with the WebSocket service. It automatically connects and disconnects based on the user's authentication state.

### Data Fetching and State Management

*   **`@tanstack/react-query`** is used for fetching and caching data from the REST APIs.
*   **`zustand`** (via `notificationStore` in `src/utils/notificationStore.ts`) is used for managing the local state of notifications, including the unread count and the list of notifications.

### Key Frontend Files

*   `lib/notificationApi.ts`: Contains functions for making API calls to the backend REST endpoints.
*   `hooks/useNotifications.ts`: Provides React hooks (`useNotifications`, `useUnreadCount`, `useMarkAllAsRead`) for components to fetch and manage notification data.
*   `hooks/useNotificationWebSocket.ts`: A hook for managing the WebSocket connection and handling real-time events.
*   `services/notificationWebSocketService.ts`: A singleton service that encapsulates the WebSocket logic.
*   `utils/notificationStore.ts`: A Zustand store for managing notification state.
*   `components/NotificationDropdown.tsx`: An example of a UI component that uses the hooks to display notifications.

## Flutter Implementation Guide

Based on the above, here is a suggested approach for the Flutter implementation:

1.  **API Client:** Create a service to interact with the backend REST APIs for notifications. This will involve making HTTP requests to the endpoints listed above.
2.  **WebSocket Client:** Use a WebSocket library (like `web_socket_channel`) to connect to the WebSocket endpoint.
    *   Remember to pass the JWT token for authentication.
    *   Implement the logic for handling incoming WebSocket events and sending outgoing events.
3.  **State Management:** Use a state management solution (like Provider, BLoC, or Riverpod) to manage the notification state, including the list of notifications and the unread count.
4.  **Real-time Updates:** When the WebSocket client receives an update, update the state accordingly. For example, when a `new_notification` event is received, add the new notification to the list and update the unread count.
5.  **UI:** Create UI components to display the notifications and the unread count. These components should be connected to the state management solution to automatically update when the state changes.
