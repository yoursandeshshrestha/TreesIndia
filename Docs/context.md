# TREESINDIA - AI Development Context & Guidelines

## 🎯 **Project Overview**

**TREESINDIA** is a unified digital platform combining home services and real estate marketplace. Think "Uber for home services" + "Airbnb for real estate" with privacy features and AI assistance.

### **Core Vision:**

- **Single Platform**: One app for all home and property needs
- **Privacy Protection**: Call masking ensures real numbers are never shared
- **Verified Providers**: KYC verification for all service providers and sellers
- **AI Assistance**: Smart chatbot helps with booking and property discovery
- **Seamless Experience**: Easy booking, payment, and communication

---

## 🏗️ **Technical Architecture**

### **Backend Stack:**

- **Language**: Go (Golang) 1.21+
- **Framework**: Gin (HTTP framework)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: GORM
- **Authentication**: JWT tokens
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

### **📋 Planned Modules:**

#### **6. Property Management** (Next Priority)

- Property listings (sale/rent)
- Property search and filtering
- Property inquiries
- Admin approval workflow
- Location-based property discovery

#### **7. Worker Management**

- Worker registration and profiles
- KYC verification system
- Worker skills and service areas
- Worker availability management
- Worker rating and review system

#### **8. Booking Management**

- Booking creation and management
- Payment integration (Razorpay)
- Booking status workflow
- Worker assignment system
- OTP-based completion

#### **9. Communication System**

- Call masking integration
- In-app messaging
- Push notifications
- SMS/Email notifications

#### **10. AI Assistant**

- OpenAI integration
- Property recommendation engine
- Service booking assistance
- FAQ handling

---

## 🗄️ **Database Schema Overview**

### **Current Tables:**

1. **users** - User accounts and profiles
2. **categories** - Service categories
3. **subcategories** - Service subcategories
4. **services** - Available services
5. **locations** - User locations
6. **migrations** - Database migration tracking

### **Planned Tables:**

7. **properties** - Property listings
8. **workers** - Service provider profiles
9. **bookings** - Service bookings
10. **payments** - Payment transactions
11. **messages** - In-app messages
12. **notifications** - System notifications

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

1. **Property Management** - Completes dual platform vision
2. **Worker Management** - Essential for service execution
3. **Booking Management** - Core business logic
4. **Communication System** - User experience enhancement
5. **AI Assistant** - Differentiation feature

### **Implementation Priority:**

1. **Core CRUD** - Basic operations first
2. **Business Logic** - Complex workflows second
3. **Advanced Features** - Nice-to-have features last
4. **Optimization** - Performance improvements last

---

## 🔄 **Broker Conversion Process**

### **How to Convert Your Account to Broker:**

#### **Step 1: Submit Broker Application**

**Endpoint:** `POST /api/role-applications/broker`

**Required Information:**

- `broker_license`: Your broker license number
- `broker_agency`: Your broker agency name

**Optional Information (only if not in profile):**

- `email`: Your email address (only if not set in profile)
- `name`: Your full name (only if not set in profile)

**Example Request (if profile is complete):**

```json
{
  "broker_license": "BRK123456789",
  "broker_agency": "ABC Real Estate Agency"
}
```

**Example Request (if profile is missing email/name):**

```json
{
  "email": "broker@example.com",
  "name": "John Doe",
  "broker_license": "BRK123456789",
  "broker_agency": "ABC Real Estate Agency"
}
```

#### **Step 2: Application Review Process**

1. **Pending Status**: Your application goes into "pending" status
2. **Admin Review**: An admin reviews your broker credentials
3. **Approval/Rejection**: Admin can approve or reject with notes

#### **Step 3: Account Conversion**

If approved:

- Your `user_type` changes from "normal" to "broker"
- `role_application_status` becomes "approved"
- You get access to broker-specific features
- Broker-specific fields are populated:
  - `broker_license`: License number
  - `broker_agency`: Agency name

### **Current API Flow:**

```
User submits broker application → Admin reviews → Approval/Rejection → Account type updated
```

### **What's Available Now:**

✅ **Broker Application System** - Simplified application process (`/api/role-applications/broker`)
✅ **Worker Application System** - Comprehensive application process (`/api/role-applications/worker`)
✅ **Broker Profile Fields** - License and agency information
✅ **Worker Profile Fields** - Skills, documents, and location
✅ **Admin Review System** - Approval/rejection workflow
✅ **Email Notifications** - Application status updates

### **What's Coming Next:**

🔄 **Property Management** - Broker dashboard and property listing capabilities
🔄 **Broker Features** - Property management tools
🔄 **Commission System** - Earnings tracking for brokers
🔄 **Worker Dashboard** - Service booking management
🔄 **Worker Features** - Job acceptance and completion tools

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
**Version**: 1.0
**Status**: Active Development

---

_This document serves as the single source of truth for AI development assistance on the TREESINDIA project. Always refer to this context before starting any new development work._
