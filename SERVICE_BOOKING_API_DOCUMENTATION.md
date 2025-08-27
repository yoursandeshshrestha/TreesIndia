# TREESINDIA Service Booking API Documentation

## Overview

This document provides comprehensive documentation for the service booking API endpoints and workflows in the TREESINDIA project. The system supports two types of service bookings:

1. **Fixed Price Services** - Direct booking with upfront pricing
2. **Inquiry Price Services** - Quote-based booking requiring admin approval

## Table of Contents

- [Service Discovery](#service-discovery)
- [Fixed Price Booking Flow](#fixed-price-booking-flow)
- [Inquiry Price Booking Flow](#inquiry-price-booking-flow)
- [Quote Management](#quote-management)
- [Payment Processing](#payment-processing)
- [Booking Management](#booking-management)
- [Admin Operations](#admin-operations)
- [Implementation Status](#implementation-status)

## Service Discovery

### Get Available Services

**Endpoint:** `GET /api/v1/services`

**Query Parameters:**

- `city` (optional): City name for location filtering
- `state` (optional): State name for location filtering (e.g., "West+Bengal")
- `category` (optional): Category ID
- `subcategory` (optional): Subcategory ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `price_min` (optional): Minimum price filter
- `price_max` (optional): Maximum price filter
- `sort_by` (optional): Sort field
- `sort_order` (optional): Sort direction (asc/desc)

**Example Request:**

```
GET /api/v1/services?state=West+Bengal&page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "message": "Services retrieved successfully",
  "data": {
    "pagination": {
      "has_next": false,
      "has_prev": false,
      "limit": 10,
      "page": 1,
      "total": 9,
      "total_pages": 1
    },
    "services": [
      {
        "id": 8,
        "name": "Building Plan Approval",
        "slug": "building-plan-approval",
        "description": "Building plan design and approval services",
        "images": [
          "https://res.cloudinary.com/dxw83r0h4/image/upload/v1756194371/services/services/building_plan_1756194367.jpg.jpg"
        ],
        "price_type": "inquiry",
        "price": null,
        "duration": null,
        "category_id": 2,
        "subcategory_id": 7,
        "category_name": "Construction Services",
        "subcategory_name": "Plan Sanction",
        "is_active": true,
        "created_at": "2025-08-25T20:15:19.028375Z",
        "updated_at": "2025-08-26T07:46:13.170889Z",
        "deleted_at": null,
        "service_areas": [
          {
            "id": 1,
            "city": "Siliguri",
            "state": "West Bengal",
            "country": "India",
            "is_active": true
          },
          {
            "id": 2,
            "city": "Darjeeling",
            "state": "West Bengal",
            "country": "India",
            "is_active": true
          }
        ]
      },
      {
        "id": 3,
        "name": "General Pest Control",
        "slug": "general-pest-control",
        "description": "Complete pest control treatment for your home",
        "images": [
          "https://res.cloudinary.com/dxw83r0h4/image/upload/v1756194387/services/services/pest_control_image_1756194386.jpg.jpg"
        ],
        "price_type": "fixed",
        "price": 1500,
        "duration": "6 hours",
        "category_id": 1,
        "subcategory_id": 2,
        "category_name": "Home Services",
        "subcategory_name": "Pest Control",
        "is_active": true,
        "created_at": "2025-08-25T20:15:19.028375Z",
        "updated_at": "2025-08-26T07:46:29.594358Z",
        "deleted_at": null,
        "service_areas": [
          {
            "id": 1,
            "city": "Siliguri",
            "state": "West Bengal",
            "country": "India",
            "is_active": true
          }
        ]
      }
    ]
  },
  "timestamp": "2025-08-27T10:21:09.191156632Z"
}
```

### Get Service Details

**Endpoint:** `GET /api/v1/services/{service_id}`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Home Cleaning Service",
    "description": "Professional home cleaning service",
    "price_type": "fixed",
    "price": 500.0,
    "duration": "2 hours",
    "image_urls": ["url1", "url2"],
    "areas_served": ["bakura", "other_areas"],
    "category": {
      "id": 1,
      "name": "Home Services"
    },
    "subcategory": {
      "id": 1,
      "name": "Cleaning"
    }
  }
}
```

## Booking Configuration

Before starting any booking flow, first retrieve the booking configuration to understand system constraints.

### Get Booking Configuration

**Endpoint:** `GET /api/v1/bookings/config`

**Headers:** None required (public endpoint)

**Response:**

```json
{
  "data": {
    "booking_advance_days": "3",
    "booking_buffer_time_minutes": "30",
    "booking_hold_time_minutes": "7",
    "working_hours_end": "22:00",
    "working_hours_start": "09:00"
  },
  "message": "Booking config retrieved successfully",
  "success": true
}
```

**Configuration Parameters:**
- `booking_advance_days`: Minimum days in advance required for booking
- `booking_buffer_time_minutes`: Buffer time between bookings
- `booking_hold_time_minutes`: Time to hold booking before payment (7 minutes for fixed price)
- `working_hours_start`: Daily service start time
- `working_hours_end`: Daily service end time

## Fixed Price Booking Flow

For services with `"price_type": "fixed"`, users can directly book with date/time selection.

### Step 1: Check Available Time Slots

**Endpoint:** `GET /api/v1/bookings/available-slots`

**Query Parameters:**

- `service_id` (required): Service ID
- `date` (required): Date in YYYY-MM-DD format

**Headers:**

```
Authorization: Bearer {user_token}
```

**Example Request:**

```
GET /api/v1/bookings/available-slots?service_id=1&date=2024-01-15
```

**Response:**

```json
{
  "data": {
    "working_hours": {
      "end": "22:00",
      "start": "09:00"
    },
    "service_duration": 120,
    "buffer_time": 30,
    "available_slots": [
      {
        "time": "09:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "09:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "10:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "10:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "11:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "11:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "12:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "12:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "13:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "13:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "14:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "14:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "15:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "15:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "16:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "16:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "17:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "17:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "18:00",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "18:30",
        "available_workers": 5,
        "is_available": true
      },
      {
        "time": "19:00",
        "available_workers": 5,
        "is_available": true
      }
    ]
  },
  "message": "Available slots retrieved successfully",
  "success": true
}
```

### Step 2: Create Fixed Price Booking

**Endpoint:** `POST /api/v1/bookings`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "service_id": 1,
  "scheduled_date": "2024-01-15",
  "scheduled_time": "10:00",
  "address": {
    "name": "Home",
    "address": "123 Main Street",
    "city": "bakura",
    "state": "West Bengal",
    "country": "India",
    "postal_code": "721101",
    "latitude": 22.5726,
    "longitude": 88.3639
  },
  "description": "Regular house cleaning",
  "contact_person": "John Doe",
  "contact_phone": "+919876543210",
  "special_instructions": "Please bring your own cleaning supplies"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001234",
      "service_id": 1,
      "service_name": "Home Cleaning Service",
      "status": "temporary_hold",
      "scheduled_date": "2024-01-15",
      "scheduled_time": "10:00",
      "total_amount": 500.0,
      "hold_expires_at": "2024-01-14T14:07:00Z",
      "razorpay_order_id": "order_xyz123"
    },
    "payment_details": {
      "razorpay_key": "rzp_live_xyz",
      "order_id": "order_xyz123",
      "amount": 50000,
      "currency": "INR"
    }
  }
}
```

### Step 3: Verify Payment

**Endpoint:** `POST /api/v1/bookings/{booking_id}/verify-payment`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "razorpay_payment_id": "pay_abc123",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "signature_hash"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001234",
      "status": "confirmed",
      "payment_status": "completed",
      "scheduled_date": "2024-01-15",
      "scheduled_time": "10:00",
      "total_amount": 500.0
    }
  },
  "message": "Booking confirmed successfully"
}
```

## Inquiry Price Booking Flow

For services with `"price_type": "inquiry"`, users must submit an inquiry and wait for admin quote.

### Step 1: Get Inquiry Booking Fee

**Endpoint:** `GET /api/v1/services/{service_id}`

Check if the service requires an inquiry fee:

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Plumbing Consultation",
    "price_type": "inquiry",
    "inquiry_fee": 100.0,
    "inquiry_fee_required": true
  }
}
```

### Step 2: Create Inquiry Booking

**Endpoint:** `POST /api/v1/bookings/inquiry`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "service_id": 2,
  "address": {
    "name": "Home",
    "address": "123 Main Street",
    "city": "bakura",
    "state": "West Bengal",
    "country": "India",
    "postal_code": "721101",
    "latitude": 22.5726,
    "longitude": 88.3639
  },
  "description": "Kitchen sink is leaking and needs immediate repair",
  "contact_person": "John Doe",
  "contact_phone": "+919876543210",
  "special_instructions": "Available weekdays after 6 PM"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001235",
      "service_id": 2,
      "service_name": "Plumbing Consultation",
      "status": "pending",
      "booking_type": "inquiry",
      "inquiry_fee": 100.0,
      "razorpay_order_id": "order_abc456"
    },
    "payment_details": {
      "razorpay_key": "rzp_live_xyz",
      "order_id": "order_abc456",
      "amount": 10000,
      "currency": "INR",
      "description": "Inquiry booking fee"
    }
  }
}
```

### Step 3: Verify Inquiry Payment (if required)

**Endpoint:** `POST /api/v1/bookings/inquiry/verify-payment`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "service_id": 2,
  "razorpay_payment_id": "pay_def789",
  "razorpay_order_id": "order_abc456",
  "razorpay_signature": "signature_hash"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001235",
      "status": "pending",
      "inquiry_fee_paid": true,
      "inquiry_fee_amount": 100.0
    }
  },
  "message": "Inquiry fee paid successfully. Admin will provide quote within 24 hours."
}
```

## Quote Management

### Get Quote Information

**Endpoint:** `GET /api/v1/bookings/{booking_id}/quote-info`

**Headers:**

```
Authorization: Bearer {user_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking_id": "BK001235",
    "quote": {
      "amount": 1500.0,
      "notes": "Includes pipe replacement and labor charges",
      "provided_at": "2024-01-14T10:30:00Z",
      "expires_at": "2024-01-21T10:30:00Z",
      "status": "active"
    },
    "booking_status": "quote_provided"
  }
}
```

### Accept Quote

**Endpoint:** `POST /api/v1/bookings/{booking_id}/accept-quote`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "notes": "Accepted the quote. Please schedule at earliest convenience."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001235",
      "status": "quote_accepted",
      "quote_amount": 1500.0
    }
  },
  "message": "Quote accepted successfully"
}
```

### Reject Quote

**Endpoint:** `POST /api/v1/bookings/{booking_id}/reject-quote`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Quote amount is higher than expected budget"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001235",
      "status": "rejected"
    }
  },
  "message": "Quote rejected"
}
```

### Create Quote Payment

**Endpoint:** `POST /api/v1/bookings/{booking_id}/create-quote-payment`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "scheduled_date": "2024-01-16",
  "scheduled_time": "14:00",
  "amount": 1500.0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "payment_details": {
      "razorpay_key": "rzp_live_xyz",
      "order_id": "order_quote_789",
      "amount": 150000,
      "currency": "INR",
      "description": "Service payment for BK001235"
    }
  }
}
```

### Verify Quote Payment

**Endpoint:** `POST /api/v1/bookings/{booking_id}/verify-quote-payment`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "razorpay_payment_id": "pay_quote_123",
  "razorpay_order_id": "order_quote_789",
  "razorpay_signature": "signature_hash"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001235",
      "status": "confirmed",
      "payment_status": "completed",
      "scheduled_date": "2024-01-16",
      "scheduled_time": "14:00",
      "total_amount": 1500.0
    }
  },
  "message": "Payment successful. Booking confirmed."
}
```

## Payment Processing

### Create Razorpay Order

**Endpoint:** `POST /api/v1/razorpay/create-order`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 50000,
  "currency": "INR",
  "receipt": "booking_BK001234"
}
```

### Verify Razorpay Payment

**Endpoint:** `POST /api/v1/razorpay/verify`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "razorpay_payment_id": "pay_abc123",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "signature_hash"
}
```

## Booking Management

### Get User Bookings

**Endpoint:** `GET /api/v1/bookings`

**Headers:**

```
Authorization: Bearer {user_token}
```

**Query Parameters:**

- `status` (optional): Filter by booking status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "BK001234",
        "service_name": "Home Cleaning Service",
        "status": "confirmed",
        "scheduled_date": "2024-01-15",
        "scheduled_time": "10:00",
        "total_amount": 500.0,
        "created_at": "2024-01-14T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

### Get Booking Details

**Endpoint:** `GET /api/v1/bookings/{booking_id}`

**Headers:**

```
Authorization: Bearer {user_token}
```

**Query Parameters:**

- `detailed=true` (optional): Get detailed booking information

**Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "BK001234",
      "service": {
        "id": 1,
        "name": "Home Cleaning Service",
        "duration": "2 hours"
      },
      "status": "assigned",
      "scheduled_date": "2024-01-15",
      "scheduled_time": "10:00",
      "address": {
        "name": "Home",
        "address": "123 Main Street",
        "city": "bakura",
        "state": "West Bengal"
      },
      "assigned_worker": {
        "name": "Ram Kumar",
        "phone": "+919876543211",
        "rating": 4.8
      },
      "payment": {
        "amount": 500.0,
        "status": "completed",
        "method": "razorpay"
      },
      "created_at": "2024-01-14T12:00:00Z"
    }
  }
}
```

### Cancel Booking

**Endpoint:** `PUT /api/v1/bookings/{booking_id}/cancel`

**Headers:**

```
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Change of plans"
}
```

## Admin Operations

### Get All Bookings (Admin)

**Endpoint:** `GET /api/v1/admin/bookings`

**Headers:**

```
Authorization: Bearer {admin_token}
```

**Query Parameters:**

- `status` (optional): Filter by booking status
- `booking_type` (optional): Filter by booking type (regular/inquiry)
- `payment_status` (optional): Filter by payment status
- `search` (optional): Search by reference or customer name
- `page` (optional): Page number
- `limit` (optional): Items per page

### Provide Quote (Admin)

**Endpoint:** `POST /api/v1/admin/bookings/{booking_id}/provide-quote`

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 1500.0,
  "notes": "Quote includes materials and labor charges",
  "expires_in": 7
}
```

### Assign Worker (Admin)

**Endpoint:** `POST /api/v1/admin/bookings/{booking_id}/assign-worker`

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "worker_id": 5,
  "notes": "Assigned based on availability and location"
}
```

### Update Booking Status (Admin)

**Endpoint:** `PUT /api/v1/admin/bookings/{booking_id}/status`

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "in_progress",
  "notes": "Worker has started the service"
}
```

### Get Booking Dashboard (Admin)

**Endpoint:** `GET /api/v1/admin/bookings/dashboard`

**Headers:**

```
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_bookings": 150,
      "pending_bookings": 12,
      "confirmed_bookings": 45,
      "completed_bookings": 78,
      "total_revenue": 125000.00
    },
    "recent_bookings": [...],
    "payment_stats": {
      "total_payments": 145000.00,
      "pending_payments": 5000.00,
      "successful_rate": 95.5
    },
    "worker_stats": {
      "active_workers": 25,
      "assigned_workers": 18,
      "available_workers": 7
    }
  }
}
```

## Booking Status Workflow

### Fixed Price Services

```
temporary_hold (7 min timer) → confirmed → scheduled → assigned → in_progress → completed
                             ↓
                         (expired/cancelled)
```

### Inquiry Price Services

```
pending → quote_provided → quote_accepted → confirmed → scheduled → assigned → in_progress → completed
        ↓                ↓
    (admin review)   (quote_rejected)
```

## Implementation Status

### Backend API (✅ Fully Implemented)

- Complete booking API with all endpoints
- Payment integration with Razorpay
- Quote management system
- Worker assignment functionality
- Admin management tools

### Admin Panel (✅ Fully Implemented)

- Comprehensive booking management interface
- Quote generation and management
- Worker assignment with availability checking
- Payment tracking and refunds
- Analytics dashboard with real-time stats
- Advanced filtering and search capabilities

### Web App (❌ Limited Implementation)

- ✅ Service discovery and display
- ✅ Location-based filtering
- ✅ Popular services showcase
- ❌ **Missing:** Complete booking workflow
- ❌ **Missing:** Payment integration
- ❌ **Missing:** User booking management
- ❌ **Missing:** Date/time selection
- ❌ **Missing:** Address management

### Test Flow (✅ Reference Implementation Available)

- Complete booking workflow for both service types
- Full Razorpay payment integration
- Service selection and scheduling
- Address management
- Booking history and management

## Next Steps for Web App Implementation

To complete the booking functionality in the web app, implement these components:

1. **Service Detail Pages** - Detailed view with booking options
2. **Booking Flow Components** - Step-by-step booking process
3. **Date/Time Selection** - Available slots interface
4. **Address Management** - Save and select addresses
5. **Payment Integration** - Razorpay checkout process
6. **User Dashboard** - Booking history and management
7. **Authentication** - User login/registration for bookings

The test-flow directory contains reference implementations for all these features.
