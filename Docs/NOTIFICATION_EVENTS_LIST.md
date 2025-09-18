# Notification Events List

This document lists all notification events with their exact messages for users and admins.

## 💰 Wallet Events

### wallet_recharge_successful

- **User:** "Wallet recharge of ₹5000.00 successful. New balance: ₹7500.00"
- **Admin:** "User +919609321665 recharged wallet of amount ₹5000.00 successful. New balance: ₹7500.00"

## 🔐 Authentication Events

### login_successful

- **User:** ❌ Removed (as per user request)
- **Admin:** "User John Doe successfully logged in via OTP"

### phone_verified

- **User:** ❌ Removed (as per user request)
- **Admin:** "Phone number +919609321665 verified by user John Doe"

### otp_sent

- **User:** ❌ Removed (as per user request)
- **Admin:** "OTP requested for phone number +919609321665 by user John Doe"

## 📅 Booking Events

### booking_created

- **User:** "Your booking for AC Repair has been created successfully. Booking ID: #BK123456"
- **Admin:** "New booking: AC Repair by +919609321665 for Jan 15, 2024 at 10:00 AM"

### booking_confirmed

- **User:** "Your booking for AC Repair has been confirmed for Jan 15, 2024 at 10:00 AM"
- **Admin:** "Booking confirmed: AC Repair by +919609321665 for Jan 15, 2024 at 10:00 AM"

### booking_cancelled

- **User:** "Your AC Repair booking has been cancelled. Reason: Customer request"
- **Admin:** "Booking cancelled: AC Repair by +919609321665"

### worker_assigned

- **User:** "Worker John Doe has been assigned to your AC Repair booking"
- **Admin:** "Worker John Doe assigned to AC Repair booking"

### worker_started

- **User:** "Worker John Doe has started your AC Repair service"
- **Admin:** "Worker John Doe started AC Repair work"

### worker_completed

- **User:** "Worker John Doe has completed your AC Repair service"
- **Admin:** "Worker John Doe completed AC Repair work for booking refrence #112345"

## 💳 Payment Events

### payment_received

- **User:** ❌ Removed (as per user request)
- **Admin:** "Payment received: ₹2,500 for AC Repair booking"

### payment_failed

- **User:** "Payment failed for your AC Repair booking. Please try again."
- **Admin:** "Payment failed: ₹2,500 for AC Repair booking"

### payment_refunded

- **User:** "Payment refunded: ₹2,500 for your AC Repair booking"
- **Admin:** "Payment refunded: ₹2,500 for AC Repair booking"

## 📋 Quote Events

### quote_provided

- **User:** "Quote provided for your AC Repair booking: ₹2,500"
- **Admin:** "Quote provided: AC Repair by +919609321665 for ₹2,500"

### quote_accepted

- **User:** "Quote accepted for your AC Repair booking. Payment required."
- **Admin:** "Quote accepted: AC Repair by +919609321665 for ₹2,500"

### quote_rejected

- **User:** "Quote rejected for your AC Repair booking"
- **Admin:** "Quote rejected: AC Repair by +919609321665"

### quote_expired

- **User:** "Quote expired for your AC Repair booking"
- **Admin:** "Quote expired: AC Repair by +919609321665"

## 👷 Worker Assignment Events

### new_assignment

- **Worker:** "New assignment: AC Repair at 123 Main St on Jan 15, 2024 at 10:00 AM"
- **Admin:** "New assignment created: AC Repair for +919609321665"

### assignment_accepted

- **Worker:** "Assignment accepted: AC Repair at 123 Main St"
- **Admin:** "Worker John Doe accepted AC Repair assignment"

### assignment_rejected

- **Worker:** "You rejected the Assignment rejected: AC Repair at 123 Main St"
- **Admin:** "Worker John Doe rejected AC Repair assignment"

### assignment_cancelled

- **Worker:** "Assignment cancelled: AC Repair booking has been cancelled"
- **Admin:** "Assignment cancelled: AC Repair booking"

## 📱 Subscription Events

### subscription_activated

- **User:** "Subscription Activated!  Your subscription has been successfully activated. You now have access to premium features until January 15, 2025."
- **Admin:** "User +919609321665 purchased Premium subscription for ₹599.00"

### subscription_expired

- **User:** "Your subscription has expired. Renew to continue using premium features."
- **Admin:** "Subscription expired: User +919609321665"

### subscription_expiry_warning

- **User:** "Your subscription expires in 3 days. Renew now to avoid service interruption."
- **Admin:** "Subscription expiry warning: User +919609321665 expires in 3 days"

## 💬 Communication Events


## 📍 Location Tracking Events


### user_registered

- **Admin:** "New user registered with phone number +919609321665"

### worker_application

- **User:** "Your worker application has been submitted successfully"
- **Admin:** "New worker application from John Doe"

### broker_application

- **User:** "Your broker application has been submitted successfully"
- **Admin:** "New broker application from John Doe"

### application_accepted

- **User:** "Your worker application has been accepted"
- **Admin:** "Worker application accepted: John Doe"

### application_rejected

- **User:** "Your worker application has been rejected"
- **Admin:** "Worker application rejected: John Doe"

## 🏠 Property Events

### property_created

- **User:** "Your property has been listed successfully"
- **Admin:** "New property listed by John Doe"

### property_approved

- **User:** "Your property listing has been approved"
- **Admin:** "Property approved: 123 Main St by John Doe"

### property_expiry_warning

- **User:** "Your property listing expires in 7 days"
- **Admin:** "Property expiry warning: 123 Main St by John Doe"

## 🛠️ Service Events

### service_added

- **User:** "New service available: AC Repair"
- **Admin:** "New service added: AC Repair"

### service_updated

- **User:** "Service updated: AC Repair pricing and details"
- **Admin:** "Service updated: AC Repair"

### ✅ Implemented

- wallet_recharge_successful
- login_successful (Admin only)
- phone_verified (Admin only)
- otp_sent (Admin only)
- booking_created (Admin only)
- worker_assigned (User only)
- new_assignment (Worker only)
- payment_received (Admin only)
- subscription_activated
- user_registered (Admin only)

### ❌ Not Implemented (Need to be coded)

- booking_confirmed
- booking_cancelled
- worker_started
- worker_completed
- payment_failed
- payment_refunded
- quote_provided
- quote_accepted
- quote_rejected
- quote_expired
- assignment_accepted
- assignment_rejected
- assignment_cancelled
- subscription_expired
- subscription_expiry_warning
- conversation_started
- customer_message
- location_tracking_started
- location_tracking_stopped
- worker_application
- broker_application
- application_accepted
- application_rejected
- property_created
- property_approved
- property_expiry_warning
- service_added
- service_updated
- service_deactivated
- system_maintenance
- feature_update

---

**Last Updated:** January 2024  
**Version:** 1.0  
**Status:** Ready for Implementation
