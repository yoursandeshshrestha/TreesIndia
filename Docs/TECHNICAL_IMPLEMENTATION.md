# TREESINDIA - Technical Implementation Guide

## 🎯 **Overview**

Technical implementation details for TREESINDIA's enhanced platform with three main modules: **Home Services**, **Construction Services**, and **Marketplace**.

---

## 🏗️ **System Architecture**

### **High-Level Architecture**

```
Frontend (Next.js + React Native) ↔ Backend API (GoLang) ↔ Database (PostgreSQL + Redis)
                ↓                           ↓                        ↓
        Real-time UI (WebSocket)    Real-time Services        File Storage
                ↓                           ↓                        ↓
        Integrations (Razorpay,     External Services        Analytics
        Twilio, Google Maps)        (Firebase, SMS)
```

### **Module Structure**

```
TREESINDIA Platform
├── Home Services Module
│   ├── Fixed Price Services (Time slots, Worker assignment)
│   └── Inquiry-based Services (Chat, Quote generation)
├── Construction Services Module
│   ├── Consultation Booking
│   ├── Quote Management
│   └── Project Tracking
└── Marketplace Module
    ├── Property Listings
    ├── Subscription Features
    └── Vendor/Workforce Management
```

---

## 🗄️ **Database Schema**

### **Core Tables**

#### **Users & Authentication**

```sql
-- Users with module access
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    module_access JSONB DEFAULT '{"home_services": true, "construction_services": true, "marketplace": true}',
    subscription_features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Module management
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);
```

#### **Service Management**

```sql
-- Categories with module types
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    module_type VARCHAR(20) DEFAULT 'home_service',
    parent_category_id BIGINT REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true
);

-- Services with service types
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL,
    category_id BIGINT REFERENCES categories(id),
    service_type VARCHAR(20) DEFAULT 'fixed_price',
    time_slot_duration INTEGER DEFAULT 60,
    max_workers INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);
```

#### **Worker Management**

```sql
-- Workers table
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    skills JSONB,
    service_areas TEXT[],
    working_hours JSONB,
    current_location JSONB,
    rating DECIMAL DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Worker assignments
CREATE TABLE worker_assignments (
    id SERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id),
    worker_id BIGINT REFERENCES workers(id),
    assigned_by BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'assigned'
);
```

#### **Booking System**

```sql
-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    service_id BIGINT REFERENCES services(id),
    worker_id BIGINT REFERENCES workers(id),
    booking_type VARCHAR(20), -- 'fixed_price', 'inquiry_based'
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_time TIMESTAMP,
    price DECIMAL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    address TEXT,
    description TEXT
);

-- Time slots
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id),
    worker_id BIGINT REFERENCES workers(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    is_available BOOLEAN DEFAULT true
);

-- Booking inquiries
CREATE TABLE booking_inquiries (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    service_id BIGINT REFERENCES services(id),
    requirements TEXT,
    budget DECIMAL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_response TEXT
);

-- Quotes
CREATE TABLE quotes (
    id SERIAL PRIMARY KEY,
    inquiry_id BIGINT REFERENCES booking_inquiries(id),
    amount DECIMAL,
    breakdown JSONB,
    validity_days INTEGER DEFAULT 7,
    status VARCHAR(20) DEFAULT 'pending'
);
```

#### **Real-time Communication**

```sql
-- Chat conversations
CREATE TABLE chat_conversations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    worker_id BIGINT REFERENCES workers(id),
    booking_id BIGINT REFERENCES bookings(id),
    status VARCHAR(20) DEFAULT 'active'
);

-- Chat messages
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES chat_conversations(id),
    sender_id BIGINT REFERENCES users(id),
    message TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT false
);

-- Location tracking
CREATE TABLE location_tracking (
    id SERIAL PRIMARY KEY,
    worker_id BIGINT REFERENCES workers(id),
    booking_id BIGINT REFERENCES bookings(id),
    latitude DECIMAL,
    longitude DECIMAL,
    status VARCHAR(20) -- 'on_way', 'arrived', 'working'
);

-- Call masking
CREATE TABLE call_masking (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    worker_id BIGINT REFERENCES workers(id),
    masked_number VARCHAR(20),
    original_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP
);
```

---

## 🔧 **Backend Implementation**

### **API Endpoints**

#### **Authentication**

```go
POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/auth/refresh-token
POST /api/auth/logout
```

#### **Home Services**

```go
GET /api/home-services/categories
GET /api/home-services/services/{category_id}
GET /api/home-services/timeslots
POST /api/home-services/book-fixed
POST /api/home-services/submit-inquiry
GET /api/home-services/inquiries
POST /api/home-services/accept-quote
```

#### **Construction Services**

```go
GET /api/construction-services/types
POST /api/construction-services/book-consultation
GET /api/construction-services/consultations
POST /api/construction-services/generate-quote
POST /api/construction-services/accept-quote
```

#### **Marketplace**

```go
GET /api/marketplace/properties
POST /api/marketplace/properties
GET /api/marketplace/vendors
GET /api/marketplace/workforce
POST /api/marketplace/projects
GET /api/marketplace/subscription-features
```

#### **Worker Management**

```go
GET /api/workers
POST /api/workers
PUT /api/workers/{id}
POST /api/workers/assign
GET /api/workers/location/{id}
POST /api/workers/location
```

#### **Real-time Communication**

```go
GET /api/chat/conversations
POST /api/chat/send-message
GET /api/chat/messages/{conversation_id}
POST /api/calls/mask-number
POST /api/calls/initiate
```

### **Core Services**

#### **Booking Service**

```go
type BookingService interface {
    CreateFixedPriceBooking(booking FixedPriceBookingRequest) (*Booking, error)
    CreateInquiryBooking(inquiry InquiryRequest) (*BookingInquiry, error)
    GetAvailableTimeSlots(serviceID int64, date time.Time) ([]TimeSlot, error)
    AssignWorker(bookingID int64, workerID int64) error
    UpdateBookingStatus(bookingID int64, status string) error
}

type FixedPriceBookingRequest struct {
    UserID      int64     `json:"user_id"`
    ServiceID   int64     `json:"service_id"`
    TimeSlotID  int64     `json:"time_slot_id"`
    Address     string    `json:"address"`
    Description string    `json:"description"`
    ScheduledAt time.Time `json:"scheduled_at"`
}
```

#### **Worker Service**

```go
type WorkerService interface {
    CreateWorker(worker WorkerRequest) (*Worker, error)
    UpdateWorker(workerID int64, updates WorkerUpdateRequest) error
    AssignWorker(bookingID int64, workerID int64) error
    GetWorkerLocation(workerID int64) (*Location, error)
    UpdateWorkerLocation(workerID int64, location Location) error
    GetAvailableWorkers(serviceID int64, timeSlot time.Time) ([]Worker, error)
}

type WorkerRequest struct {
    UserID       int64           `json:"user_id"`
    Skills       []string        `json:"skills"`
    ServiceAreas []string        `json:"service_areas"`
    WorkingHours WorkingHours    `json:"working_hours"`
}
```

#### **Quote Service**

```go
type QuoteService interface {
    GenerateQuote(inquiryID int64, quote QuoteRequest) (*Quote, error)
    AcceptQuote(quoteID int64, userID int64) error
    GetQuote(quoteID int64) (*Quote, error)
    GetUserQuotes(userID int64) ([]Quote, error)
}

type QuoteRequest struct {
    Amount        decimal.Decimal `json:"amount"`
    Breakdown     []QuoteItem     `json:"breakdown"`
    ValidityDays  int             `json:"validity_days"`
    AdminNotes    string          `json:"admin_notes"`
}
```

### **Real-time Communication**

#### **WebSocket Implementation**

```go
type WebSocketHub struct {
    clients    map[*Client]bool
    broadcast  chan []byte
    register   chan *Client
    unregister chan *Client
    mutex      sync.RWMutex
}

type Client struct {
    hub      *WebSocketHub
    conn     *websocket.Conn
    send     chan []byte
    userID   int64
    userType string
}

func (h *WebSocketHub) run() {
    for {
        select {
        case client := <-h.register:
            h.mutex.Lock()
            h.clients[client] = true
            h.mutex.Unlock()

        case client := <-h.unregister:
            h.mutex.Lock()
            delete(h.clients, client)
            close(client.send)
            h.mutex.Unlock()

        case message := <-h.broadcast:
            h.mutex.RLock()
            for client := range h.clients {
                select {
                case client.send <- message:
                default:
                    close(client.send)
                    delete(h.clients, client)
                }
            }
            h.mutex.RUnlock()
        }
    }
}
```

#### **Chat Service**

```go
type ChatService interface {
    CreateConversation(userID, workerID, bookingID int64) (*ChatConversation, error)
    SendMessage(conversationID int64, senderID int64, message string) (*ChatMessage, error)
    GetConversationMessages(conversationID int64) ([]ChatMessage, error)
    GetUserConversations(userID int64) ([]ChatConversation, error)
    MarkMessageAsRead(messageID int64) error
}

type ChatMessage struct {
    ID             int64     `json:"id"`
    ConversationID int64     `json:"conversation_id"`
    SenderID       int64     `json:"sender_id"`
    Message        string    `json:"message"`
    MessageType    string    `json:"message_type"`
    IsRead         bool      `json:"is_read"`
    CreatedAt      time.Time `json:"created_at"`
}
```

---

## 🎨 **Frontend Implementation**

### **Component Structure**

#### **Home Services Module**

```typescript
// Service Categories Component
interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  services: Service[];
}

// Service Booking Component
interface ServiceBooking {
  serviceId: number;
  timeSlotId: number;
  address: string;
  description: string;
  scheduledAt: Date;
}

// Time Slot Selection Component
interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  workerId?: number;
}

// Worker Tracking Component
interface WorkerLocation {
  workerId: number;
  latitude: number;
  longitude: number;
  status: "on_way" | "arrived" | "working";
  eta?: number;
}
```

#### **Real-time Features**

```typescript
// WebSocket Service
class WebSocketService {
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string, private token: string) {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(`${this.url}?token=${this.token}`);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.reconnect();
    };
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case "chat_message":
        this.handleChatMessage(data);
        break;
      case "location_update":
        this.handleLocationUpdate(data);
        break;
      case "booking_update":
        this.handleBookingUpdate(data);
        break;
    }
  }

  sendMessage(type: string, payload: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
}

// Chat Component
interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  message: string;
  messageType: "text" | "image" | "file";
  isRead: boolean;
  createdAt: Date;
}

// Location Tracking Component
interface LocationTracking {
  workerId: number;
  latitude: number;
  longitude: number;
  status: string;
  eta?: number;
  lastUpdated: Date;
}
```

### **State Management**

#### **Redux Store Structure**

```typescript
interface AppState {
  auth: AuthState;
  homeServices: HomeServicesState;
  constructionServices: ConstructionServicesState;
  marketplace: MarketplaceState;
  workers: WorkersState;
  chat: ChatState;
  location: LocationState;
}

interface HomeServicesState {
  categories: ServiceCategory[];
  services: Service[];
  timeSlots: TimeSlot[];
  bookings: Booking[];
  inquiries: BookingInquiry[];
  loading: boolean;
  error: string | null;
}

interface WorkersState {
  workers: Worker[];
  assignments: WorkerAssignment[];
  locations: WorkerLocation[];
  loading: boolean;
  error: string | null;
}

interface ChatState {
  conversations: ChatConversation[];
  messages: Record<number, ChatMessage[]>;
  activeConversation: number | null;
  loading: boolean;
  error: string | null;
}
```

---

## 🔐 **Security Implementation**

### **Authentication & Authorization**

```go
// JWT Middleware
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "Authorization header required"})
            c.Abort()
            return
        }

        claims, err := validateToken(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Set("user_id", claims.UserID)
        c.Set("user_type", claims.UserType)
        c.Next()
    }
}

// Role-based Authorization
func RequireRole(roles ...string) gin.HandlerFunc {
    return func(c *gin.Context) {
        userType := c.GetString("user_type")

        for _, role := range roles {
            if userType == role {
                c.Next()
                return
            }
        }

        c.JSON(403, gin.H{"error": "Insufficient permissions"})
        c.Abort()
    }
}
```

### **Data Validation**

```go
// Booking Validation
func ValidateBookingRequest(req FixedPriceBookingRequest) error {
    if req.UserID <= 0 {
        return errors.New("invalid user ID")
    }

    if req.ServiceID <= 0 {
        return errors.New("invalid service ID")
    }

    if req.TimeSlotID <= 0 {
        return errors.New("invalid time slot ID")
    }

    if req.Address == "" {
        return errors.New("address is required")
    }

    if req.ScheduledAt.Before(time.Now()) {
        return errors.New("scheduled time must be in the future")
    }

    return nil
}
```

---

## 📊 **Performance Optimization**

### **Database Optimization**

```sql
-- Indexes for performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_time ON bookings(scheduled_time);

CREATE INDEX idx_time_slots_service_id ON time_slots(service_id);
CREATE INDEX idx_time_slots_worker_id ON time_slots(worker_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);

CREATE INDEX idx_workers_skills ON workers USING GIN(skills);
CREATE INDEX idx_workers_service_areas ON workers USING GIN(service_areas);

CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_location_tracking_worker_id ON location_tracking(worker_id);
CREATE INDEX idx_location_tracking_updated_at ON location_tracking(updated_at);
```

### **Caching Strategy**

```go
// Redis Cache Implementation
type CacheService struct {
    client *redis.Client
}

func (c *CacheService) Set(key string, value interface{}, expiration time.Duration) error {
    data, err := json.Marshal(value)
    if err != nil {
        return err
    }
    return c.client.Set(context.Background(), key, data, expiration).Err()
}

func (c *CacheService) Get(key string, dest interface{}) error {
    data, err := c.client.Get(context.Background(), key).Bytes()
    if err != nil {
        return err
    }
    return json.Unmarshal(data, dest)
}

// Cache Keys
const (
    CacheKeyServiceCategories = "service_categories"
    CacheKeyTimeSlots        = "time_slots:%d:%s" // service_id:date
    CacheKeyWorkerLocation   = "worker_location:%d" // worker_id
    CacheKeyUserBookings     = "user_bookings:%d" // user_id
)
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**

```go
// Service Tests
func TestBookingService_CreateFixedPriceBooking(t *testing.T) {
    // Arrange
    mockRepo := &MockBookingRepository{}
    service := NewBookingService(mockRepo)

    req := FixedPriceBookingRequest{
        UserID:      1,
        ServiceID:   1,
        TimeSlotID:  1,
        Address:     "Test Address",
        ScheduledAt: time.Now().Add(time.Hour),
    }

    mockRepo.On("CreateBooking", mock.Anything).Return(&Booking{ID: 1}, nil)

    // Act
    booking, err := service.CreateFixedPriceBooking(req)

    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, booking)
    assert.Equal(t, int64(1), booking.ID)
    mockRepo.AssertExpectations(t)
}
```

### **Integration Tests**

```go
// API Integration Tests
func TestBookingAPI_CreateFixedPriceBooking(t *testing.T) {
    // Setup
    router := setupTestRouter()

    // Test data
    reqBody := `{
        "service_id": 1,
        "time_slot_id": 1,
        "address": "Test Address",
        "description": "Test Description",
        "scheduled_at": "2024-01-15T14:00:00Z"
    }`

    // Execute
    req := httptest.NewRequest("POST", "/api/home-services/book-fixed", strings.NewReader(reqBody))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer test-token")

    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // Assert
    assert.Equal(t, http.StatusCreated, w.Code)

    var response map[string]interface{}
    err := json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)
    assert.NotNil(t, response["booking_id"])
}
```

---

## 🚀 **Deployment Strategy**

### **Docker Configuration**

```dockerfile
# Backend Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/main .
COPY --from=builder /app/config ./config

EXPOSE 8080
CMD ["./main"]
```

```yaml
# Docker Compose
version: "3.8"
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=treesindia
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### **Environment Configuration**

```env
# Production Environment
DB_HOST=production-db-host
DB_PORT=5432
DB_NAME=treesindia_prod
DB_USER=app_user
DB_PASSWORD=secure_password

REDIS_HOST=production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=rzp_test_key
RAZORPAY_KEY_SECRET=razorpay_secret

TWILIO_ACCOUNT_SID=twilio_account_sid
TWILIO_AUTH_TOKEN=twilio_auth_token

GOOGLE_MAPS_API_KEY=google_maps_api_key
FIREBASE_SERVER_KEY=firebase_server_key
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Core Infrastructure**

- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic API structure
- [ ] Docker configuration
- [ ] CI/CD pipeline setup

### **Phase 2: Home Services Module**

- [ ] Service categories and listings
- [ ] Fixed price booking system
- [ ] Inquiry-based booking system
- [ ] Time slot management
- [ ] Worker assignment system

### **Phase 3: Real-time Features**

- [ ] WebSocket implementation
- [ ] Chat system
- [ ] Location tracking
- [ ] Call masking integration
- [ ] Push notifications

### **Phase 4: Construction Services**

- [ ] Consultation booking
- [ ] Quote generation system
- [ ] Project tracking
- [ ] Milestone payments

### **Phase 5: Marketplace**

- [ ] Property listings
- [ ] Subscription system
- [ ] Vendor management
- [ ] Workforce directory

### **Phase 6: Testing & Optimization**

- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Security audit

### **Phase 7: Deployment**

- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Analytics implementation
- [ ] Documentation completion

---

This technical implementation guide provides a comprehensive roadmap for building the enhanced TREESINDIA platform with all the required features and capabilities.
