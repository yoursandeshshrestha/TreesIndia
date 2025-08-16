# TREESINDIA - Enhanced Scope Implementation Plan

## 🎯 **Project Overview**

Implementing the enhanced scope with three main modules (Home Services, Contractor, Real Estate), credit system, wallet system, subscription model, AI assistant, account conversion system, and comprehensive booking management. This plan focuses on creating a complete platform with AI assistance, user type conversions, and advanced booking features.

---

## 📋 **Phase 1: Core System Updates**

### **Step 1.1: Simplified Authentication**

- [ ] Update `backend/controllers/auth_controller.go`
- [ ] Implement phone number validation
- [ ] Create OTP generation and sending
- [ ] Add OTP verification logic
- [ ] Implement auto-account creation
- [ ] Add auto-credit assignment (3 credits)
- [ ] Add auto-wallet initialization
- [ ] Create JWT token generation
- [ ] Add role-based authentication
- [ ] Remove email/password complexity

### **Step 1.2: Credit System Implementation**

- [ ] Create `backend/models/admin_config.go` for system configuration
- [ ] Add credit tracking to user model
- [ ] Create credit validation middleware
- [ ] Implement credit deduction logic
- [ ] Add credit purchase functionality

### **Step 1.3: Wallet System Implementation**

- [ ] Create `backend/models/wallet_transaction.go`
- [ ] Integrate Razorpay for wallet recharge
- [ ] Implement wallet balance tracking
- [ ] Add wallet transaction history
- [ ] Create wallet management endpoints

---

## 🔧 **Phase 2: Subscription System**

### **Step 2.1: Subscription Models**

- [ ] Create `backend/models/subscription_plan.go`
- [ ] Create `backend/models/user_subscription.go`
- [ ] Add subscription fields to user model
- [ ] Implement subscription validation logic

### **Step 2.2: Subscription Management**

- [ ] Create `backend/controllers/subscription_controller.go`
- [ ] Implement subscription purchase flow
- [ ] Add subscription validation middleware
- [ ] Create admin subscription plan management
- [ ] Add subscription status tracking

### **Step 2.3: Admin Configuration**

- [ ] Create `backend/controllers/admin_config_controller.go`
- [ ] Implement credit limit configuration
- [ ] Add wallet limit configuration
- [ ] Create subscription plan management
- [ ] Add system configuration endpoints

---

## 🤖 **Phase 3: AI Assistant System**

### **Step 3.1: AI Integration**

- [ ] Create `backend/models/ai_conversation.go`
- [ ] Integrate OpenAI GPT-4 API
- [ ] Implement conversation history tracking
- [ ] Add context awareness for user interactions
- [ ] Create AI response caching system

### **Step 3.2: AI Features**

- [ ] Create `backend/controllers/ai_controller.go`
- [ ] Implement smart property search
- [ ] Add service search assistance
- [ ] Create conversational interface
- [ ] Add real-time data connection to listings

### **Step 3.3: AI Management**

- [ ] Create AI conversation management
- [ ] Implement response optimization
- [ ] Add multi-language support (Hindi/English)
- [ ] Create real-time data integration
- [ ] Add AI performance tracking

---

## 👥 **Phase 4: Account Conversion System**

### **Step 4.1: Conversion Models**

- [ ] Create `backend/models/account_conversion.go`
- [ ] Add conversion fields to user model
- [ ] Implement conversion status tracking
- [ ] Add document upload functionality
- [ ] Create conversion approval workflow

### **Step 4.2: Conversion Types**

- [ ] Create worker application system
- [ ] Implement broker conversion system
- [ ] Add contractor conversion system
- [ ] Create document verification system
- [ ] Add admin approval interface
- [ ] Implement worker management system

### **Step 4.3: Role Management**

- [ ] Implement role-based access control
- [ ] Add permission management
- [ ] Create role-specific features
- [ ] Add role transition logic
- [ ] Create role analytics
- [ ] Implement admin worker assignment

---

## 📅 **Phase 5: Enhanced Booking System**

### **Step 5.1: Booking Models**

- [ ] Create `backend/models/booking.go`
- [ ] Create `backend/models/booking_inquiry.go`
- [ ] Create `backend/models/booking_cart.go`
- [ ] Create `backend/models/worker_assignment.go`
- [ ] Create `backend/models/location_tracking.go`

### **Step 5.2: Service Types**

- [ ] Implement fixed price services
- [ ] Create inquiry-based services
- [ ] Add time slot management
- [ ] Implement service pricing logic
- [ ] Create service availability tracking

### **Step 5.3: Booking Flow**

- [ ] Create `backend/controllers/booking_controller.go`
- [ ] Implement instant booking for fixed price
- [ ] Add inquiry submission and review
- [ ] Create quote generation system
- [ ] Implement booking confirmation
- [ ] Add user-worker communication system

### **Step 5.4: Multiple Service Booking**

- [ ] Implement cart-based booking system
- [ ] Add package-based booking system
- [ ] Create sequential booking system
- [ ] Add bulk discount logic
- [ ] Implement flexible scheduling

---

## 🛣️ **Phase 6: Three Main Modules**

### **Step 6.1: Home Services Module**

- [ ] Update `backend/models/service.go` for new structure
- [ ] Create service category hierarchy (plumbing, cleaning, AC repair, etc.)
- [ ] Implement service listing with pricing
- [ ] Add service provider profiles
- [ ] Create service booking system with time slots
- [ ] Add real-time location tracking
- [ ] Implement review and rating system

### **Step 6.2: Contractor Module**

- [ ] Create `backend/models/contractor.go`
- [ ] Implement contractor profiles with skills
- [ ] Add contractor filtering system
- [ ] Create contractor contact system (masked calls)
- [ ] Add contractor rating and review system
- [ ] Implement availability management

### **Step 6.3: Real Estate Module**

- [ ] Update `backend/models/property.go` with credit validation
- [ ] Implement credit-based property posting
- [ ] Add property search and filtering
- [ ] Create property contact system
- [ ] Add property viewing scheduling
- [ ] Implement instant purchase option

---

## 🧪 **Phase 7: API Endpoints & Routes**

### **Step 7.1: Authentication Routes**

- [ ] `POST /api/auth/request-otp` - Send OTP to phone
- [ ] `POST /api/auth/verify-otp` - Verify OTP and login
- [ ] `POST /api/auth/refresh-token` - Refresh JWT token
- [ ] `POST /api/auth/logout` - User logout

### **Step 7.2: Credit & Wallet Routes**

- [ ] `GET /api/user/credits` - Get user credits
- [ ] `POST /api/user/buy-credits` - Purchase credits
- [ ] `GET /api/user/wallet` - Get wallet balance
- [ ] `POST /api/user/wallet/recharge` - Recharge wallet
- [ ] `GET /api/user/wallet/transactions` - Get transaction history

### **Step 7.3: Subscription Routes**

- [ ] `GET /api/subscriptions/plans` - Get available plans
- [ ] `POST /api/subscriptions/purchase` - Buy subscription
- [ ] `GET /api/subscriptions/my-subscription` - Get user subscription
- [ ] `PUT /api/subscriptions/cancel` - Cancel subscription

### **Step 7.4: AI Assistant Routes**

- [ ] `POST /api/ai/chat` - Send message to AI
- [ ] `GET /api/ai/conversations` - Get conversation history
- [ ] `POST /api/ai/property-search` - AI property search
- [ ] `POST /api/ai/service-search` - AI service search

### **Step 7.5: Account Conversion Routes**

- [ ] `POST /api/conversions/worker` - Convert to worker
- [ ] `POST /api/conversions/broker` - Convert to broker
- [ ] `POST /api/conversions/contractor` - Convert to contractor
- [ ] `GET /api/conversions/status` - Get conversion status
- [ ] `POST /api/conversions/documents` - Upload documents

### **Step 7.6: Booking Routes**

- [ ] `POST /api/bookings/create` - Create booking
- [ ] `POST /api/bookings/inquiry` - Submit inquiry
- [ ] `GET /api/bookings/list` - Get user bookings
- [ ] `GET /api/bookings/{id}` - Get booking details
- [ ] `POST /api/bookings/cart` - Add to booking cart
- [ ] `POST /api/bookings/cart/checkout` - Checkout cart
- [ ] `GET /api/bookings/timeslots` - Get available time slots

### **Step 7.7: Module-Specific Routes**

#### **Home Services:**

- [ ] `GET /api/services/categories` - Get service categories
- [ ] `GET /api/services/list/{category_id}` - Get services by category
- [ ] `POST /api/services/book` - Book a service
- [ ] `GET /api/services/timeslots` - Get service time slots

#### **Contractor:**

- [ ] `GET /api/contractors` - Get contractors list
- [ ] `GET /api/contractors/filter` - Filter contractors
- [ ] `POST /api/contractors/contact` - Contact contractor
- [ ] `GET /api/contractors/{id}/availability` - Get availability

#### **Real Estate:**

- [ ] `POST /api/properties` - Create property (with credit check)
- [ ] `GET /api/properties` - Get properties list
- [ ] `GET /api/properties/search` - Search properties
- [ ] `POST /api/properties/{id}/purchase` - Instant purchase
- [ ] `POST /api/properties/{id}/visit` - Schedule visit

### **Step 7.8: Admin Routes**

- [ ] `GET /api/admin/config` - Get system configuration
- [ ] `PUT /api/admin/config` - Update system configuration
- [ ] `GET /api/admin/conversions/pending` - Get pending conversions
- [ ] `PUT /api/admin/conversions/{id}/approve` - Approve conversion
- [ ] `GET /api/admin/bookings/pending` - Get pending bookings
- [ ] `POST /api/admin/bookings/{id}/assign-worker` - Assign worker
- [ ] `GET /api/admin/workers` - Get all workers
- [ ] `POST /api/admin/workers` - Add new worker
- [ ] `GET /api/admin/ai/analytics` - Get AI analytics

---

## 📊 **Phase 8: Database Schema Updates**

### **Step 8.1: New Tables**

```sql
-- AI Conversations
ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP
);

-- Account Conversions
account_conversions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    conversion_type VARCHAR(50), -- 'worker', 'broker', 'contractor'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    details JSONB, -- conversion-specific details
    documents TEXT[], -- document URLs
    admin_notes TEXT,
    created_at TIMESTAMP
);

-- Bookings
bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    worker_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_time TIMESTAMP,
    address TEXT,
    description TEXT,
    price DECIMAL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP
);

-- Booking Inquiries
booking_inquiries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    details JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    admin_quote DECIMAL,
    user_accepted BOOLEAN,
    created_at TIMESTAMP
);

-- Booking Carts
booking_carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    items JSONB, -- array of booking items
    total_amount DECIMAL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP
);

-- Worker Assignments
worker_assignments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    worker_id INTEGER REFERENCES users(id),
    assigned_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'assigned',
    assigned_at TIMESTAMP
);

-- Worker Management
workers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    skills JSONB,
    experience_years INTEGER,
    service_areas TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP
);

-- User-Worker Communication
worker_communications (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    user_id INTEGER REFERENCES users(id),
    worker_id INTEGER REFERENCES users(id),
    message_type VARCHAR(20), -- 'chat', 'call'
    message TEXT,
    masked_phone VARCHAR(20),
    created_at TIMESTAMP
);

-- Location Tracking
location_tracking (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id),
    latitude DECIMAL,
    longitude DECIMAL,
    status VARCHAR(20), -- 'on_way', 'arrived', 'working'
    updated_at TIMESTAMP
);

-- Reviews
reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    worker_id INTEGER REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    photos TEXT[],
    created_at TIMESTAMP
);
```

### **Step 8.2: Updated Tables**

```sql
-- Users table updates
ALTER TABLE users ADD COLUMN credits_remaining INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN wallet_balance DECIMAL DEFAULT 0;
ALTER TABLE users ADD COLUMN subscription_id INTEGER REFERENCES user_subscriptions(id);
ALTER TABLE users ADD COLUMN conversion_id INTEGER REFERENCES account_conversions(id);

-- Services table updates
ALTER TABLE services ADD COLUMN service_type VARCHAR(20) DEFAULT 'fixed'; -- 'fixed', 'inquiry'
ALTER TABLE services ADD COLUMN time_slots JSONB;
ALTER TABLE services ADD COLUMN inquiry_form JSONB;

-- Properties table updates
ALTER TABLE properties ADD COLUMN credit_used INTEGER DEFAULT 1;
ALTER TABLE properties ADD COLUMN subscription_posted BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN instant_purchase BOOLEAN DEFAULT false;
```

---

## 🚀 **Phase 9: Frontend Integration**

### **Step 9.1: Admin Panel Updates**

- [ ] Add credit limit configuration UI
- [ ] Add wallet limit configuration UI
- [ ] Create subscription plan management
- [ ] Add system configuration dashboard
- [ ] Update user management with credit/wallet info
- [ ] Add account conversion approval interface
- [ ] Create booking management dashboard
- [ ] Add worker assignment interface
- [ ] Create AI analytics dashboard

### **Step 9.2: Mobile App Updates**

- [ ] Update authentication flow (phone+OTP only)
- [ ] Add three main module cards on home screen
- [ ] Implement credit display and purchase
- [ ] Add wallet recharge functionality
- [ ] Create subscription purchase flow
- [ ] Add AI assistant chat interface
- [ ] Implement account conversion forms
- [ ] Create booking system with time slots
- [ ] Add real-time location tracking
- [ ] Implement review and rating system

---

## 📋 **Implementation Checklist**

### **Core System**

- [ ] Simplified authentication (phone+OTP only)
- [ ] Credit system with admin configuration
- [ ] Wallet system with Razorpay integration
- [ ] Subscription system for brokers
- [ ] Admin configuration management

### **AI Assistant System**

- [ ] OpenAI GPT-4 integration
- [ ] Smart recommendations
- [ ] Booking assistance
- [ ] FAQ handling
- [ ] Human escalation

### **Account Conversion System**

- [ ] Worker conversion with admin approval
- [ ] Broker conversion with admin approval
- [ ] Contractor conversion with admin approval
- [ ] Document upload and verification
- [ ] Role-based access control

### **Enhanced Booking System**

- [ ] Fixed price services with instant booking
- [ ] Inquiry-based services with custom quotes
- [ ] Time slot management
- [ ] Cart-based multiple service booking
- [ ] Real-time location tracking
- [ ] Worker assignment by admin
- [ ] Review and rating system

### **Three Main Modules**

- [ ] Home Services module with categories
- [ ] Contractor module with filtering
- [ ] Real Estate module with credit validation
- [ ] Service booking system
- [ ] Contractor contact system
- [ ] Property posting with credit check

### **API Endpoints**

- [ ] Authentication endpoints (simplified)
- [ ] Credit and wallet endpoints
- [ ] Subscription endpoints
- [ ] AI assistant endpoints
- [ ] Account conversion endpoints
- [ ] Booking endpoints
- [ ] Module-specific endpoints
- [ ] Admin configuration endpoints

---

## 🎯 **Success Criteria**

### **Functional Requirements**

- [ ] Users can register with phone+OTP only
- [ ] Credits are auto-initialized on registration
- [ ] Credit validation works for property posting
- [ ] Wallet recharge works with Razorpay
- [ ] Subscription system works for brokers
- [ ] AI assistant provides conversational property/service search
- [ ] Account conversions work with admin approval
- [ ] Admin can manage and assign workers
- [ ] Users can communicate with assigned workers
- [ ] Booking system handles both fixed and inquiry services
- [ ] Multiple service booking works with cart system
- [ ] Real-time location tracking works
- [ ] Three main modules are functional

### **Technical Requirements**

- [ ] Database schema is properly updated
- [ ] API endpoints return proper responses
- [ ] Authentication and authorization work
- [ ] Performance is acceptable
- [ ] Code follows Go best practices
- [ ] AI responses are fast and accurate
- [ ] Real-time features work smoothly

### **Quality Requirements**

- [ ] All tests pass
- [ ] No linting errors
- [ ] Proper error handling
- [ ] Clean code structure
- [ ] Good documentation
- [ ] Security best practices followed

---

## 📅 **Timeline Estimate**

- **Phase 1 (Core System)**: 1-2 weeks
- **Phase 2 (Subscription System)**: 1 week
- **Phase 3 (AI Assistant)**: 2 weeks
- **Phase 4 (Account Conversion)**: 1-2 weeks
- **Phase 5 (Enhanced Booking)**: 2-3 weeks
- **Phase 6 (Three Modules)**: 2-3 weeks
- **Phase 7 (API Endpoints)**: 1-2 weeks
- **Phase 8 (Database Updates)**: 3-5 days
- **Phase 9 (Frontend Integration)**: 2-3 weeks

**Total Estimated Time**: 12-18 weeks

---

## 🔄 **Next Steps After Completion**

1. **Testing & QA**: Comprehensive testing of all features
2. **Performance Optimization**: Database indexing and query optimization
3. **Security Audit**: Review authentication and payment security
4. **User Testing**: Beta testing with real users
5. **Production Deployment**: Deploy to production environment
6. **Monitoring Setup**: AI performance and system monitoring
7. **Analytics Implementation**: Track all key metrics

---

## 📝 **Notes & Considerations**

- Keep the authentication flow simple and user-friendly
- Ensure proper validation for credit and wallet operations
- Consider caching for frequently accessed data
- Plan for future expansion of subscription features
- Maintain backward compatibility where possible
- Focus on user experience for the three main modules
- Implement proper error handling for AI responses
- Ensure real-time features are performant
- Plan for scalability of booking system
- Consider mobile app performance with location tracking

---

**Last Updated**: January 2024
**Status**: Enhanced Scope Implementation - Phase 1 Planning
**Next Action**: Start Phase 1.1 - Simplified Authentication Implementation
