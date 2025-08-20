# TREESINDIA - Enhanced Scope Implementation Plan

## 🎯 **Project Overview**

Implementing the enhanced scope with three main modules (Home Services, Construction Services, Marketplace), advanced booking systems with time slot management, real-time worker tracking, inquiry-based services with custom quotes, and comprehensive marketplace features. This plan focuses on creating a complete platform with advanced booking, real-time communication, and subscription-based marketplace features.

---

## 📋 **Phase 1: Core System Updates**

### **Step 1.1: Simplified Authentication**

- [ ] Update `backend/controllers/auth_controller.go`
- [ ] Implement phone number validation
- [ ] Create OTP generation and sending
- [ ] Add OTP verification logic
- [ ] Implement auto-account creation
- [ ] Create JWT token generation
- [ ] Add role-based authentication
- [ ] Remove email/password complexity

### **Step 1.2: Module Structure Implementation**

- [ ] Create `backend/models/module.go` for module management
- [ ] Update `backend/models/category.go` with module types
- [ ] Add module-specific configurations
- [ ] Implement module-based routing
- [ ] Create module access control

### **Step 1.3: Service Type Management**

- [ ] Update `backend/models/service.go` for service types
- [ ] Add fixed price service logic
- [ ] Implement inquiry-based service system
- [ ] Create service pricing management
- [ ] Add service availability tracking

---

## 🔧 **Phase 2: Home Services Module**

### **Step 2.1: Service Categories & Subcategories**

- [ ] Create `backend/models/service_category.go`
- [ ] Implement subcategory management
- [ ] Add service category hierarchy
- [ ] Create service listing system
- [ ] Implement service filtering

### **Step 2.2: Fixed Price Services**

- [ ] Create `backend/models/fixed_price_service.go`
- [ ] Implement time slot management
- [ ] Add worker availability tracking
- [ ] Create booking validation logic
- [ ] Implement instant booking system

### **Step 2.3: Inquiry-based Services**

- [ ] Create `backend/models/inquiry_service.go`
- [ ] Implement inquiry submission system
- [ ] Add admin chat interface
- [ ] Create quote generation system
- [ ] Implement quote acceptance flow

### **Step 2.4: Time Slot Management**

- [ ] Create `backend/models/time_slot.go`
- [ ] Implement worker schedule management
- [ ] Add time slot availability logic
- [ ] Create booking conflict detection
- [ ] Implement dynamic time slot generation

---

## 👷 **Phase 3: Worker Management System**

### **Step 3.1: Worker Models**

- [ ] Create `backend/models/worker.go`
- [ ] Implement worker profile management
- [ ] Add skill and certification tracking
- [ ] Create worker availability system
- [ ] Implement worker rating system

### **Step 3.2: Worker Assignment**

- [ ] Create `backend/models/worker_assignment.go`
- [ ] Implement admin assignment interface
- [ ] Add worker selection algorithm
- [ ] Create assignment notification system
- [ ] Implement assignment tracking

### **Step 3.3: Real-time Tracking**

- [ ] Create `backend/models/location_tracking.go`
- [ ] Implement live location sharing
- [ ] Add location history tracking
- [ ] Create location privacy controls
- [ ] Implement real-time updates

---

## 🏗️ **Phase 4: Construction Services Module**

### **Step 4.1: Construction Service Models**

- [ ] Create `backend/models/construction_service.go`
- [ ] Implement consultation booking system
- [ ] Add requirement analysis forms
- [ ] Create project scope management
- [ ] Implement construction service types

### **Step 4.2: Consultation System**

- [ ] Create `backend/models/consultation.go`
- [ ] Implement consultation scheduling
- [ ] Add admin consultation interface
- [ ] Create requirement discussion system
- [ ] Implement consultation tracking

### **Step 4.3: Quote Management**

- [ ] Create `backend/models/quote.go`
- [ ] Implement quote generation system
- [ ] Add detailed cost breakdown
- [ ] Create quote approval workflow
- [ ] Implement quote acceptance system

---

## 🏪 **Phase 5: Marketplace Module**

### **Step 5.1: Enhanced Property System**

- [ ] Update `backend/models/property.go` for marketplace features
- [ ] Implement TreesIndia Assured system
- [ ] Add property verification workflow
- [ ] Create property analytics
- [ ] Implement property search optimization

### **Step 5.2: Subscription Features**

- [ ] Create `backend/models/marketplace_subscription.go`
- [ ] Implement vendor list management
- [ ] Add workforce section
- [ ] Create project listing system
- [ ] Implement subscription benefits

### **Step 5.3: Vendor & Workforce Management**

- [ ] Create `backend/models/vendor.go`
- [ ] Implement vendor verification system
- [ ] Add workforce directory
- [ ] Create vendor rating system
- [ ] Implement vendor communication

---

## 💬 **Phase 6: Real-time Communication System**

### **Step 6.1: Chat System**

- [ ] Create `backend/models/chat.go`
- [ ] Implement WebSocket connections
- [ ] Add real-time messaging
- [ ] Create chat history management
- [ ] Implement message encryption

### **Step 6.2: Call Masking**

- [ ] Create `backend/models/call_masking.go`
- [ ] Implement temporary number generation
- [ ] Add call routing system
- [ ] Create call logging
- [ ] Implement call privacy controls

### **Step 6.3: Notification System**

- [ ] Create `backend/models/notification.go`
- [ ] Implement push notifications
- [ ] Add SMS notifications
- [ ] Create email notifications
- [ ] Implement notification preferences

---

## 📅 **Phase 7: Advanced Booking System**

### **Step 7.1: Booking Models**

- [ ] Create `backend/models/booking.go`
- [ ] Create `backend/models/booking_inquiry.go`
- [ ] Create `backend/models/booking_cart.go`
- [ ] Create `backend/models/booking_timeslot.go`
- [ ] Create `backend/models/booking_status.go`

### **Step 7.2: Booking Flow**

- [ ] Create `backend/controllers/booking_controller.go`
- [ ] Implement fixed price booking flow
- [ ] Add inquiry-based booking flow
- [ ] Create booking confirmation system
- [ ] Implement booking cancellation

### **Step 7.3: Payment Integration**

- [ ] Update Razorpay integration for new booking types
- [ ] Implement quote payment processing
- [ ] Add milestone payment system
- [ ] Create payment confirmation
- [ ] Implement refund processing

---

## 🛣️ **Phase 8: API Endpoints & Routes**

### **Step 8.1: Authentication Routes**

- [ ] `POST /api/auth/request-otp` - Send OTP to phone
- [ ] `POST /api/auth/verify-otp` - Verify OTP and login
- [ ] `POST /api/auth/refresh-token` - Refresh JWT token
- [ ] `POST /api/auth/logout` - User logout

### **Step 8.2: Home Services Routes**

- [ ] `GET /api/home-services/categories` - Get service categories
- [ ] `GET /api/home-services/services/{category_id}` - Get services by category
- [ ] `GET /api/home-services/timeslots` - Get available time slots
- [ ] `POST /api/home-services/book-fixed` - Book fixed price service
- [ ] `POST /api/home-services/submit-inquiry` - Submit inquiry
- [ ] `GET /api/home-services/inquiries` - Get user inquiries
- [ ] `POST /api/home-services/accept-quote` - Accept quote

### **Step 8.3: Construction Services Routes**

- [ ] `GET /api/construction-services/types` - Get service types
- [ ] `POST /api/construction-services/book-consultation` - Book consultation
- [ ] `GET /api/construction-services/consultations` - Get consultations
- [ ] `POST /api/construction-services/generate-quote` - Generate quote
- [ ] `POST /api/construction-services/accept-quote` - Accept quote

### **Step 8.4: Marketplace Routes**

- [ ] `GET /api/marketplace/properties` - Get properties
- [ ] `POST /api/marketplace/properties` - Create property
- [ ] `GET /api/marketplace/vendors` - Get vendor list
- [ ] `GET /api/marketplace/workforce` - Get workforce list
- [ ] `POST /api/marketplace/projects` - List project
- [ ] `GET /api/marketplace/subscription-features` - Get subscription features

### **Step 8.5: Worker Management Routes**

- [ ] `GET /api/workers` - Get all workers
- [ ] `POST /api/workers` - Add new worker
- [ ] `PUT /api/workers/{id}` - Update worker
- [ ] `POST /api/workers/assign` - Assign worker to booking
- [ ] `GET /api/workers/location/{id}` - Get worker location
- [ ] `POST /api/workers/location` - Update worker location

### **Step 8.6: Real-time Communication Routes**

- [ ] `GET /api/chat/conversations` - Get chat conversations
- [ ] `POST /api/chat/send-message` - Send message
- [ ] `GET /api/chat/messages/{conversation_id}` - Get messages
- [ ] `POST /api/calls/mask-number` - Generate masked number
- [ ] `POST /api/calls/initiate` - Initiate call

### **Step 8.7: Admin Routes**

- [ ] `GET /api/admin/bookings/pending` - Get pending bookings
- [ ] `POST /api/admin/bookings/{id}/assign-worker` - Assign worker
- [ ] `GET /api/admin/workers` - Get all workers
- [ ] `POST /api/admin/quotes/generate` - Generate quote
- [ ] `GET /api/admin/inquiries/pending` - Get pending inquiries
- [ ] `PUT /api/admin/inquiries/{id}/respond` - Respond to inquiry
- [ ] `GET /api/admin/analytics` - Get platform analytics

---

## 📊 **Phase 9: Database Schema Updates**

### **Step 9.1: New Tables**

```sql
-- Module Management
modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);

-- Service Categories with Module Types
ALTER TABLE categories ADD COLUMN module_type VARCHAR(20) DEFAULT 'home_service';
ALTER TABLE categories ADD COLUMN parent_category_id BIGINT REFERENCES categories(id);

-- Services with Service Types
ALTER TABLE services ADD COLUMN service_type VARCHAR(20) DEFAULT 'fixed_price';
ALTER TABLE services ADD COLUMN inquiry_form JSONB;
ALTER TABLE services ADD COLUMN time_slot_duration INTEGER DEFAULT 60;
ALTER TABLE services ADD COLUMN max_workers INTEGER DEFAULT 1;

-- Time Slots
time_slots (
    id SERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id),
    worker_id BIGINT REFERENCES workers(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);

-- Workers
workers (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    skills JSONB,
    service_areas TEXT[],
    working_hours JSONB,
    current_location JSONB,
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP
);

-- Worker Assignments
worker_assignments (
    id SERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id),
    worker_id BIGINT REFERENCES workers(id),
    assigned_by BIGINT REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'assigned',
    assigned_at TIMESTAMP
);

-- Bookings
bookings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    service_id BIGINT REFERENCES services(id),
    worker_id BIGINT REFERENCES workers(id),
    booking_type VARCHAR(20), -- 'fixed_price', 'inquiry_based'
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_time TIMESTAMP,
    completion_time TIMESTAMP,
    price DECIMAL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    address TEXT,
    description TEXT,
    created_at TIMESTAMP
);

-- Booking Inquiries
booking_inquiries (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    service_id BIGINT REFERENCES services(id),
    requirements TEXT,
    budget DECIMAL,
    timeline VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP
);

-- Quotes
quotes (
    id SERIAL PRIMARY KEY,
    inquiry_id BIGINT REFERENCES booking_inquiries(id),
    amount DECIMAL,
    breakdown JSONB,
    validity_days INTEGER DEFAULT 7,
    status VARCHAR(20) DEFAULT 'pending',
    accepted_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Construction Consultations
construction_consultations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    service_type VARCHAR(50),
    requirements TEXT,
    budget DECIMAL,
    timeline VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP
);

-- Chat Conversations
chat_conversations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    worker_id BIGINT REFERENCES workers(id),
    booking_id BIGINT REFERENCES bookings(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP
);

-- Chat Messages
chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES chat_conversations(id),
    sender_id BIGINT REFERENCES users(id),
    message TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP
);

-- Location Tracking
location_tracking (
    id SERIAL PRIMARY KEY,
    worker_id BIGINT REFERENCES workers(id),
    booking_id BIGINT REFERENCES bookings(id),
    latitude DECIMAL,
    longitude DECIMAL,
    status VARCHAR(20), -- 'on_way', 'arrived', 'working'
    updated_at TIMESTAMP
);

-- Call Masking
call_masking (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    worker_id BIGINT REFERENCES workers(id),
    masked_number VARCHAR(20),
    original_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Marketplace Subscriptions
marketplace_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    plan_name VARCHAR(50),
    features JSONB,
    price DECIMAL,
    duration_days INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Vendors
vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    contact_info JSONB,
    rating DECIMAL DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);

-- Projects
projects (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    title VARCHAR(100),
    description TEXT,
    requirements JSONB,
    budget DECIMAL,
    timeline VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP
);
```

### **Step 9.2: Updated Tables**

```sql
-- Users table updates
ALTER TABLE users ADD COLUMN module_access JSONB DEFAULT '{"home_services": true, "construction_services": true, "marketplace": true}';
ALTER TABLE users ADD COLUMN subscription_features JSONB;

-- Properties table updates
ALTER TABLE properties ADD COLUMN is_treesindia_assured BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN verified_by BIGINT REFERENCES users(id);
ALTER TABLE properties ADD COLUMN verification_date TIMESTAMP;
```

---

## 🚀 **Phase 10: Frontend Integration**

### **Step 10.1: Admin Panel Updates**

- [ ] Add module management interface
- [ ] Create worker assignment dashboard
- [ ] Add quote generation interface
- [ ] Create inquiry management system
- [ ] Add real-time tracking dashboard
- [ ] Create subscription management
- [ ] Add analytics and reporting

### **Step 10.2: User Interface Updates**

- [ ] Update home screen with three main modules
- [ ] Create service booking interface
- [ ] Add time slot selection
- [ ] Create inquiry submission form
- [ ] Add quote acceptance interface
- [ ] Create real-time chat interface
- [ ] Add location tracking display
- [ ] Create marketplace subscription interface

### **Step 10.3: Real-time Features**

- [ ] Implement WebSocket connections
- [ ] Add real-time chat functionality
- [ ] Create live location tracking
- [ ] Add push notifications
- [ ] Implement call masking interface

---

## 📋 **Implementation Checklist**

### **Core System**

- [ ] Simplified authentication (phone+OTP only)
- [ ] Module-based architecture
- [ ] Service type management (fixed price, inquiry-based)
- [ ] Time slot management system

### **Home Services Module**

- [ ] Service categories and subcategories
- [ ] Fixed price service booking
- [ ] Inquiry-based service system
- [ ] Time slot availability
- [ ] Worker assignment system

### **Construction Services Module**

- [ ] Consultation booking system
- [ ] Requirement analysis
- [ ] Quote generation and management
- [ ] Project tracking
- [ ] Payment processing

### **Marketplace Module**

- [ ] Enhanced property listings
- [ ] Subscription features
- [ ] Vendor and workforce directories
- [ ] Project listing system
- [ ] TreesIndia Assured verification

### **Worker Management**

- [ ] Worker profiles and skills
- [ ] Assignment system
- [ ] Real-time location tracking
- [ ] Performance monitoring
- [ ] Rating and review system

### **Real-time Communication**

- [ ] WebSocket chat system
- [ ] Call masking integration
- [ ] Push notifications
- [ ] Live location sharing
- [ ] Message history

### **Booking System**

- [ ] Fixed price booking flow
- [ ] Inquiry-based booking flow
- [ ] Time slot management
- [ ] Payment integration
- [ ] Booking status tracking

### **API Endpoints**

- [ ] Authentication endpoints
- [ ] Module-specific endpoints
- [ ] Worker management endpoints
- [ ] Real-time communication endpoints
- [ ] Admin management endpoints

---

## 🎯 **Success Criteria**

### **Functional Requirements**

- [ ] Users can access three main modules
- [ ] Fixed price services work with time slot booking
- [ ] Inquiry-based services work with quote generation
- [ ] Worker assignment system functions properly
- [ ] Real-time tracking and communication work
- [ ] Marketplace subscription features are functional
- [ ] Admin can manage workers and generate quotes
- [ ] Payment system handles all booking types
- [ ] Call masking and chat work seamlessly

### **Technical Requirements**

- [ ] Database schema is properly updated
- [ ] API endpoints return proper responses
- [ ] Real-time features work smoothly
- [ ] Performance is acceptable under load
- [ ] Code follows Go best practices
- [ ] Security measures are implemented
- [ ] Error handling is comprehensive

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
- **Phase 2 (Home Services)**: 2-3 weeks
- **Phase 3 (Worker Management)**: 2 weeks
- **Phase 4 (Construction Services)**: 2 weeks
- **Phase 5 (Marketplace)**: 2-3 weeks
- **Phase 6 (Real-time Communication)**: 2-3 weeks
- **Phase 7 (Advanced Booking)**: 2 weeks
- **Phase 8 (API Endpoints)**: 1-2 weeks
- **Phase 9 (Database Updates)**: 3-5 days
- **Phase 10 (Frontend Integration)**: 2-3 weeks

**Total Estimated Time**: 16-22 weeks

---

## 🔄 **Next Steps After Completion**

1. **Testing & QA**: Comprehensive testing of all features
2. **Performance Optimization**: Database indexing and query optimization
3. **Security Audit**: Review authentication and payment security
4. **User Testing**: Beta testing with real users
5. **Production Deployment**: Deploy to production environment
6. **Monitoring Setup**: Real-time performance monitoring
7. **Analytics Implementation**: Track all key metrics

---

## 📝 **Notes & Considerations**

- Implement proper validation for all booking types
- Ensure real-time features are performant and scalable
- Plan for future expansion of subscription features
- Maintain backward compatibility where possible
- Focus on user experience for all three modules
- Implement proper error handling for real-time features
- Ensure location tracking respects privacy
- Plan for scalability of worker assignment system
- Consider mobile app performance with real-time features
- Implement proper security for call masking

---

**Last Updated**: January 2024
**Status**: Enhanced Scope Implementation - Phase 1 Planning
**Next Action**: Start Phase 1.1 - Simplified Authentication Implementation
