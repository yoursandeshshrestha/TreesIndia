# TREESINDIA - API Endpoints Documentation

## Base URL

```
https://api.treesindia.com/api/v1
```

---

## 🔐 Authentication Routes

### **Public Routes**

- `POST /auth/register` – User Registration **(Public)**
- `POST /auth/login` – User Login **(Public)**
- `POST /auth/phone-otp` – Send Phone OTP **(Public)**
- `POST /auth/verify-otp` – Verify Phone OTP **(Public)**
- `POST /auth/google-login` – Google OAuth Login **(Public)**
- `POST /auth/refresh-token` – Refresh Access Token **(Public)**
- `POST /auth/forgot-password` – Request Password Reset **(Public)**
- `POST /auth/reset-password` – Reset Password **(Public)**

### **Protected Routes**

- `POST /auth/logout` – User Logout **(Authenticated)**
- `GET /auth/profile` – Get User Profile **(Authenticated)**
- `PUT /auth/profile` – Update User Profile **(Authenticated)**
- `POST /auth/change-password` – Change Password **(Authenticated)**

---

## 👥 User Management Routes

### **User Routes (Authenticated)**

- `GET /users/profile` – Get User Profile **(User)**
- `PUT /users/profile` – Update User Profile **(User)**
- `POST /users/kyc` – Submit KYC Documents **(User)**
- `GET /users/kyc-status` – Get KYC Status **(User)**
- `POST /users/upload-avatar` – Upload Profile Picture **(User)**
- `GET /users/notifications` – Get User Notifications **(User)**
- `PUT /users/notifications/settings` – Update Notification Settings **(User)**
- `GET /users/activity` – Get User Activity History **(User)**

### **Worker Routes (Authenticated)**

- `GET /workers/profile` – Get Worker Profile **(Worker)**
- `PUT /workers/profile` – Update Worker Profile **(Worker)**
- `POST /workers/skills` – Add Worker Skills **(Worker)**
- `PUT /workers/skills` – Update Worker Skills **(Worker)**
- `POST /workers/service-areas` – Set Service Areas **(Worker)**
- `PUT /workers/service-areas` – Update Service Areas **(Worker)**
- `POST /workers/rates` – Set Service Rates **(Worker)**
- `PUT /workers/rates` – Update Service Rates **(Worker)**
- `POST /workers/availability` – Set Availability **(Worker)**
- `PUT /workers/availability` – Update Availability **(Worker)**
- `GET /workers/earnings` – Get Earnings Overview **(Worker)**
- `GET /workers/jobs` – Get Assigned Jobs **(Worker)**
- `GET /workers/reviews` – Get Worker Reviews **(Worker)**
- `POST /workers/kyc` – Submit Worker KYC **(Worker)**
- `GET /workers/kyc-status` – Get Worker KYC Status **(Worker)**

---

## 🛠️ Service Management Routes

### **Service Discovery (Public)**

- `GET /services` – Get All Services **(Public)**
- `GET /services/:id` – Get Service Details **(Public)**
- `GET /services/categories` – Get Service Categories **(Public)**
- `GET /services/nearby` – Get Services Near Location **(Public)**
- `GET /services/search` – Search Services **(Public)**

### **Service Booking (Authenticated)**

- `POST /services/book` – Book a Service **(User)**
- `POST /services/inquiry` – Submit Service Inquiry **(User)**
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
- `POST /admin/services/:id/coverage` – Set Service Coverage **(Admin)**
- `GET /admin/services/analytics` – Get Service Analytics **(Admin)**

---

## 🏘️ Property Management Routes

### **Property Discovery (Public)**

- `GET /properties` – Get All Properties **(Public)**
- `GET /properties/:id` – Get Property Details **(Public)**
- `GET /properties/search` – Search Properties **(Public)**
- `GET /properties/filters` – Get Property Filters **(Public)**
- `GET /properties/nearby` – Get Properties Near Location **(Public)**
- `GET /properties/featured` – Get Featured Properties **(Public)**
- `GET /properties/verified` – Get TREESINDIA Assured Properties **(Public)**

### **Property Management (Authenticated)**

- `POST /properties` – Create Property Listing **(User)**
- `PUT /properties/:id` – Update Property Listing **(User)**
- `DELETE /properties/:id` – Delete Property Listing **(User)**
- `GET /properties/my-listings` – Get User's Properties **(User)**
- `POST /properties/:id/images` – Upload Property Images **(User)**
- `DELETE /properties/:id/images/:imageId` – Delete Property Image **(User)**
- `POST /properties/:id/inquiry` – Submit Property Inquiry **(User)**
- `GET /properties/inquiries` – Get Property Inquiries **(User)**
- `POST /properties/:id/visit` – Schedule Property Visit **(User)**
- `GET /properties/visits` – Get Scheduled Visits **(User)**
- `PUT /properties/visits/:id` – Update Visit Status **(User)**

### **Property Management (Admin)**

- `GET /admin/properties` – Get All Properties **(Admin)**
- `GET /admin/properties/pending` – Get Pending Approvals **(Admin)**
- `PUT /admin/properties/:id/approve` – Approve Property **(Admin)**
- `PUT /admin/properties/:id/reject` – Reject Property **(Admin)**
- `PUT /admin/properties/:id/verify` – Mark as TREESINDIA Assured **(Admin)**
- `DELETE /admin/properties/:id` – Delete Property **(Admin)**
- `GET /admin/properties/analytics` – Get Property Analytics **(Admin)**

---

## 📋 Booking Management Routes

### **Booking Management (User)**

- `GET /bookings` – Get User Bookings **(User)**
- `GET /bookings/:id` – Get Booking Details **(User)**
- `PUT /bookings/:id/cancel` – Cancel Booking **(User)**
- `POST /bookings/:id/complete` – Complete Service **(User)**
- `POST /bookings/:id/review` – Review Service **(User)**
- `GET /bookings/:id/track` – Track Service Progress **(User)**

### **Booking Management (Worker)**

- `GET /workers/bookings` – Get Assigned Jobs **(Worker)**
- `GET /workers/bookings/:id` – Get Job Details **(Worker)**
- `PUT /workers/bookings/:id/accept` – Accept Job **(Worker)**
- `PUT /workers/bookings/:id/reject` – Reject Job **(Worker)**
- `PUT /workers/bookings/:id/start` – Start Service **(Worker)**
- `PUT /workers/bookings/:id/update` – Update Service Progress **(Worker)**
- `PUT /workers/bookings/:id/complete` – Complete Service **(Worker)**
- `POST /workers/bookings/:id/request-otp` – Request Completion OTP **(Worker)**

### **Booking Management (Admin)**

- `GET /admin/bookings` – Get All Bookings **(Admin)**
- `GET /admin/bookings/pending` – Get Pending Bookings **(Admin)**
- `PUT /admin/bookings/:id/approve` – Approve Booking **(Admin)**
- `PUT /admin/bookings/:id/reject` – Reject Booking **(Admin)**
- `POST /admin/bookings/:id/assign-worker` – Assign Worker **(Admin)**
- `PUT /admin/bookings/:id/status` – Update Booking Status **(Admin)**
- `GET /admin/bookings/analytics` – Get Booking Analytics **(Admin)**

---

## 💳 Payment & Finance Routes

### **Payment Processing (Authenticated)**

- `POST /payments/create` – Create Payment Intent **(User)**
- `POST /payments/verify` – Verify Payment **(User)**
- `POST /payments/refund` – Request Refund **(User)**
- `GET /payments/history` – Get Payment History **(User)**
- `GET /payments/:id` – Get Payment Details **(User)**

### **Financial Management (Worker)**

- `GET /workers/payments` – Get Worker Payments **(Worker)**
- `GET /workers/payments/pending` – Get Pending Settlements **(Worker)**
- `POST /workers/payments/withdraw` – Request Withdrawal **(Worker)**
- `GET /workers/payments/analytics` – Get Payment Analytics **(Worker)**

### **Financial Management (Admin)**

- `GET /admin/payments` – Get All Payments **(Admin)**
- `GET /admin/payments/pending` – Get Pending Settlements **(Admin)**
- `POST /admin/payments/settle` – Process Settlements **(Admin)**
- `GET /admin/payments/analytics` – Get Financial Analytics **(Admin)**
- `GET /admin/revenue` – Get Revenue Overview **(Admin)**
- `GET /admin/commission` – Get Commission Reports **(Admin)**

---

## 💬 Communication Routes

### **Chat & Messaging (Authenticated)**

- `GET /chat/conversations` – Get Chat Conversations **(User/Worker)**
- `GET /chat/conversations/:id` – Get Conversation Details **(User/Worker)**
- `POST /chat/conversations/:id/messages` – Send Message **(User/Worker)**
- `GET /chat/conversations/:id/messages` – Get Messages **(User/Worker)**
- `PUT /chat/messages/:id/read` – Mark Message as Read **(User/Worker)**

### **Call Masking (Authenticated)**

- `POST /calls/create` – Create Masked Call **(User)**
- `GET /calls/history` – Get Call History **(User)**
- `GET /calls/:id` – Get Call Details **(User)**
- `POST /calls/:id/end` – End Call **(User)**

### **Notifications (Authenticated)**

- `GET /notifications` – Get Notifications **(User/Worker)**
- `PUT /notifications/:id/read` – Mark Notification as Read **(User/Worker)**
- `PUT /notifications/settings` – Update Notification Settings **(User/Worker)**
- `DELETE /notifications/:id` – Delete Notification **(User/Worker)**

---

## 🤖 AI Assistant Routes

### **AI Chatbot (Public)**

- `POST /ai/chat` – Send Message to AI Assistant **(Public)**
- `GET /ai/chat/history` – Get Chat History **(Authenticated)**
- `POST /ai/recommendations` – Get AI Recommendations **(Authenticated)**
- `POST /ai/search` – AI-Powered Search **(Public)**
- `POST /ai/query` – General AI Query **(Public)**

### **AI Management (Admin)**

- `GET /admin/ai/analytics` – Get AI Usage Analytics **(Admin)**
- `GET /admin/ai/queries` – Get Common Queries **(Admin)**
- `POST /admin/ai/train` – Train AI Model **(Admin)**
- `GET /admin/ai/performance` – Get AI Performance Metrics **(Admin)**

---

## 📊 Analytics & Reporting Routes

### **User Analytics (Authenticated)**

- `GET /analytics/usage` – Get User Usage Analytics **(User)**
- `GET /analytics/bookings` – Get Booking Analytics **(User)**
- `GET /analytics/properties` – Get Property Analytics **(User)**

### **Worker Analytics (Authenticated)**

- `GET /workers/analytics/performance` – Get Performance Analytics **(Worker)**
- `GET /workers/analytics/earnings` – Get Earnings Analytics **(Worker)**
- `GET /workers/analytics/ratings` – Get Rating Analytics **(Worker)**
- `GET /workers/analytics/jobs` – Get Job Analytics **(Worker)**

### **Admin Analytics (Admin)**

- `GET /admin/analytics/dashboard` – Get Dashboard Analytics **(Admin)**
- `GET /admin/analytics/users` – Get User Analytics **(Admin)**
- `GET /admin/analytics/services` – Get Service Analytics **(Admin)**
- `GET /admin/analytics/properties` – Get Property Analytics **(Admin)**
- `GET /admin/analytics/bookings` – Get Booking Analytics **(Admin)**
- `GET /admin/analytics/revenue` – Get Revenue Analytics **(Admin)**
- `GET /admin/analytics/performance` – Get Platform Performance **(Admin)**
- `GET /admin/analytics/ai` – Get AI Analytics **(Admin)**

---

## 🔧 System Management Routes

### **Health & Monitoring (Public)**

- `GET /health` – Health Check **(Public)**
- `GET /health/detailed` – Detailed Health Check **(Admin)**
- `GET /system/status` – System Status **(Admin)**
- `GET /system/metrics` – System Metrics **(Admin)**

### **Configuration Management (Admin)**

- `GET /admin/config` – Get System Configuration **(Admin)**
- `PUT /admin/config` – Update System Configuration **(Admin)**
- `GET /admin/config/features` – Get Feature Flags **(Admin)**
- `PUT /admin/config/features` – Update Feature Flags **(Admin)**

### **Content Management (Admin)**

- `GET /admin/content/faq` – Get FAQ Content **(Admin)**
- `POST /admin/content/faq` – Create FAQ **(Admin)**
- `PUT /admin/content/faq/:id` – Update FAQ **(Admin)**
- `DELETE /admin/content/faq/:id` – Delete FAQ **(Admin)**
- `GET /admin/content/terms` – Get Terms & Conditions **(Admin)**
- `PUT /admin/content/terms` – Update Terms & Conditions **(Admin)**
- `GET /admin/content/privacy` – Get Privacy Policy **(Admin)**
- `PUT /admin/content/privacy` – Update Privacy Policy **(Admin)**

---

## 🛡️ Security & Verification Routes

### **KYC Management (Admin)**

- `GET /admin/kyc/pending` – Get Pending KYC Requests **(Admin)**
- `PUT /admin/kyc/:id/approve` – Approve KYC **(Admin)**
- `PUT /admin/kyc/:id/reject` – Reject KYC **(Admin)**
- `GET /admin/kyc/:id` – Get KYC Details **(Admin)**
- `GET /admin/kyc/analytics` – Get KYC Analytics **(Admin)**

### **Security Management (Admin)**

- `GET /admin/security/logs` – Get Security Logs **(Admin)**
- `GET /admin/security/incidents` – Get Security Incidents **(Admin)**
- `POST /admin/security/block-user` – Block User **(Admin)**
- `POST /admin/security/unblock-user` – Unblock User **(Admin)**
- `GET /admin/security/audit` – Get Audit Trail **(Admin)**

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

**TREESINDIA API** - Complete REST API for home services and real estate marketplace platform.
