# TREESINDIA - API Endpoints Documentation

## Base URL

```
https://api.treesindia.com/api/v1
```

---

## 🔐 **Authentication Routes**

### **Simplified Phone + OTP Authentication:**

#### **Request OTP**

```
POST /api/auth/request-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+919876543210",
    "expires_in": 60
  }
}
```

#### **Verify OTP & Login**

```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "phone": "+919876543210",
      "name": "John Doe",
      "role": "user",
      "credits_remaining": 3,
      "wallet_balance": 0.0,
      "wallet_limit": 100000.0,
      "subscription_id": null,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here",
    "is_new_user": true
  }
}
```

### **Authentication Features:**

- **Single Method**: Phone + OTP only
- **Auto-registration**: First login creates account
- **Auto-credits**: New users get 3 free credits
- **Auto-wallet**: Wallet initialized with 0 balance
- **JWT Token**: Session management
- **Role-based**: User, Broker, Admin roles

---

## 👥 User Management Routes

### **User Routes (Authenticated)**

- `GET /users/profile` – Get User Profile **(User)**
- `PUT /users/profile` – Update User Profile **(User)**
- `GET /users/credits` – Get User Credits **(User)**
- `POST /users/buy-credits` – Purchase Credits **(User)**
- `GET /users/wallet` – Get Wallet Balance **(User)**
- `POST /users/wallet/recharge` – Recharge Wallet **(User)**
- `GET /users/wallet/transactions` – Get Wallet Transaction History **(User)**
- `POST /users/upload-avatar` – Upload Profile Picture **(User)**
- `GET /users/notifications` – Get User Notifications **(User)**
- `PUT /users/notifications/settings` – Update Notification Settings **(User)**

---

## 💳 Credit & Wallet System Routes

### **Credit Management (Authenticated)**

- `GET /credits/balance` – Get Credit Balance **(User)**
- `POST /credits/purchase` – Purchase Credits **(User)**
- `GET /credits/history` – Get Credit Usage History **(User)**
- `GET /credits/packages` – Get Available Credit Packages **(Public)**

### **Wallet Management (Authenticated)**

- `GET /wallet/balance` – Get Wallet Balance **(User)**
- `POST /wallet/recharge` – Recharge Wallet **(User)**
- `GET /wallet/transactions` – Get Transaction History **(User)**
- `POST /wallet/withdraw` – Request Withdrawal **(User)**
- `GET /wallet/limits` – Get Wallet Limits **(User)**

---

## 📦 Subscription System Routes

### **Subscription Management (Authenticated)**

- `GET /subscriptions/plans` – Get Available Subscription Plans **(Public)**
- `POST /subscriptions/purchase` – Purchase Subscription **(User)**
- `GET /subscriptions/my-subscription` – Get User's Current Subscription **(User)**
- `PUT /subscriptions/cancel` – Cancel Subscription **(User)**
- `GET /subscriptions/history` – Get Subscription History **(User)**
- `POST /subscriptions/renew` – Renew Subscription **(User)**

### **Subscription Management (Admin)**

- `GET /admin/subscriptions/plans` – Get All Subscription Plans **(Admin)**
- `POST /admin/subscriptions/plans` – Create Subscription Plan **(Admin)**
- `PUT /admin/subscriptions/plans/:id` – Update Subscription Plan **(Admin)**
- `DELETE /admin/subscriptions/plans/:id` – Delete Subscription Plan **(Admin)**
- `GET /admin/subscriptions/users` – Get All User Subscriptions **(Admin)**
- `PUT /admin/subscriptions/users/:id/status` – Update User Subscription Status **(Admin)**

---

## 🏠 Home Services Module Routes

### **Service Discovery (Public)**

- `GET /services/categories` – Get Service Categories **(Public)**
- `GET /services/subcategories/{category_id}` – Get Subcategories **(Public)**
- `GET /services/list/{subcategory_id}` – Get Services by Subcategory **(Public)**
- `GET /services/{id}` – Get Service Details **(Public)**
- `GET /services/search` – Search Services **(Public)**
- `GET /services/nearby` – Get Services Near Location **(Public)**

### **Service Booking (Authenticated)**

- `POST /services/book` – Book a Service **(User)**
- `GET /services/bookings` – Get User Bookings **(User)**
- `GET /services/bookings/:id` – Get Booking Details **(User)**
- `PUT /services/bookings/:id/cancel` – Cancel Booking **(User)**
- `POST /services/bookings/:id/complete` – Complete Service (OTP) **(User)**
- `POST /services/bookings/:id/review` – Review Service **(User)**

### **Service Management (Admin)**

- `POST /admin/services` – Create New Service **(Admin)**
- `PUT /admin/services/:id` – Update Service **(Admin)**
- `DELETE /admin/services/:id` – Delete Service **(Admin)**
- `GET /admin/services` – Get All Services **(Admin)**
- `PUT /admin/services/:id/status` – Update Service Status **(Admin)**
- `GET /admin/services/analytics` – Get Service Analytics **(Admin)**

---



---

## 🏘️ Real Estate Module Routes

### **Property Discovery (Public)**

- `GET /properties` – Get All Properties **(Public)**
- `GET /properties/{id}` – Get Property Details **(Public)**
- `GET /properties/search` – Search Properties **(Public)**
- `GET /properties/filters` – Get Property Filters **(Public)**
- `GET /properties/nearby` – Get Properties Near Location **(Public)**
- `GET /properties/featured` – Get Featured Properties **(Public)**
- `GET /properties/verified` – Get Verified Properties **(Public)**

### **Property Management (Authenticated)**

- `POST /properties` – Create Property Listing **(User - Credit Check)**
- `PUT /properties/{id}` – Update Property Listing **(User)**
- `DELETE /properties/{id}` – Delete Property Listing **(User)**
- `GET /properties/my-listings` – Get User's Properties **(User)**
- `POST /properties/{id}/images` – Upload Property Images **(User)**
- `DELETE /properties/{id}/images/:imageId` – Delete Property Image **(User)**
- `POST /properties/{id}/inquiry` – Submit Property Inquiry **(User)**
- `GET /properties/inquiries` – Get Property Inquiries **(User)**
- `POST /properties/{id}/visit` – Schedule Property Visit **(User)**
- `GET /properties/visits` – Get Scheduled Visits **(User)**
- `PUT /properties/visits/{id}` – Update Visit Status **(User)**

### **Property Management (Admin)**

- `GET /admin/properties` – Get All Properties **(Admin)**
- `GET /admin/properties/pending` – Get Pending Approvals **(Admin)**
- `PUT /admin/properties/{id}/approve` – Approve Property **(Admin)**
- `PUT /admin/properties/{id}/reject` – Reject Property **(Admin)**
- `PUT /admin/properties/{id}/verify` – Mark as Verified **(Admin)**
- `DELETE /admin/properties/{id}` – Delete Property **(Admin)**
- `GET /admin/properties/analytics` – Get Property Analytics **(Admin)**

---

## ⚙️ Admin Configuration Routes

### **System Configuration (Admin)**

- `GET /admin/config` – Get System Configuration **(Admin)**
- `PUT /admin/config` – Update System Configuration **(Admin)**
- `GET /admin/config/credit-limits` – Get Credit Limits **(Admin)**
- `PUT /admin/config/credit-limits` – Update Credit Limits **(Admin)**
- `GET /admin/config/wallet-limits` – Get Wallet Limits **(Admin)**
- `PUT /admin/config/wallet-limits` – Update Wallet Limits **(Admin)**
- `GET /admin/config/subscription-prices` – Get Subscription Prices **(Admin)**
- `PUT /admin/config/subscription-prices` – Update Subscription Prices **(Admin)**

### **User Management (Admin)**

- `GET /admin/users` – Get All Users **(Admin)**
- `GET /admin/users/{id}` – Get User Details **(Admin)**
- `PUT /admin/users/{id}/credits` – Update User Credits **(Admin)**
- `PUT /admin/users/{id}/wallet` – Update User Wallet **(Admin)**
- `PUT /admin/users/{id}/status` – Update User Status **(Admin)**
- `GET /admin/users/analytics` – Get User Analytics **(Admin)**

---

## 💬 Communication Routes

### **Chat & Messaging (Authenticated)**

- `GET /chat/conversations` – Get Chat Conversations **(User)**
- `GET /chat/conversations/{id}` – Get Conversation Details **(User)**
- `POST /chat/conversations/{id}/messages` – Send Message **(User)**
- `GET /chat/conversations/{id}/messages` – Get Messages **(User)**
- `PUT /chat/messages/{id}/read` – Mark Message as Read **(User)**

### **Call Masking (Authenticated)**

- `POST /calls/create` – Create Masked Call **(User)**
- `GET /calls/history` – Get Call History **(User)**
- `GET /calls/{id}` – Get Call Details **(User)**
- `POST /calls/{id}/end` – End Call **(User)**

### **Notifications (Authenticated)**

- `GET /notifications` – Get Notifications **(User)**
- `PUT /notifications/{id}/read` – Mark Notification as Read **(User)**
- `PUT /notifications/settings` – Update Notification Settings **(User)**
- `DELETE /notifications/{id}` – Delete Notification **(User)**

---

## 💳 Payment & Finance Routes

### **Payment Processing (Authenticated)**

- `POST /payments/create` – Create Payment Intent **(User)**
- `POST /payments/verify` – Verify Payment **(User)**
- `POST /payments/refund` – Request Refund **(User)**
- `GET /payments/history` – Get Payment History **(User)**
- `GET /payments/{id}` – Get Payment Details **(User)**

### **Financial Management (Admin)**

- `GET /admin/payments` – Get All Payments **(Admin)**
- `GET /admin/payments/pending` – Get Pending Settlements **(Admin)**
- `POST /admin/payments/settle` – Process Settlements **(Admin)**
- `GET /admin/payments/analytics` – Get Financial Analytics **(Admin)**
- `GET /admin/revenue` – Get Revenue Overview **(Admin)**
- `GET /admin/commission` – Get Commission Reports **(Admin)**

---

## 📊 Analytics & Reporting Routes

### **User Analytics (Authenticated)**

- `GET /analytics/usage` – Get User Usage Analytics **(User)**
- `GET /analytics/credits` – Get Credit Usage Analytics **(User)**
- `GET /analytics/wallet` – Get Wallet Analytics **(User)**
- `GET /analytics/properties` – Get Property Analytics **(User)**

### **Admin Analytics (Admin)**

- `GET /admin/analytics/dashboard` – Get Dashboard Analytics **(Admin)**
- `GET /admin/analytics/users` – Get User Analytics **(Admin)**
- `GET /admin/analytics/credits` – Get Credit Analytics **(Admin)**
- `GET /admin/analytics/wallet` – Get Wallet Analytics **(Admin)**
- `GET /admin/analytics/subscriptions` – Get Subscription Analytics **(Admin)**
- `GET /admin/analytics/services` – Get Service Analytics **(Admin)**

- `GET /admin/analytics/properties` – Get Property Analytics **(Admin)**
- `GET /admin/analytics/revenue` – Get Revenue Analytics **(Admin)**
- `GET /admin/analytics/performance` – Get Platform Performance **(Admin)**

---

## 🔧 System Management Routes

### **Health & Monitoring (Public)**

- `GET /health` – Health Check **(Public)**
- `GET /health/detailed` – Detailed Health Check **(Admin)**
- `GET /system/status` – System Status **(Admin)**
- `GET /system/metrics` – System Metrics **(Admin)**

### **Content Management (Admin)**

- `GET /admin/content/faq` – Get FAQ Content **(Admin)**
- `POST /admin/content/faq` – Create FAQ **(Admin)**
- `PUT /admin/content/faq/{id}` – Update FAQ **(Admin)**
- `DELETE /admin/content/faq/{id}` – Delete FAQ **(Admin)**
- `GET /admin/content/terms` – Get Terms & Conditions **(Admin)**
- `PUT /admin/content/terms` – Update Terms & Conditions **(Admin)**
- `GET /admin/content/privacy` – Get Privacy Policy **(Admin)**
- `PUT /admin/content/privacy` – Update Privacy Policy **(Admin)**

---

## 📱 Mobile App Specific Routes

### **App Configuration (Public)**

- `GET /app/config` – Get App Configuration **(Public)**
- `GET /app/version` – Get App Version Info **(Public)**
- `GET /app/features` – Get Feature Flags **(Public)**
- `POST /app/feedback` – Submit App Feedback **(Authenticated)**
- `POST /app/crash-report` – Submit Crash Report **(Public)**

### **Push Notifications (Authenticated)**

- `POST /notifications/register-device` – Register Device Token **(Authenticated)**
- `DELETE /notifications/unregister-device` – Unregister Device Token **(Authenticated)**
- `PUT /notifications/push-settings` – Update Push Settings **(Authenticated)**

---

## 🔄 Webhook Routes

### **External Integrations (Public)**

- `POST /webhooks/razorpay` – Razorpay Payment Webhook **(Public)**
- `POST /webhooks/twilio` – Twilio SMS/Call Webhook **(Public)**
- `POST /webhooks/firebase` – Firebase Notification Webhook **(Public)**
- `POST /webhooks/google` – Google OAuth Webhook **(Public)**
- `POST /webhooks/cloudinary` – Cloudinary Upload Webhook **(Public)**

---

## 📋 Rate Limits

### **Public Endpoints**

- **Rate Limit**: 100 requests per minute per IP
- **Burst Limit**: 10 requests per second

### **Authenticated Endpoints**

- **Rate Limit**: 1000 requests per minute per user
- **Burst Limit**: 100 requests per second

### **Admin Endpoints**

- **Rate Limit**: 5000 requests per minute per admin
- **Burst Limit**: 500 requests per second

---

## 🔐 Authentication

### **Token Types**

- **Access Token**: JWT token with 1 hour expiry
- **Refresh Token**: JWT token with 7 days expiry
- **API Key**: For admin and integration access

### **Authorization Headers**

```
Authorization: Bearer <access_token>
X-API-Key: <api_key>  // For admin endpoints
```

---

## 📊 Response Format

### **Success Response**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Error Response**

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Credit Response Example**

```json
{
  "success": true,
  "message": "Credits retrieved successfully",
  "data": {
    "credits_remaining": 2,
    "credits_used": 1,
    "total_credits_earned": 3
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### **Wallet Response Example**

```json
{
  "success": true,
  "message": "Wallet balance retrieved successfully",
  "data": {
    "wallet_balance": 5000.0,
    "wallet_limit": 100000.0,
    "currency": "INR"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🚀 API Versioning

- **Current Version**: v1
- **Version Header**: `X-API-Version: v1`
- **Deprecation Policy**: 6 months notice for breaking changes
- **Backward Compatibility**: Maintained for 12 months

---

## 📞 Support

- **API Documentation**: https://docs.treesindia.com
- **Developer Support**: developers@treesindia.com
- **Status Page**: https://status.treesindia.com
- **Rate Limit Info**: https://api.treesindia.com/rate-limits

---

**TREESINDIA API** - Complete REST API for unified home services and real estate platform with credit and wallet system.
