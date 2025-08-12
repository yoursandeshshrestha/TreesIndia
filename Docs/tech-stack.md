# TREESINDIA - Technology Stack

## 🎯 **Overview**

TREESINDIA is a unified digital platform combining home services and real estate marketplace with advanced features like AI assistance, call masking, and privacy protection. This document outlines the complete technology stack for the application.

---

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   Next.js Web   │    │   Go Backend    │
│   (iOS/Android) │    │  (Admin Panel)  │    │   (API Server)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Supabase     │
                    │  (Database +    │
                    │   Auth + API)   │
                    └─────────────────┘
```

---

## 📱 **Frontend Stack**

### **Mobile Applications**

- **Framework**: Flutter 3.x
- **Language**: Dart
- **State Management**: Riverpod
- **Architecture**: Clean Architecture with BLoC pattern
- **UI Framework**: Material Design 3
- **Icons**: Fluent Icons
- **Navigation**: GoRouter
- **HTTP Client**: Dio
- **Local Storage**: Hive
- **Image Handling**: Cached Network Image
- **Maps**: Google Maps Flutter
- **Push Notifications**: Firebase Messaging

### **Web Applications**

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios/TanStack Query
- **Authentication**: NextAuth.js
- **Real-time**: Socket.io Client

---

## 🔧 **Backend Stack**

### **Primary Backend**

- **Language**: Go (Golang) 1.21+
- **Framework**: Gin/Echo
- **Architecture**: MVC Pattern (Model-View-Controller)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Validation**: Go-playground/validator
- **Configuration**: Viper
- **Logging**: Logrus/Zap

### **Database Layer**

- **ORM**: GORM
- **Database Driver**: PostgreSQL (via Supabase)
- **Migrations**: GORM Auto-migration
- **Connection Pooling**: Built-in GORM pooling
- **Query Builder**: GORM Query Interface

### **MVC Architecture Structure**

```
backend/
├── controllers/          # Handle HTTP requests and responses
│   ├── auth.go
│   ├── user.go
│   ├── service.go
│   ├── property.go
│   └── booking.go
├── models/              # Data models and database schema
│   ├── user.go
│   ├── service.go
│   ├── property.go
│   ├── booking.go
│   └── review.go
├── views/               # JSON responses and data formatting
│   ├── response.go
│   ├── user_view.go
│   └── error_view.go
├── routes/              # Route definitions and middleware
│   ├── auth_routes.go
│   ├── user_routes.go
│   └── api_routes.go
├── middleware/          # Custom middleware
│   ├── auth.go
│   ├── cors.go
│   └── logging.go
├── config/              # Configuration management
│   └── database.go
└── main.go
```

---

## 🗄️ **Database & External Services**

### **Supabase (Primary Database)**

- **Database**: PostgreSQL (Managed)
- **Authentication**: Built-in Auth with JWT
- **Real-time**: WebSocket subscriptions
- **API**: Auto-generated REST and GraphQL APIs
- **Edge Functions**: Serverless functions
- **Dashboard**: Built-in admin interface

### **External Integrations**

- **Payment Processing**: Razorpay
- **SMS & Call Masking**: Twilio
- **Maps & Location**: Google Maps API
- **Push Notifications**: Firebase Cloud Messaging
- **AI Chatbot**: OpenAI GPT-4
- **Email Service**: SendGrid/Resend
- **File Storage**: Cloudinary

---

## ☁️ **Cloud Infrastructure**

### **Phase 1: MVP**

- **Backend Hosting**: Hostinger VPS
- **Database**: Supabase (Free Tier)
- **File Storage**: Cloudinary
- **CDN**: Cloudflare
- **Domain**: Custom domain with SSL

### **Phase 2: Scale**

- **Backend Hosting**: AWS EC2/DigitalOcean App Platform
- **Database**: Supabase Pro
- **File Storage**: Cloudinary Pro
- **CDN**: Cloudflare Pro
- **Load Balancer**: Nginx/AWS ALB

### **Phase 3: Enterprise**

- **Backend Hosting**: AWS ECS/Kubernetes
- **Database**: Supabase Enterprise
- **File Storage**: Cloudinary Enterprise
- **CDN**: AWS CloudFront
- **Monitoring**: AWS CloudWatch + Sentry

---

## 🔐 **Security & Authentication**

### **Authentication System**

- **Primary**: Supabase Auth
- **Fallback**: Custom JWT implementation
- **Social Login**: Google OAuth
- **Phone Auth**: SMS OTP via Twilio
- **Session Management**: JWT tokens
- **Password Security**: bcrypt hashing

### **Authorization**

- **Role-Based Access Control (RBAC)**
- **API Security**: JWT middleware
- **Rate Limiting**: Gin rate limiter
- **CORS**: Configured for mobile and web
- **Data Encryption**: At rest and in transit

---

## 📊 **Data Models & Schema**

### **Core Entities**

```go
// User Management
type User struct {
    gorm.Model
    Name         string    `json:"name"`
    Email        string    `json:"email" gorm:"unique"`
    Phone        string    `json:"phone" gorm:"unique"`
    UserType     string    `json:"user_type"` // user, worker, admin
    KYCVerified  bool      `json:"kyc_verified"`
    Location     string    `json:"location"`
    Avatar       string    `json:"avatar"`
    IsActive     bool      `json:"is_active" gorm:"default:true"`
}

// Service Management
type Service struct {
    gorm.Model
    Name          string  `json:"name"`
    Description   string  `json:"description"`
    BasePrice     float64 `json:"base_price"`
    ServiceType   string  `json:"service_type"` // direct, inquiry
    MaxRadius     int     `json:"max_radius"`
    CoverageAreas string  `json:"coverage_areas"`
    IsActive      bool    `json:"is_active"`
    Icon          string  `json:"icon"`
}

// Property Management
type Property struct {
    gorm.Model
    Title         string  `json:"title"`
    Description   string  `json:"description"`
    Price         float64 `json:"price"`
    PropertyType  string  `json:"property_type"`
    Location      string  `json:"location"`
    OwnerID       uint    `json:"owner_id"`
    Owner         User    `json:"owner"`
    IsVerified    bool    `json:"is_verified"`
    Status        string  `json:"status"`
    Images        string  `json:"images"`
    Amenities     string  `json:"amenities"`
}

// Booking System
type Booking struct {
    gorm.Model
    UserID        uint    `json:"user_id"`
    User          User    `json:"user"`
    ServiceID     uint    `json:"service_id"`
    Service       Service `json:"service"`
    WorkerID      uint    `json:"worker_id"`
    Worker        User    `json:"worker"`
    Status        string  `json:"status"`
    ScheduledDate time.Time `json:"scheduled_date"`
    Address       string  `json:"address"`
    Description   string  `json:"description"`
    Price         float64 `json:"price"`
    PaymentStatus string  `json:"payment_status"`
    OTP           string  `json:"otp"`
    CompletedAt   *time.Time `json:"completed_at"`
}

// Review System
type Review struct {
    gorm.Model
    UserID      uint    `json:"user_id"`
    User        User    `json:"user"`
    WorkerID    uint    `json:"worker_id"`
    Worker      User    `json:"worker"`
    BookingID   uint    `json:"booking_id"`
    Booking     Booking `json:"booking"`
    Rating      int     `json:"rating"`
    Comment     string  `json:"comment"`
    IsPublished bool    `json:"is_published"`
}
```

---

## 🔄 **API Architecture**

### **REST API Endpoints**

```
/api/v1/
├── auth/
│   ├── login
│   ├── register
│   ├── logout
│   └── refresh
├── users/
│   ├── profile
│   ├── update
│   └── kyc
├── services/
│   ├── list
│   ├── create
│   ├── update
│   └── delete
├── properties/
│   ├── list
│   ├── create
│   ├── update
│   └── delete
├── bookings/
│   ├── create
│   ├── list
│   ├── update
│   └── complete
├── payments/
│   ├── create
│   ├── verify
│   └── refund
└── ai/
    ├── chat
    └── recommendations
```

### **WebSocket Events**

```go
// Real-time events
type WebSocketEvent struct {
    Type    string      `json:"type"`
    Payload interface{} `json:"payload"`
    UserID  uint        `json:"user_id"`
}

// Event types
const (
    EventBookingCreated = "booking_created"
    EventBookingUpdated = "booking_updated"
    EventPaymentSuccess = "payment_success"
    EventMessageReceived = "message_received"
    EventServiceCompleted = "service_completed"
)
```

---

## 🚀 **Development Workflow**

### **Version Control**

- **Repository**: GitHub
- **Branch Strategy**: Git Flow
- **CI/CD**: GitHub Actions
- **Code Review**: Pull Request workflow

### **Environment Management**

```bash
# Environment files
.env.local          # Local development
.env.staging        # Staging environment
.env.production     # Production environment

# Environment variables
DATABASE_URL=postgresql://username:password@supabase-host:5432/treesindia
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
RAZORPAY_KEY=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
OPENAI_API_KEY=your-openai-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 📈 **Monitoring & Analytics**

### **Application Monitoring**

- **Error Tracking**: Sentry
- **Performance**: New Relic/DataDog
- **Logging**: ELK Stack/LogRocket
- **Uptime**: Pingdom/UptimeRobot

### **Business Analytics**

- **User Analytics**: PostHog/Mixpanel
- **Revenue Tracking**: Custom analytics
- **Performance Metrics**: Custom dashboards
- **A/B Testing**: PostHog

---

## 🔧 **Development Tools**

### **IDE & Extensions**

- **Go**: GoLand/VSCode with Go extension
- **Flutter**: Android Studio/VSCode with Flutter extension
- **Web**: VSCode with TypeScript/React extensions
- **Database**: Supabase Studio/DBeaver

### **Package Management**

```bash
# Go modules
go mod tidy
go mod vendor

# Flutter packages
flutter pub get
flutter pub upgrade

# Node.js packages
npm install
npm update
```

---

## 📋 **Deployment Checklist**

### **Pre-deployment**

- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Monitoring setup complete

### **Deployment Steps**

1. **Backup Database**: Supabase backup
2. **Deploy Backend**: VPS deployment
3. **Deploy Web App**: Vercel/Netlify
4. **Deploy Mobile Apps**: App Store/Play Store
5. **Update DNS**: Point to new servers
6. **Monitor**: Check all services

### **Post-deployment**

- [ ] Health checks passing
- [ ] All integrations working
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Backup verification
- [ ] User notifications sent

---

## 🎯 **Performance Targets**

### **Response Times**

- **API Response**: <200ms average
- **Mobile App**: <2s cold start
- **Web App**: <1s page load
- **Database Queries**: <100ms average

### **Scalability**

- **Concurrent Users**: 10,000+ daily active users
- **Database**: Handle 1M+ records
- **File Storage**: 10TB+ capacity
- **API Rate Limit**: 1000 requests/minute/user

---

## 🔮 **Future Considerations**

### **Phase 2 Enhancements**

- **Microservices**: Service decomposition
- **Event Sourcing**: CQRS pattern
- **Machine Learning**: Recommendation engine
- **Blockchain**: Smart contracts for payments

### **Phase 3 Scaling**

- **Kubernetes**: Container orchestration
- **Service Mesh**: Istio/Linkerd
- **Multi-region**: Global deployment
- **Edge Computing**: CDN edge functions

---

## 📞 **Support & Maintenance**

### **Documentation**

- **API Documentation**: Swagger UI
- **Code Documentation**: GoDoc
- **User Guides**: Notion/Wiki
- **Developer Guides**: GitHub Wiki

### **Support Channels**

- **Technical Support**: GitHub Issues
- **User Support**: Intercom/Zendesk
- **Emergency Contacts**: PagerDuty
- **Monitoring Alerts**: Slack/Email

---

## 🗂️ **File Storage with Cloudinary**

### **Cloudinary Integration**

- **Primary Storage**: Cloudinary
- **Image Optimization**: Automatic resizing and compression
- **Video Support**: Video upload and streaming
- **Transformations**: Real-time image transformations
- **CDN**: Global content delivery network

### **File Upload Flow**

```go
// Example Cloudinary upload
type CloudinaryService struct {
    CloudName string
    APIKey    string
    APISecret string
}

func (c *CloudinaryService) UploadImage(file multipart.File) (string, error) {
    // Upload to Cloudinary
    // Return public URL
}
```

### **Supported File Types**

- **Images**: JPG, PNG, WebP, AVIF
- **Videos**: MP4, MOV, AVI
- **Documents**: PDF, DOC, DOCX
- **Audio**: MP3, WAV, AAC

---

**TREESINDIA Tech Stack** - Built for scale, performance, and developer experience.
