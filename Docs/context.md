# TREESINDIA - AI Development Context & Guidelines

## 🎯 **Project Overview**

**TREESINDIA** is a unified digital platform with two main modules: **Home Services** and **Real Estate**. Users can post properties freely, can recharge their wallet, and brokers can buy subscriptions for unlimited posting. The platform features simplified phone+OTP authentication, free property posting, AI assistance, and comprehensive booking management.

### **Core Vision:**

- **Two Main Modules**: Home Services, Real Estate
- **Free Property Posting**: Users can post properties without any cost
- **Wallet System**: Rechargeable wallet for all transactions
- **Subscription Model**: Brokers can buy unlimited posting subscriptions
- **Simplified Auth**: Phone number + OTP only
- **AI Assistant**: Smart chatbot for user assistance
- **Account Conversion**: Users can convert to Worker/Broker
- **Enhanced Booking**: Fixed price and inquiry-based services
- **Privacy Protection**: Call masking ensures real numbers are never shared

---

## 🏗️ **Technical Architecture**

### **Backend Stack:**

- **Language**: Go (Golang) 1.21+
- **Framework**: Gin (HTTP framework)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: GORM
- **Authentication**: JWT tokens (Phone + OTP only)
- **Payment**: Razorpay integration
- **AI Integration**: OpenAI GPT-4
- **Documentation**: Swagger/OpenAPI 3.0

### **Project Structure:**

```
backend/
├── controllers/          # HTTP handlers
├── models/              # Data models and database schema
├── services/            # Business logic layer
├── repositories/        # Database operations
├── routes/              # Route definitions
├── middleware/          # Custom middleware
├── config/              # Configuration management
├── utils/               # Utility functions
├── views/               # JSON response formatting
└── docs/                # Documentation
```

### **Architecture Pattern:**

```
Controller → Service → Repository → Database
```

---

## 🎯 **Development Approach & Guidelines**

### **1. Collaborative Discussion First**

**ALWAYS start with discussion, not coding:**

1. **Understand Requirements**: Ask clarifying questions about the module/feature
2. **Discuss Architecture**: Talk about different approaches and trade-offs
3. **Plan Implementation**: Decide on the best approach together
4. **Break Down Tasks**: Identify what needs to be built
5. **Get User Approval**: Confirm the plan before implementation

### **2. Question-Driven Development**

**Ask these questions before implementing:**

- **What's the priority?** Quick implementation vs. comprehensive system?
- **What's the scope?** What features are most important for MVP?
- **What are the dependencies?** What other modules does this depend on?
- **What's the user experience?** How will users interact with this?
- **What's the performance impact?** Will this scale well?
- **What's the maintenance cost?** Is this easy to maintain and extend?

### **3. Implementation Guidelines**

#### **Code Quality:**

- ✅ **Follow Go best practices** (error handling, proper naming)
- ✅ **Add comprehensive validation** (both client and server-side)
- ✅ **Include proper error handling** (graceful degradation)
- ✅ **Add Swagger documentation** for all API endpoints

#### **Database Design:**

- ✅ **Use GORM for migrations** (AutoMigrate for development)
- ✅ **Add proper indexes** for performance
- ✅ **Use foreign key constraints** for data integrity
- ✅ **Add audit fields** (created_at, updated_at, deleted_at)

#### **API Design:**

- ✅ **RESTful conventions** for endpoints
- ✅ **Consistent response format** using views package
- ✅ **Proper HTTP status codes**
- ✅ **Authentication middleware** where needed
- ✅ **Input validation** with binding tags

---

## 📋 **Current Module Status**

### **✅ Completed Modules:**

#### **1. Authentication System**

- ✅ User registration with phone OTP
- ✅ JWT token authentication
- ✅ Token refresh mechanism
- ✅ User login/logout
- **Files**: `auth_controller.go`, `auth_service.go`, `auth_routes.go`

#### **2. User Management**

- ✅ User model with multiple types (normal, worker, broker, admin)
- ✅ KYC status management
- ✅ User repository with advanced queries
- **Files**: `user.go`, `user_repository.go`

#### **3. Category Management**

- ✅ Category and subcategory hierarchy
- ✅ CRUD operations for categories
- ✅ Admin approval workflow
- **Files**: `category.go`, `category_controller.go`, `category_service.go`

#### **4. Service Management**

- ✅ Service model with pricing (fixed/inquiry-based)
- ✅ Service-category relationships
- ✅ Image upload support
- **Files**: `service.go`, `service_controller.go`, `service_service.go`

#### **5. Location System** ⭐ **Recently Completed**

- ✅ Dedicated location table
- ✅ GPS and manual location sources
- ✅ City/state based functionality
- ✅ Full CRUD operations
- ✅ Distance calculation
- **Files**: `location.go`, `location_controller.go`, `location_service.go`, `location_repository.go`

### **🔄 In Progress Modules:**

- None currently

### **📋 Planned Modules (New Scope):**

#### **6. Wallet System** (Next Priority)

- Wallet system with Razorpay integration
- Admin-configurable wallet limit (default: 100,000)
- Wallet transaction history

#### **7. Subscription System**

- Admin-configurable subscription plans
- Broker subscription purchase
- Unlimited posting for subscribed brokers
- Subscription validation and management

#### **8. AI Assistant System**

- OpenAI GPT-4 integration
- Smart recommendations
- Booking assistance
- FAQ handling
- Human escalation

#### **9. Account Conversion System**

- Worker conversion with admin approval
- Broker conversion with admin approval
- Contractor conversion with admin approval
- Document upload and verification
- Role-based access control

#### **10. Enhanced Booking System**

- Fixed price services with instant booking
- Inquiry-based services with custom quotes
- Time slot management
- Cart-based multiple service booking
- Real-time location tracking
- Worker assignment by admin

#### **11. Three Main Modules**

##### **Home Services Module**

- Service listings with pricing
- Service provider profiles
- Booking system with time slots
- Real-time location tracking
- Review and rating system
- Service categories (plumbing, cleaning, AC repair, etc.)

##### **Contractor Module**

- Contractor profiles with skills/professions
- Filtering by profession, skills, location
- Direct contact (text/call with masking)
- Contractor rating and review system
- Availability management

##### **Real Estate Module**

- Free property posting
- Property listings (rental/sale)
- Property search and filtering
- Instant purchase option
- Scheduled viewing option
- Admin approval workflow (for non-subscribed users)

#### **12. Simplified Authentication**

- Remove email/password complexity
- Phone + OTP only flow
- Auto-initialize wallet on registration
- Streamlined user onboarding

---

## 🗄️ **Database Schema Overview**

### **Current Tables:**

1. **users** - User accounts and profiles
2. **categories** - Service categories
3. **subcategories** - Service subcategories
4. **services** - Available services
5. **locations** - User locations
6. **migrations** - Database migration tracking

### **New Tables Needed:**

7. **admin_config** - System configuration (wallet limits)
8. **wallet_transactions** - Wallet recharge and usage history
9. **subscription_plans** - Available subscription plans
10. **user_subscriptions** - User subscription records
11. **contractors** - Contractor profiles and skills
12. **properties** - Property listings (free posting)
13. **account_conversions** - Account conversion requests
14. **bookings** - Service bookings with time slots
15. **booking_inquiries** - Inquiry-based service requests
16. **booking_carts** - Multiple service booking carts
17. **worker_assignments** - Admin worker assignments
18. **location_tracking** - Real-time worker location
19. **reviews** - Service and worker reviews
20. **ai_conversations** - AI assistant chat history

---

## 🔧 **Development Workflow**

### **For Each New Module:**

1. **Discussion Phase:**

   - Understand the requirement
   - Discuss different approaches
   - Plan the architecture
   - Identify dependencies

2. **Planning Phase:**

   - Define the data model
   - Plan API endpoints
   - Identify business logic
   - Plan validation rules

3. **Implementation Phase:**

   - Create model files
   - Implement repository layer
   - Implement service layer
   - Implement controller layer
   - Add routes
   - Update migrations

4. **Testing Phase:**

   - Test API endpoints
   - Validate data integrity
   - Check error handling
   - Verify authentication

5. **Documentation Phase:**
   - Update API documentation
   - Add Swagger annotations
   - Update this context file

---

## 🎯 **Priority Guidelines**

### **Module Priority Order:**

1. **Wallet System** - Core business logic
2. **Simplified Authentication** - User experience improvement
3. **Subscription System** - Revenue generation
4. **Enhanced Booking System** - Core functionality
5. **Account Conversion System** - User type management
6. **AI Assistant System** - User experience enhancement
7. **Three Main Modules** - Platform functionality
8. **Advanced Features** - Nice-to-have features

### **Implementation Priority:**

1. **Core CRUD** - Basic operations first
2. **Business Logic** - Complex workflows second
3. **Advanced Features** - Nice-to-have features last
4. **Optimization** - Performance improvements last

---

## 📱 **Simplified Authentication Flow**

### **Single Login Process:**

```
1. User enters phone number
2. System sends OTP via SMS
3. User enters OTP
4. System validates OTP
5. If valid: User is logged in and wallet is initialized
6. If invalid: Show error and retry
```

### **User Registration (Automatic):**

- **No separate registration**: First login automatically creates account
- **Auto-wallet initialization**: New users get wallet initialized
- **Wallet initialization**: Wallet created with 0 balance
- **Profile completion**: Optional profile setup after login

### **Login Flow Details:**

#### **Step 1: Phone Number Entry**

- User enters phone number
- System validates phone format
- Shows "Send OTP" button

#### **Step 2: OTP Delivery**

- System sends 6-digit OTP via SMS
- Shows countdown timer (60 seconds)
- "Resend OTP" option after timeout

#### **Step 3: OTP Verification**

- User enters 6-digit OTP
- System validates OTP
- Shows loading state during verification

#### **Step 4: Account Creation/Login**

- **New User**: Creates account, initializes wallet
- **Existing User**: Logs in, loads existing data
- Redirects to home screen with three main modules

### **Error Handling:**

- **Invalid Phone**: Show format error
- **OTP Expired**: Show resend option
- **Wrong OTP**: Show retry message
- **Network Error**: Show retry option

---

## 🤖 **AI Assistant System**

### **AI Features:**

#### **Smart Property Search**

- AI helps users find properties through conversation
- Natural language property queries
- Contextual follow-up questions
- Real-time property listing results
- Location and price-based filtering

#### **Service Search Assistance**

- AI helps users find appropriate services
- Service category recommendations
- Provider suggestions based on needs
- Booking guidance and explanations

#### **Conversational Interface**

- Natural language queries
- Contextual follow-up questions
- Step-by-step guidance
- Platform usage help

#### **Example AI Conversations:**

**Property Search:**

```
User: "What is the best property under 1 lakh?"
AI: "Where are you looking for?"
User: "Siliguri"
AI: "Here are all properties under 1 lakh in Siliguri: [Property Listings]"
```

**Service Search:**

```
User: "I need a plumber"
AI: "What type of plumbing work do you need?"
User: "Tap repair"
AI: "Here are available plumbers for tap repair: [Service Listings]"
```

**General Help:**

```
User: "How do I book a service?"
AI: "To book a service, follow these steps: [Step-by-step guide]"
```

### **AI Integration:**

- **OpenAI GPT-4**: Core AI engine
- **Conversation History**: Track user interactions
- **Context Awareness**: Understand user context
- **Multi-language Support**: Hindi and English
- **Real-time Data**: Connect to actual property/service listings

---

## 👥 **Account Conversion System**

### **Conversion Types:**

#### **Worker Conversion:**

- **Skills Selection**: Choose service categories
- **Experience Details**: Years of experience
- **Service Areas**: Coverage locations
- **Document Upload**: KYC, certifications
- **Admin Approval**: Manual verification
- **Worker Access**: Access to worker features after approval

#### **Broker Conversion:**

- **License Information**: Broker license
- **Agency Details**: Agency information
- **Experience**: Real estate experience
- **Document Upload**: License, certifications
- **Admin Approval**: Manual verification

#### **Contractor Conversion:**

- **Profession Selection**: Primary profession
- **Skills & Expertise**: Specific skills
- **Experience**: Years of experience
- **Service Areas**: Coverage locations
- **Rate Setting**: Hourly/daily rates
- **Document Upload**: Certifications, portfolio
- **Admin Approval**: Manual verification

### **Worker Management System:**

#### **Admin-Owned Workers:**

- **Admin manages workers**: Admin has his own pool of workers
- **Worker applications**: Workers apply for account conversion
- **Admin approval**: Admin approves worker applications
- **Worker assignment**: Admin assigns workers to services
- **Direct communication**: Users can chat and call workers (masked)

#### **Worker Application Process:**

```
1. Worker applies for account conversion
2. Admin reviews worker credentials and documents
3. Admin approves/rejects the application
4. If approved: Worker gets access to worker features
5. Admin assigns workers to specific services
```

---

## 📅 **Enhanced Booking System**

### **Service Types:**

#### **1. Fixed Price Services:**

- **Instant Booking**: Immediate booking available
- **Fixed Pricing**: Pre-determined prices
- **Time Slots**: Available booking slots
- **Examples**: Plumbing repairs, cleaning, basic electrical

#### **2. Inquiry-based Services:**

- **Detailed Form**: Comprehensive requirement form
- **Admin Review**: Admin reviews requirements
- **Custom Quote**: Admin sets price based on details
- **User Confirmation**: Accept/reject quote
- **Booking Conversion**: Convert to booking after acceptance
- **Examples**: Room painting, renovation, complex projects

### **Booking Flow:**

#### **Fixed Price Booking:**

```
1. User selects service → View fixed price
2. Choose time slot → Available slots shown
3. Fill booking details → Address, description
4. Make payment → Razorpay integration
5. Admin assigns worker → Manual assignment
6. User can chat/call worker → Masked communication
7. Worker accepts → Real-time location tracking
8. Service completion → Worker review
```

#### **Inquiry-based Booking:**

```
1. User selects inquiry service → Fill detailed form
2. Submit inquiry → Admin receives notification
3. Admin reviews → Set custom price
4. User receives quote → Accept/reject decision
5. User accepts → Convert to booking
6. Make payment → Razorpay integration
7. Admin assigns worker → Manual assignment
8. User can chat/call worker → Masked communication
9. Service execution → Same as fixed price
```

### **Multiple Service Booking Solutions:**

#### **Option 1: Cart-based System (Recommended)**

- **Add Multiple Services**: Different services in one cart
- **Time Slot Management**: Select slots for each service
- **Bulk Discount**: Discount for multiple services
- **Individual Tracking**: Track each service separately
- **Flexible Scheduling**: Different dates/times for each service

#### **Option 2: Package-based System**

- **Pre-defined Packages**: Admin creates service combinations
- **Package Pricing**: Discounted pricing for packages
- **User Selection**: Choose from available packages
- **Single Booking**: Book entire package
- **Sequential Execution**: Services executed in order

#### **Option 3: Sequential Booking System**

- **Primary Service**: Book main service first
- **Related Services**: Suggest related services
- **Sequential Scheduling**: Schedule in logical order
- **Dependent Execution**: Second service after first completion
- **Conditional Booking**: Book second only if first succeeds

---

## 🏠 **Three Main Modules**

### **1. Home Services Module**

#### **User Flow:**

1. User clicks "Home Services" card
2. Bottom sheet opens with service categories
3. User selects category (e.g., "Plumbing")
4. Service listings shown (e.g., "Tap Repair - ₹500")
5. User can book service or contact provider

#### **Features:**

- Service categories and subcategories
- Service listings with pricing
- Service provider profiles
- Booking system with time slots
- Admin worker assignment
- User-worker communication (chat/call)
- Real-time location tracking
- Review and rating system

### **2. Contractor Module**

#### **User Flow:**

1. User clicks "Contractor" card
2. List of contractors shown
3. User can filter by profession, skills, location
4. User can contact contractor (text/call with masking)
5. Direct communication with contractor

#### **Features:**

- Contractor profiles with skills
- Filtering and search
- Direct contact (masked calls)
- Rating and review system
- Contractor availability

### **3. Real Estate Module**

#### **User Flow:**

1. User clicks "Rental/Property" card
2. Property listings shown
3. User can search and filter properties
4. User can contact seller/owner
5. Property viewing and transaction

#### **Features:**

- Property listings (rental/sale)
- Free property posting system
- Property search and filtering
- Contact seller/owner
- Property viewing scheduling
- Instant purchase option

---

## 🚨 **Common Issues & Solutions**

### **Migration Issues:**

- **Problem**: Tables not created despite migration
- **Solution**: Use dedicated migration scripts or force AutoMigrate

### **Route Conflicts:**

- **Problem**: Specific routes being matched by parameter routes
- **Solution**: Order routes from specific to general (e.g., `/user/me` before `/:id`)

### **Database Relationships:**

- **Problem**: Foreign key constraints failing
- **Solution**: Ensure proper model relationships and migration order

### **Authentication Issues:**

- **Problem**: JWT token validation failing
- **Solution**: Check middleware order and token format

### **Wallet System Issues:**

- **Problem**: Wallet balance not updated properly
- **Solution**: Use database transactions for wallet operations

### **Wallet Issues:**

- **Problem**: Wallet balance not updated
- **Solution**: Ensure atomic operations for wallet transactions

### **Booking System Issues:**

- **Problem**: Time slot conflicts
- **Solution**: Implement proper slot validation and locking

### **AI Integration Issues:**

- **Problem**: AI responses too slow
- **Solution**: Implement caching and response optimization

---

## 📚 **Reference Links**

### **Documentation:**

- [API Endpoints](./API_ENDPOINTS.md)
- [Application Flow](./flow.md)
- [Tech Stack](./tech-stack.md)
- [Implementation Plan](./plan.md)

### **External Resources:**

- [Gin Framework Documentation](https://gin-gonic.com/docs/)
- [GORM Documentation](https://gorm.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)

---

## 🎯 **Success Metrics**

### **Development Metrics:**

- ✅ **Code Quality**: No linting errors
- ✅ **Test Coverage**: All endpoints tested
- ✅ **Documentation**: Swagger docs complete
- ✅ **Performance**: Response times < 200ms
- ✅ **Security**: Authentication working

### **Business Metrics:**

- ✅ **User Experience**: Intuitive API design
- ✅ **Scalability**: Database properly indexed
- ✅ **Maintainability**: Clean code structure
- ✅ **Extensibility**: Easy to add new features

### **New Business Metrics:**

- ✅ **Property Posting**: Track property listing activity
- ✅ **Wallet Transactions**: Monitor wallet activity
- ✅ **Subscription Sales**: Track subscription revenue
- ✅ **Module Usage**: Monitor three main modules
- ✅ **Booking Conversion**: Track booking success rates
- ✅ **AI Engagement**: Monitor AI assistant usage
- ✅ **Account Conversions**: Track conversion rates

---

## 🤝 **AI Interaction Guidelines**

### **When Starting a New Module:**

1. **Read this context file first**
2. **Ask about the specific requirement**
3. **Discuss architecture options**
4. **Plan implementation together**
5. **Get approval before coding**
6. **Follow the established patterns**

### **When Implementing:**

1. **Use existing patterns** from completed modules
2. **Follow the architecture** (Controller → Service → Repository)
3. **Add proper validation** and error handling
4. **Include Swagger documentation**
5. **Test thoroughly** before marking complete

### **When Completing:**

1. **Update this context file** with new module status
2. **Document any new patterns** or approaches
3. **Suggest next priorities**
4. **Ask for feedback** on the implementation

---

**Last Updated**: January 2024
**Version**: 3.0
**Status**: Active Development - Enhanced Scope Implementation

---

_This document serves as the single source of truth for AI development assistance on the TREESINDIA project. Always refer to this context before starting any new development work._
