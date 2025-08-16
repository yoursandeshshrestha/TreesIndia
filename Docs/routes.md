# TREESINDIA - API Routes Documentation

## 🎯 **Overview**

This document contains all the API routes for the TREESINDIA platform, organized by module and functionality. All routes are prefixed with `/api/v1` and require authentication unless specified otherwise.

---

## 🔐 **Authentication Routes**

### **OTP-based Authentication**

```http
POST   /api/v1/auth/request-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/refresh-token
GET    /api/v1/auth/me
POST   /api/v1/auth/logout
```

**Request Body Examples:**

#### Request OTP

```json
{
  "phone": "+919876543210"
}
```

#### Verify OTP

```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

---

## 👤 **User Management Routes**

### **User Profile**

```http
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
POST   /api/v1/users/upload-avatar
GET    /api/v1/users/notifications
PUT    /api/v1/users/notifications
```

### **Role Applications**

```http
POST   /api/v1/role-applications/worker
POST   /api/v1/role-applications/contractor
POST   /api/v1/role-applications/broker
GET    /api/v1/role-applications/me
```

### **Credit & Wallet System**

```http
GET    /api/v1/users/credits
POST   /api/v1/users/buy-credits
GET    /api/v1/users/wallet
POST   /api/v1/users/wallet/recharge
GET    /api/v1/users/wallet/transactions
```

**Request Body Examples:**

#### Buy Credits

```json
{
  "credits": 10,
  "amount": 500,
  "payment_method": "razorpay"
}
```

#### Recharge Wallet

```json
{
  "amount": 1000,
  "payment_method": "razorpay"
}
```

---

## 🏠 **Home Services Routes**

### **Service Categories**

```http
GET    /api/v1/services/categories
GET    /api/v1/services/categories/:id/subcategories
GET    /api/v1/services/subcategories/:id/services
```

### **Services**

```http
GET    /api/v1/services
GET    /api/v1/services/:id
GET    /api/v1/services/search
GET    /api/v1/services/popular
```

**Query Parameters for Services:**

```
?category_id=1
?subcategory_id=2
?price_min=100&price_max=1000
?rating_min=4
?location=Siliguri
?sort=price_asc|price_desc|rating|popularity
```

### **Service Bookings**

```http
POST   /api/v1/bookings
GET    /api/v1/bookings
GET    /api/v1/bookings/:id
PUT    /api/v1/bookings/:id/cancel
POST   /api/v1/bookings/:id/complete
GET    /api/v1/bookings/timeslots
```

**Request Body Examples:**

#### Create Booking

```json
{
  "service_id": 1,
  "scheduled_date": "2024-01-20",
  "scheduled_time": "14:00",
  "address": "123 Main Street, Siliguri",
  "description": "Tap repair needed urgently"
}
```

#### Complete Booking

```json
{
  "otp": "123456",
  "rating": 5,
  "review": "Excellent service, very professional"
}
```

---

## 👷 **Contractor Routes**

### **Contractor Discovery**

```http
GET    /api/v1/contractors
GET    /api/v1/contractors/search
GET    /api/v1/contractors/:id
GET    /api/v1/contractors/:id/availability
```

**Query Parameters for Contractor Search:**

```
?profession=plumber
?location=Siliguri
?rating_min=4
?price_min=200&price_max=500
?experience_min=5
?available_today=true
?sort=rating|experience|price
```

### **Contractor Contact**

```http
POST   /api/v1/contractors/:id/contact
POST   /api/v1/contractors/:id/schedule-meeting
GET    /api/v1/contractors/:id/reviews
```

**Request Body Examples:**

#### Contact Contractor

```json
{
  "contact_type": "call",
  "message": "Need plumbing work for my new house",
  "preferred_date": "2024-01-20",
  "preferred_time": "15:00"
}
```

#### Schedule Meeting

```json
{
  "meeting_date": "2024-01-20",
  "meeting_time": "15:00",
  "meeting_location": "My house at 123 Main Street",
  "purpose": "Discuss renovation project"
}
```

### **Contractor Profile Management**

```http
GET    /api/v1/contractor/profile
PUT    /api/v1/contractor/profile
POST   /api/v1/contractor/availability
GET    /api/v1/contractor/contacts
PUT    /api/v1/contractor/contacts/:id/respond
```

**Request Body Examples:**

#### Update Contractor Profile

```json
{
  "business_name": "ABC Plumbing Services",
  "profession": "plumber",
  "experience_years": 8,
  "skills": ["tap repair", "pipe installation", "drainage"],
  "service_areas": ["Siliguri", "Darjeeling"],
  "hourly_rate": 300,
  "daily_rate": 2000,
  "working_hours": {
    "monday": { "start": "09:00", "end": "18:00" },
    "tuesday": { "start": "09:00", "end": "18:00" }
  }
}
```

---

## 🏘️ **Property Routes**

### **Property Discovery**

```http
GET    /api/v1/properties
GET    /api/v1/properties/search
GET    /api/v1/properties/:id
GET    /api/v1/properties/slug/:slug
GET    /api/v1/properties/featured
```

**Query Parameters for Property Search:**

```
?listing_type=sale|rent
?property_type=apartment|house|villa
?location=Siliguri
?price_min=500000&price_max=2000000
?bedrooms=2
?bathrooms=2
?area_min=1000&area_max=2000
?sort=price_asc|price_desc|date|popularity
```

### **Property Management (Owners/Brokers)**

```http
POST   /api/v1/properties
GET    /api/v1/user/properties
PUT    /api/v1/properties/:id
DELETE /api/v1/properties/:id
POST   /api/v1/properties/:id/feature
```

**Request Body Examples:**

#### Create Property

```json
{
  "title": "Beautiful 2BHK Apartment in City Center",
  "description": "Well-maintained apartment with modern amenities",
  "property_type": "apartment",
  "listing_type": "sale",
  "bedrooms": 2,
  "bathrooms": 2,
  "area_sqft": 1200,
  "price": 1500000,
  "address": "123 Main Street",
  "city": "Siliguri",
  "state": "West Bengal",
  "postal_code": "734001",
  "latitude": 26.7271,
  "longitude": 88.3953,
  "amenities": ["parking", "gym", "garden"],
  "images": ["url1", "url2", "url3"]
}
```

### **Property Inquiries**

```http
POST   /api/v1/properties/:id/inquire
GET    /api/v1/user/property-inquiries
PUT    /api/v1/property-inquiries/:id/respond
POST   /api/v1/properties/:id/schedule-visit
```

**Request Body Examples:**

#### Property Inquiry

```json
{
  "inquiry_type": "visit",
  "message": "Interested in viewing this property",
  "preferred_date": "2024-01-20",
  "preferred_time": "16:00",
  "contact_phone": "+919876543210",
  "contact_email": "buyer@example.com"
}
```

---

## 💳 **Subscription Routes**

### **Subscription Management**

```http
GET    /api/v1/subscriptions/plans
POST   /api/v1/subscriptions/purchase
GET    /api/v1/subscriptions/my-subscription
PUT    /api/v1/subscriptions/cancel
POST   /api/v1/subscriptions/renew
```

**Request Body Examples:**

#### Purchase Subscription

```json
{
  "plan_name": "professional",
  "plan_type": "monthly",
  "amount": 999,
  "payment_method": "razorpay"
}
```

---

## 📍 **Location Routes**

### **Location Management**

```http
POST   /api/v1/locations
GET    /api/v1/locations/user/me
GET    /api/v1/locations/:id
PUT    /api/v1/locations/:id
DELETE /api/v1/locations/:id
```

**Request Body Examples:**

#### Create Location

```json
{
  "latitude": 26.7271,
  "longitude": 88.3953,
  "address": "123 Main Street",
  "city": "Siliguri",
  "state": "West Bengal",
  "postal_code": "734001",
  "source": "gps"
}
```

---

## ⚙️ **Admin Routes**

### **Admin Dashboard**

```http
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/analytics
```

### **User Management**

```http
GET    /api/v1/admin/users
GET    /api/v1/admin/users/:id
PUT    /api/v1/admin/users/:id/verify
GET    /api/v1/admin/role-applications
PUT    /api/v1/admin/role-applications/:id
```

**Request Body Examples:**

#### Update Role Application

```json
{
  "status": "approved",
  "admin_notes": "All documents verified, approved for contractor role"
}
```

### **Service Management**

```http
GET    /api/v1/admin/services
POST   /api/v1/admin/services
PUT    /api/v1/admin/services/:id
DELETE /api/v1/admin/services/:id
```

### **Property Management**

```http
GET    /api/v1/admin/properties/pending
PUT    /api/v1/admin/properties/:id/approve
DELETE /api/v1/admin/properties/:id
```

### **Worker Management**

```http
GET    /api/v1/admin/workers
POST   /api/v1/admin/workers/:id/assign
GET    /api/v1/admin/bookings/pending
PUT    /api/v1/admin/bookings/:id/assign-worker
```

**Request Body Examples:**

#### Assign Worker

```json
{
  "worker_id": 123,
  "booking_id": 456,
  "assigned_by": 789,
  "notes": "Experienced plumber for this job"
}
```

### **Financial Management**

```http
GET    /api/v1/admin/revenue
GET    /api/v1/admin/transactions
PUT    /api/v1/admin/config
```

**Request Body Examples:**

#### Update System Config

```json
{
  "credit_limit": 3,
  "wallet_limit": 100000,
  "commission_rate": 10,
  "subscription_plans": {
    "basic": { "price": 499, "listings": 10 },
    "professional": { "price": 999, "listings": 50 },
    "enterprise": { "price": 1999, "listings": -1 }
  }
}
```

---

## 🔍 **Search & Discovery Routes**

### **Global Search**

```http
GET    /api/v1/search
GET    /api/v1/search/services
GET    /api/v1/search/contractors
GET    /api/v1/search/properties
```

**Query Parameters:**

```
?q=plumber
?location=Siliguri
?type=services|contractors|properties
?limit=20&offset=0
```

### **Recommendations**

```http
GET    /api/v1/recommendations/services
GET    /api/v1/recommendations/contractors
GET    /api/v1/recommendations/properties
```

---

## 📊 **Analytics Routes**

### **User Analytics**

```http
GET    /api/v1/analytics/user/activity
GET    /api/v1/analytics/user/bookings
GET    /api/v1/analytics/user/properties
```

### **Business Analytics (Admin)**

```http
GET    /api/v1/admin/analytics/revenue
GET    /api/v1/admin/analytics/users
GET    /api/v1/admin/analytics/bookings
GET    /api/v1/admin/analytics/properties
```

---

## 📱 **Notification Routes**

### **Push Notifications**

```http
GET    /api/v1/notifications
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/read-all
POST   /api/v1/notifications/settings
```

---

## 🔧 **System Routes**

### **Health Check**

```http
GET    /api/v1/health
POST   /api/v1/test-email
```

### **File Upload**

```http
POST   /api/v1/upload/image
POST   /api/v1/upload/document
POST   /api/v1/upload/avatar
```

---

## 🤖 **AI Assistant Routes**

### **AI Chat & Assistance**

```http
POST   /api/v1/ai/chat
GET    /api/v1/ai/conversations
POST   /api/v1/ai/property-search
POST   /api/v1/ai/service-search
GET    /api/v1/ai/suggestions
```

**Request Body Examples:**

#### AI Chat

```json
{
  "message": "I need a plumber for tap repair",
  "context": "home_services",
  "user_location": "Siliguri"
}
```

#### AI Property Search

```json
{
  "query": "2BHK apartment under 20 lakhs in Siliguri",
  "filters": {
    "property_type": "apartment",
    "bedrooms": 2,
    "max_price": 2000000,
    "location": "Siliguri"
  }
}
```

#### AI Service Search

```json
{
  "query": "AC repair service",
  "location": "Siliguri",
  "urgency": "urgent",
  "budget": "500-1000"
}
```

### **AI Recommendations**

```http
GET    /api/v1/ai/recommendations/services
GET    /api/v1/ai/recommendations/contractors
GET    /api/v1/ai/recommendations/properties
POST   /api/v1/ai/smart-matching
```

**Request Body Examples:**

#### Smart Matching

```json
{
  "user_id": 123,
  "service_type": "plumbing",
  "location": "Siliguri",
  "budget": 500,
  "urgency": "normal"
}
```

---

## 💬 **Communication Routes**

### **User-Worker Communication (After Booking)**

```http
GET    /api/v1/bookings/:id/chat
POST   /api/v1/bookings/:id/chat/message
GET    /api/v1/bookings/:id/chat/messages
POST   /api/v1/bookings/:id/call
GET    /api/v1/bookings/:id/call-status
POST   /api/v1/bookings/:id/call/end
```

**Request Body Examples:**

#### Send Message to Worker

```json
{
  "message": "I'll be home by 2 PM. Please call me when you arrive.",
  "message_type": "text"
}
```

#### Initiate Call to Worker

```json
{
  "call_type": "voice",
  "duration_limit": 300
}
```

### **User-Contractor Communication**

```http
GET    /api/v1/contractors/:id/chat
POST   /api/v1/contractors/:id/chat/message
GET    /api/v1/contractors/:id/chat/messages
POST   /api/v1/contractors/:id/call
GET    /api/v1/contractors/:id/call-status
```

### **User-Property Owner Communication**

```http
GET    /api/v1/properties/:id/chat
POST   /api/v1/properties/:id/chat/message
GET    /api/v1/properties/:id/chat/messages
POST   /api/v1/properties/:id/call
```

### **Real-time Communication**

```http
GET    /api/v1/chat/rooms
GET    /api/v1/chat/rooms/:room_id
POST   /api/v1/chat/rooms/:room_id/messages
GET    /api/v1/chat/rooms/:room_id/messages
PUT    /api/v1/chat/rooms/:room_id/typing
```

**Request Body Examples:**

#### Send Chat Message

```json
{
  "message": "What time will you arrive?",
  "message_type": "text",
  "attachments": []
}
```

#### Typing Indicator

```json
{
  "is_typing": true,
  "user_id": 123
}
```

---

## 📱 **Real-time Features**

### **Live Location Tracking**

```http
GET    /api/v1/bookings/:id/worker-location
POST   /api/v1/bookings/:id/worker-location/update
GET    /api/v1/bookings/:id/eta
```

**Request Body Examples:**

#### Update Worker Location

```json
{
  "latitude": 26.7271,
  "longitude": 88.3953,
  "status": "on_way",
  "estimated_arrival": "2024-01-20T14:30:00Z"
}
```

### **Push Notifications**

```http
POST   /api/v1/notifications/send
GET    /api/v1/notifications/settings
PUT    /api/v1/notifications/settings
POST   /api/v1/notifications/subscribe
POST   /api/v1/notifications/unsubscribe
```

**Request Body Examples:**

#### Send Notification

```json
{
  "user_id": 123,
  "title": "Worker is on the way",
  "body": "Your plumber will arrive in 15 minutes",
  "data": {
    "booking_id": 456,
    "worker_name": "John Doe"
  },
  "notification_type": "booking_update"
}
```

---

## 🔄 **Booking Workflow Routes**

### **Booking Status Management**

```http
GET    /api/v1/bookings/:id/status
PUT    /api/v1/bookings/:id/status
POST   /api/v1/bookings/:id/accept
POST   /api/v1/bookings/:id/reject
POST   /api/v1/bookings/:id/start
POST   /api/v1/bookings/:id/complete
POST   /api/v1/bookings/:id/cancel
```

**Request Body Examples:**

#### Update Booking Status

```json
{
  "status": "in_progress",
  "notes": "Started the repair work",
  "estimated_completion": "2024-01-20T16:00:00Z"
}
```

#### Complete Booking

```json
{
  "completion_notes": "Tap repair completed successfully",
  "materials_used": ["new tap", "sealant"],
  "photos": ["url1", "url2"],
  "otp": "123456"
}
```

### **Booking Disputes**

```http
POST   /api/v1/bookings/:id/dispute
GET    /api/v1/bookings/:id/dispute
PUT    /api/v1/bookings/:id/dispute/resolve
POST   /api/v1/bookings/:id/dispute/escalate
```

**Request Body Examples:**

#### Create Dispute

```json
{
  "dispute_type": "service_quality",
  "description": "The repair was not done properly",
  "evidence": ["photo1", "photo2"],
  "requested_action": "refund"
}
```

---

## 📊 **Worker Management Routes**

### **Worker Dashboard**

```http
GET    /api/v1/worker/dashboard
GET    /api/v1/worker/bookings
GET    /api/v1/worker/earnings
GET    /api/v1/worker/schedule
PUT    /api/v1/worker/availability
```

### **Worker Actions**

```http
POST   /api/v1/worker/bookings/:id/accept
POST   /api/v1/worker/bookings/:id/reject
POST   /api/v1/worker/bookings/:id/start
POST   /api/v1/worker/bookings/:id/complete
PUT    /api/v1/worker/bookings/:id/update-location
```

**Request Body Examples:**

#### Update Worker Availability

```json
{
  "available": true,
  "working_hours": {
    "monday": { "start": "09:00", "end": "18:00" },
    "tuesday": { "start": "09:00", "end": "18:00" },
    "wednesday": { "start": "09:00", "end": "18:00" },
    "thursday": { "start": "09:00", "end": "18:00" },
    "friday": { "start": "09:00", "end": "18:00" },
    "saturday": { "start": "09:00", "end": "16:00" },
    "sunday": { "available": false }
  },
  "service_areas": ["Siliguri", "Matigara"],
  "max_distance": 20
}
```

#### Worker Location Update

```json
{
  "latitude": 26.7271,
  "longitude": 88.3953,
  "status": "available",
  "current_booking_id": null
}
```

---

## 🔐 **Security & Privacy Routes**

### **Call Masking**

```http
POST   /api/v1/calls/mask
GET    /api/v1/calls/masked/:masked_number
POST   /api/v1/calls/connect
POST   /api/v1/calls/end
GET    /api/v1/calls/history
```

**Request Body Examples:**

#### Create Masked Call

```json
{
  "user_id": 123,
  "worker_id": 456,
  "booking_id": 789,
  "call_type": "voice",
  "duration_limit": 300
}
```

### **Privacy Settings**

```http
GET    /api/v1/privacy/settings
PUT    /api/v1/privacy/settings
POST   /api/v1/privacy/request-data
DELETE /api/v1/privacy/delete-account
```

**Request Body Examples:**

#### Update Privacy Settings

```json
{
  "share_location": true,
  "share_phone": false,
  "receive_notifications": true,
  "allow_tracking": true,
  "data_usage": "analytics_only"
}
```

---

## 💳 **Payment Routes**

### **Payment Processing**

```http
POST   /api/v1/payments/create-order
POST   /api/v1/payments/verify
GET    /api/v1/payments/history
POST   /api/v1/payments/refund
GET    /api/v1/payments/invoice/:id
```

**Request Body Examples:**

#### Create Payment Order

```json
{
  "amount": 500,
  "currency": "INR",
  "purpose": "service_booking",
  "reference_id": "booking_123",
  "reference_type": "booking",
  "payment_method": "razorpay",
  "user_id": 123,
  "description": "Payment for tap repair service"
}
```

#### Verify Payment

```json
{
  "payment_id": "pay_1234567890",
  "order_id": "order_1234567890",
  "signature": "razorpay_signature_hash",
  "reference_id": "booking_123"
}
```

#### Request Refund

```json
{
  "payment_id": "pay_1234567890",
  "amount": 500,
  "reason": "service_cancelled",
  "description": "Customer cancelled the service"
}
```

---

## ⭐ **Review & Rating Routes**

### **Review Management**

```http
POST   /api/v1/reviews
GET    /api/v1/reviews/:id
PUT    /api/v1/reviews/:id
DELETE /api/v1/reviews/:id
GET    /api/v1/users/:id/reviews
GET    /api/v1/services/:id/reviews
GET    /api/v1/contractors/:id/reviews
```

**Request Body Examples:**

#### Create Review

```json
{
  "booking_id": 123,
  "service_id": 456,
  "worker_id": 789,
  "rating": 5,
  "review": "Excellent service! The plumber was professional and completed the work quickly.",
  "review_type": "service", // service, contractor, property
  "photos": ["url1", "url2"],
  "anonymous": false
}
```

#### Update Review

```json
{
  "rating": 4,
  "review": "Good service, but could have been faster. Updated review.",
  "photos": ["url1", "url2", "url3"]
}
```

#### Get User Reviews

```json
{
  "user_id": 123,
  "review_type": "service",
  "page": 1,
  "limit": 10,
  "sort": "latest"
}
```

---

## 🚨 **Emergency Services Routes**

### **Emergency Request Management**

```http
POST   /api/v1/emergency/request
GET    /api/v1/emergency/status
POST   /api/v1/emergency/cancel
GET    /api/v1/emergency/history
```

**Request Body Examples:**

#### Create Emergency Request

```json
{
  "emergency_type": "plumbing",
  "description": "Water pipe burst, urgent repair needed",
  "location": {
    "latitude": 26.7271,
    "longitude": 88.3953,
    "address": "123 Main Street, Siliguri"
  },
  "urgency_level": "critical", // low, medium, high, critical
  "preferred_time": "immediate",
  "budget_range": "500-1000",
  "contact_phone": "+919876543210",
  "additional_notes": "Water is leaking from the ceiling"
}
```

#### Update Emergency Status

```json
{
  "status": "worker_assigned",
  "worker_id": 456,
  "estimated_arrival": "2024-01-20T15:30:00Z",
  "notes": "Experienced plumber assigned, will arrive in 30 minutes"
}
```

#### Cancel Emergency Request

```json
{
  "reason": "issue_resolved_self",
  "notes": "Managed to fix the issue temporarily",
  "cancellation_fee": 0
}
```

#### Get Emergency History

```json
{
  "user_id": 123,
  "status": "completed",
  "date_from": "2024-01-01",
  "date_to": "2024-01-31",
  "page": 1,
  "limit": 10
}
```

---

## 📋 **Response Format**

### **Success Response**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Error Response**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Paginated Response**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

---

## 🔐 **Authentication**

### **JWT Token**

All protected routes require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### **Token Refresh**

When the access token expires, use the refresh token:

```http
POST /api/v1/auth/refresh-token
Authorization: Bearer <refresh_token>
```

---

## 📝 **Rate Limiting**

- **Public Routes**: 100 requests per minute
- **Authenticated Routes**: 1000 requests per minute
- **Admin Routes**: 5000 requests per minute
- **File Upload**: 10 requests per minute

---

## 🚨 **Error Codes**

| Code | Description                                         |
| ---- | --------------------------------------------------- |
| 400  | Bad Request - Invalid input data                    |
| 401  | Unauthorized - Authentication required              |
| 403  | Forbidden - Insufficient permissions                |
| 404  | Not Found - Resource not found                      |
| 422  | Validation Error - Business logic validation failed |
| 429  | Too Many Requests - Rate limit exceeded             |
| 500  | Internal Server Error - Server error                |

---

## 📚 **Additional Resources**

- [API Documentation](./API_ENDPOINTS.md)
- [Database Schema](./database-schema.md)
- [Authentication Guide](./auth-guide.md)
- [Rate Limiting Policy](./rate-limiting.md)

---

**Last Updated**: January 2024
**Version**: 1.0
**Status**: Active Development
