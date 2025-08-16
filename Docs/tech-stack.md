# TREESINDIA - Technology Stack

## 🎯 **Overview**

TREESINDIA is a unified digital platform with two main modules (Home Services, Real Estate), featuring a credit system, wallet system, and subscription model. The platform uses simplified phone+OTP authentication and credit-based property posting with Razorpay integration.

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
│   ├── credit.go
│   ├── wallet.go
│   ├── subscription.go
│   ├── service.go

│   ├── property.go
│   └── admin_config.go
├── models/              # Data models and database schema
│   ├── user.go
│   ├── admin_config.go
│   ├── wallet_transaction.go
│   ├── subscription_plan.go
│   ├── user_subscription.go
│   ├── service.go
│   ├── contractor.go
│   ├── property.go
│   └── review.go
├── views/               # JSON responses and data formatting
│   ├── response.go
│   ├── user_view.go
│   ├── credit_view.go
│   ├── wallet_view.go
│   └── error_view.go
├── routes/              # Route definitions and middleware
│   ├── auth_routes.go
│   ├── user_routes.go
│   ├── credit_routes.go
│   ├── wallet_routes.go
│   ├── subscription_routes.go
│   └── api_routes.go
├── middleware/          # Custom middleware
│   ├── auth.go
│   ├── credit_validation.go
│   ├── subscription_validation.go
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

## 🔐 **Authentication System**

### **Simplified Authentication:**

- **Phone OTP only**: No email/password complexity
- **OTP Service**: Twilio SMS integration
- **Auto-registration**: First login creates account
- **JWT Tokens**: Session management
- **Role-based Access**: User, Broker, Admin roles

### **Authentication Flow:**

```
1. User enters phone number
2. System sends OTP via SMS
3. User enters OTP
4. System validates and creates/logs in user
5. Auto-assigns 3 credits and initializes wallet
6. Returns JWT token for session
```

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
    Name                string    `json:"name"`
    Phone               string    `json:"phone" gorm:"unique"`
    UserType            string    `json:"user_type"` // user, broker, admin
    CreditsRemaining    int       `json:"credits_remaining" gorm:"default:3"`
    WalletBalance       float64   `json:"wallet_balance" gorm:"default:0"`
    SubscriptionID      *uint     `json:"subscription_id"`
    Subscription        *UserSubscription `json:"subscription"`
    IsActive            bool      `json:"is_active" gorm:"default:true"`
}

// Admin Configuration
type AdminConfig struct {
    gorm.Model
    CreditLimit         int       `json:"credit_limit" gorm:"default:3"`
    WalletLimit         float64   `json:"wallet_limit" gorm:"default:100000"`
    SubscriptionPrices  string    `json:"subscription_prices"` // JSON
}

// Wallet Transactions
type WalletTransaction struct {
    gorm.Model
    UserID              uint      `json:"user_id"`
    User                User      `json:"user"`
    Amount              float64   `json:"amount"`
    Type                string    `json:"type"` // 'credit', 'subscription', 'recharge'
    Description         string    `json:"description"`
    RazorpayPaymentID   string    `json:"razorpay_payment_id"`
    Status              string    `json:"status" gorm:"default:'pending'"`
}

// Subscription Plans
type SubscriptionPlan struct {
    gorm.Model
    Name                string    `json:"name"`
    Price               float64   `json:"price"`
    DurationMonths      int       `json:"duration_months"`
    Features            string    `json:"features"` // JSON
    IsActive            bool      `json:"is_active" gorm:"default:true"`
}

// User Subscriptions
type UserSubscription struct {
    gorm.Model
    UserID              uint      `json:"user_id"`
    User                User      `json:"user"`
    PlanID              uint      `json:"plan_id"`
    Plan                SubscriptionPlan `json:"plan"`
    Status              string    `json:"status" gorm:"default:'active'"`
    StartsAt            time.Time `json:"starts_at"`
    ExpiresAt           time.Time `json:"expires_at"`
}

// Service Management (Home Services)
type Service struct {
    gorm.Model
    Name                string    `json:"name"`
    Description         string    `json:"description"`
    Price               float64   `json:"price"`
    CategoryID          uint      `json:"category_id"`
    Category            Category  `json:"category"`
    SubcategoryID       uint      `json:"subcategory_id"`
    Subcategory         Subcategory `json:"subcategory"`
    ProviderID          uint      `json:"provider_id"`
    Provider            User      `json:"provider"`
    Status              string    `json:"status" gorm:"default:'active'"`
}

// Contractor Management
type Contractor struct {
    gorm.Model
    UserID              uint      `json:"user_id"`
    User                User      `json:"user"`
    Profession          string    `json:"profession"`
    Skills              string    `json:"skills"` // JSON array
    ExperienceYears     int       `json:"experience_years"`
    HourlyRate          float64   `json:"hourly_rate"`
    Availability        string    `json:"availability"` // JSON
    Rating              float64   `json:"rating" gorm:"default:0"`
    TotalJobs           int       `json:"total_jobs" gorm:"default:0"`
}

// Property Management (Real Estate)
type Property struct {
    gorm.Model
    Title               string    `json:"title"`
    Description         string    `json:"description"`
    Price               float64   `json:"price"`
    PropertyType        string    `json:"property_type"`
    Location            string    `json:"location"`
    OwnerID             uint      `json:"owner_id"`
    Owner               User      `json:"owner"`
    CreditUsed          int       `json:"credit_used" gorm:"default:1"`
    SubscriptionPosted  bool      `json:"subscription_posted" gorm:"default:false"`
    IsVerified          bool      `json:"is_verified"`
    Status              string    `json:"status"`
    Images              string    `json:"images"`
    Amenities           string    `json:"amenities"`
}
```

---

## 🔄 **API Architecture**

### **REST API Endpoints**

```
/api/v1/
├── auth/
│   ├── request-otp
│   ├── verify-otp
│   └── refresh
├── users/
│   ├── profile
│   ├── update
│   ├── credits
│   ├── buy-credits
│   ├── wallet
│   ├── wallet/recharge
│   └── wallet/transactions
├── subscriptions/
│   ├── plans
│   ├── purchase
│   ├── my-subscription
│   └── cancel
├── services/
│   ├── categories
│   ├── subcategories
│   ├── list
│   ├── book
│   └── bookings
├── contractors/
│   ├── list
│   ├── filter
│   ├── contact
│   └── reviews
├── properties/
│   ├── create (credit check)
│   ├── list
│   ├── search
│   └── inquiries
├── admin/
│   ├── config
│   ├── users
│   ├── subscriptions/plans
│   └── analytics
└── payments/
    ├── create
    ├── verify
    └── refund
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
    EventCreditUsed = "credit_used"
    EventWalletRecharged = "wallet_recharged"
    EventSubscriptionPurchased = "subscription_purchased"
    EventPropertyPosted = "property_posted"
    EventServiceBooked = "service_booked"
    EventContractorContacted = "contractor_contacted"
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

- **Credit Analytics**: Credit usage patterns and sales
- **Wallet Analytics**: Transaction volume and user behavior
- **Subscription Analytics**: Plan adoption and retention
- **Module Analytics**: Three main modules usage statistics
- **Revenue Tracking**: Credit sales, subscription revenue
- **Performance Metrics**: User engagement and satisfaction

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
- [ ] Credit system tested
- [ ] Wallet system tested
- [ ] Subscription system tested

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
- [ ] Credit system functional
- [ ] Wallet system functional
- [ ] Subscription system functional

---

## 🎯 **Performance Targets**

### **Response Times**

- **API Response**: <200ms average
- **Mobile App**: <2s cold start
- **Web App**: <1s page load
- **Database Queries**: <100ms average
- **Credit Validation**: <50ms
- **Wallet Transactions**: <100ms

### **Scalability**

- **Concurrent Users**: 10,000+ daily active users
- **Database**: Handle 1M+ records
- **File Storage**: 10TB+ capacity
- **API Rate Limit**: 1000 requests/minute/user
- **Credit System**: Handle 100K+ credit transactions/day
- **Wallet System**: Handle 50K+ wallet transactions/day

---

## 🔮 **Future Considerations**

### **Phase 2 Enhancements**

- **Microservices**: Service decomposition
- **Event Sourcing**: CQRS pattern
- **Advanced Analytics**: Machine learning insights
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

## 💳 **Payment Integration with Razorpay**

### **Razorpay Features**

- **Multiple Payment Methods**: UPI, cards, wallets, net banking
- **Secure Processing**: PCI compliant
- **Webhook Support**: Real-time payment notifications
- **Refund Management**: Automated refund processing
- **Analytics**: Payment analytics and reporting

### **Payment Flow**

```go
// Example Razorpay integration
type RazorpayService struct {
    KeyID     string
    KeySecret string
}

func (r *RazorpayService) CreatePayment(amount float64, currency string) (string, error) {
    // Create payment intent
    // Return payment ID
}

func (r *RazorpayService) VerifyPayment(paymentID, signature string) (bool, error) {
    // Verify payment signature
    // Return verification status
}
```

---

**TREESINDIA Tech Stack** - Built for scale, performance, and developer experience with credit system, wallet system, and subscription model.
