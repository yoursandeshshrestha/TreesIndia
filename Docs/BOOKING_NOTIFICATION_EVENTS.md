# Booking Service Notification Events

This document outlines all notification events related to the booking service, including their current implementation status and recommended actions.

## 📋 Table of Contents

- [Booking Workflow Overview](#booking-workflow-overview)
- [Current Implementation Status](#current-implementation-status)
- [Notification Events by User Type](#notification-events-by-user-type)
- [Implementation Priority](#implementation-priority)
- [Technical Implementation Details](#technical-implementation-details)

## 🏗️ Booking Workflow Overview

### Booking Statuses

| Status           | Description                                | Notification Trigger |
| ---------------- | ------------------------------------------ | -------------------- |
| `pending`        | Initial status for inquiry bookings        | ❌ Not implemented   |
| `quote_provided` | Admin provided quote                       | ❌ Not implemented   |
| `quote_accepted` | Customer accepted quote                    | ❌ Not implemented   |
| `confirmed`      | Booking confirmed and ready for scheduling | ❌ Placeholder only  |
| `scheduled`      | Service scheduled                          | ❌ Not implemented   |
| `partially_paid` | Partially paid (for segmented payments)    | ❌ Not implemented   |
| `assigned`       | Worker assigned                            | ✅ Implemented       |
| `in_progress`    | Service in progress                        | ❌ Placeholder only  |
| `completed`      | Service completed                          | ❌ Placeholder only  |
| `cancelled`      | Booking cancelled                          | ❌ Not implemented   |
| `rejected`       | Quote rejected                             | ❌ Not implemented   |
| `temporary_hold` | Temporary hold for payment verification    | ❌ Not implemented   |

### Booking Types

- **Regular Booking**: Direct booking with fixed price
- **Inquiry Booking**: Quote-based booking requiring admin approval

## 📊 Current Implementation Status

### ✅ Implemented Notifications

| Event               | User Type | Notification Type         | Status    |
| ------------------- | --------- | ------------------------- | --------- |
| New Booking Created | Admin     | `booking_created`         | ✅ Active |
| Worker Assigned     | User      | `worker_assigned`         | ✅ Active |
| Worker Assigned     | Worker    | `worker_assigned_to_work` | ✅ Active |
| Payment Received    | Admin     | `payment_received`        | ✅ Active |

### ❌ Not Implemented (Placeholders Only)

| Event                      | User Type | Notification Type     | Status         |
| -------------------------- | --------- | --------------------- | -------------- |
| Booking Confirmation       | User      | `booking_confirmed`   | ❌ Placeholder |
| Worker Started             | User      | `worker_started`      | ❌ Placeholder |
| Worker Completed           | User      | `worker_completed`    | ❌ Placeholder |
| Worker Assignment Accepted | Admin     | `assignment_accepted` | ❌ Placeholder |
| Worker Assignment Rejected | Admin     | `assignment_rejected` | ❌ Placeholder |

### ❌ Missing Notifications

| Event                | User Type | Notification Type      | Status     |
| -------------------- | --------- | ---------------------- | ---------- |
| Quote Provided       | User      | `quote_provided`       | ❌ Missing |
| Quote Accepted       | Admin     | `quote_accepted`       | ❌ Missing |
| Quote Rejected       | Admin     | `quote_rejected`       | ❌ Missing |
| Quote Expiry Warning | User      | `quote_expiry_warning` | ❌ Missing |
| Booking Cancelled    | User      | `booking_cancelled`    | ❌ Missing |
| Booking Cancelled    | Admin     | `booking_cancelled`    | ❌ Missing |
| Payment Failed       | User      | `payment_failed`       | ❌ Missing |
| Payment Failed       | Admin     | `payment_failed`       | ❌ Missing |

## 👥 Notification Events by User Type

### 🔵 User Notifications

#### Booking Lifecycle

| Event                    | Trigger                   | Message Example                                                               | Priority  |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------- | --------- |
| **Booking Confirmed**    | Status → `confirmed`      | "Your booking for AC Repair has been confirmed for Jan 15, 2024 at 10:00 AM"  | 🔴 High   |
| **Quote Provided**       | Status → `quote_provided` | "Quote provided for your AC Repair booking: ₹2,500. Valid until Jan 20, 2024" | 🔴 High   |
| **Quote Expiry Warning** | 24h before expiry         | "Your quote for AC Repair expires in 24 hours. Please accept or reject it."   | 🟡 Medium |
| **Worker Assigned**      | Status → `assigned`       | "Worker John Doe has been assigned to your AC Repair booking"                 | 🔴 High   |
| **Worker Started**       | Status → `in_progress`    | "Worker John Doe has started your AC Repair service"                          | 🟡 Medium |
| **Worker Completed**     | Status → `completed`      | "Worker John Doe has completed your AC Repair service"                        | 🔴 High   |
| **Booking Cancelled**    | Status → `cancelled`      | "Your AC Repair booking has been cancelled. Reason: Customer request"         | 🔴 High   |

#### Payment Events

| Event                | Trigger                   | Message Example                                                 | Priority  |
| -------------------- | ------------------------- | --------------------------------------------------------------- | --------- |
| **Payment Failed**   | Payment status → `failed` | "Payment failed for your AC Repair booking. Please try again."  | 🔴 High   |
| **Payment Reminder** | 24h before service        | "Reminder: Payment pending for your AC Repair booking tomorrow" | 🟡 Medium |

### 🟠 Worker Notifications

#### Assignment Events

| Event                    | Trigger                   | Message Example                                                        | Priority  |
| ------------------------ | ------------------------- | ---------------------------------------------------------------------- | --------- |
| **New Assignment**       | Worker assigned           | "New assignment: AC Repair at 123 Main St on Jan 15, 2024 at 10:00 AM" | 🔴 High   |
| **Assignment Updated**   | Assignment details change | "Assignment updated: AC Repair time changed to 11:00 AM"               | 🟡 Medium |
| **Assignment Cancelled** | Assignment cancelled      | "Assignment cancelled: AC Repair booking has been cancelled"           | 🔴 High   |

#### Work Events

| Event                | Trigger                | Message Example                                   | Priority  |
| -------------------- | ---------------------- | ------------------------------------------------- | --------- |
| **Work Started**     | Worker starts work     | "Work started for AC Repair assignment"           | 🟡 Medium |
| **Work Completed**   | Worker completes work  | "Work completed for AC Repair assignment"         | 🟡 Medium |
| **Customer Message** | Customer sends message | "New message from customer for AC Repair booking" | 🟡 Medium |

#### Location Tracking

| Event                         | Trigger         | Message Example                                      | Priority |
| ----------------------------- | --------------- | ---------------------------------------------------- | -------- |
| **Location Tracking Started** | Tracking begins | "Location tracking started for AC Repair assignment" | 🟢 Low   |
| **Location Tracking Stopped** | Tracking ends   | "Location tracking stopped for AC Repair assignment" | 🟢 Low   |

### 🔴 Admin Notifications

#### Booking Management

| Event                 | Trigger                 | Message Example                                            | Priority  |
| --------------------- | ----------------------- | ---------------------------------------------------------- | --------- |
| **New Booking**       | Booking created         | "New booking: AC Repair by +919876543210 for Jan 15, 2024" | 🔴 High   |
| **Booking Cancelled** | Status → `cancelled`    | "Booking cancelled: AC Repair by +919876543210"            | 🟡 Medium |
| **Quote Required**    | Inquiry booking created | "Quote required: AC Repair inquiry by +919876543210"       | 🔴 High   |
| **Quote Expired**     | Quote expires           | "Quote expired: AC Repair inquiry by +919876543210"        | 🟡 Medium |

#### Worker Management

| Event                   | Trigger                    | Message Example                                 | Priority  |
| ----------------------- | -------------------------- | ----------------------------------------------- | --------- |
| **Worker Assigned**     | Worker assigned to booking | "Worker John Doe assigned to AC Repair booking" | 🟡 Medium |
| **Assignment Accepted** | Worker accepts assignment  | "Worker John Doe accepted AC Repair assignment" | 🟡 Medium |
| **Assignment Rejected** | Worker rejects assignment  | "Worker John Doe rejected AC Repair assignment" | 🔴 High   |
| **Work Started**        | Worker starts work         | "Worker John Doe started AC Repair work"        | 🟡 Medium |
| **Work Completed**      | Worker completes work      | "Worker John Doe completed AC Repair work"      | 🟡 Medium |

#### Payment Management

| Event                | Trigger           | Message Example                                  | Priority  |
| -------------------- | ----------------- | ------------------------------------------------ | --------- |
| **Payment Received** | Payment completed | "Payment received: ₹2,500 for AC Repair booking" | 🔴 High   |
| **Payment Failed**   | Payment fails     | "Payment failed: ₹2,500 for AC Repair booking"   | 🔴 High   |
| **Payment Refunded** | Payment refunded  | "Payment refunded: ₹2,500 for AC Repair booking" | 🟡 Medium |

## 🎯 Implementation Priority

### Phase 1: Critical User Experience (High Priority)

1. **Booking Confirmation** - User needs to know booking is confirmed
2. **Worker Assigned** - User needs to know who is coming
3. **Worker Completed** - User needs to know service is done
4. **Quote Provided** - User needs to know quote is available

### Phase 2: Workflow Management (Medium Priority)

1. **Worker Started** - User can track progress
2. **Booking Cancelled** - User needs to know about cancellations
3. **Payment Failed** - User needs to retry payment
4. **Quote Expiry Warning** - User needs to act on quotes

### Phase 3: Admin Management (Medium Priority)

1. **New Booking** - Admin needs to manage bookings
2. **Quote Required** - Admin needs to provide quotes
3. **Assignment Rejected** - Admin needs to reassign workers
4. **Payment Failed** - Admin needs to handle payment issues

### Phase 4: Enhanced Features (Low Priority)

1. **Location Tracking** - Real-time tracking notifications
2. **Customer Messages** - Chat notifications
3. **Assignment Updates** - Minor status changes
4. **Payment Reminders** - Proactive reminders

## 🔧 Technical Implementation Details

### Current Architecture

```
NotificationService (Placeholders)
├── NotificationIntegrationService (Helper methods)
├── InAppNotificationService (In-app notifications)
└── NotificationWebSocketService (Real-time notifications)
```

### Required Changes

#### 1. Implement Missing Notification Methods

```go
// In NotificationService
func (ns *NotificationService) SendBookingConfirmation(booking *models.Booking) error
func (ns *NotificationService) SendWorkerStarted(assignment *models.WorkerAssignment) error
func (ns *NotificationService) SendWorkerCompleted(assignment *models.WorkerAssignment) error
func (ns *NotificationService) SendBookingCancelled(booking *models.Booking) error
func (ns *NotificationService) SendQuoteProvided(booking *models.Booking) error
```

#### 2. Add Notification Integration Points

```go
// In BookingService
func (bs *BookingService) updateBookingStatus(bookingID uint, status models.BookingStatus) {
    // Update status
    // Send appropriate notification based on status change
}

// In WorkerAssignmentService
func (was *WorkerAssignmentService) updateAssignmentStatus(assignmentID uint, status models.AssignmentStatus) {
    // Update status
    // Send appropriate notification based on status change
}
```

#### 3. Add New Notification Types

```go
// In models/in_app_notification.go
const (
    InAppNotificationTypeQuoteProvided = "quote_provided"
    InAppNotificationTypeQuoteExpiryWarning = "quote_expiry_warning"
    InAppNotificationTypePaymentFailed = "payment_failed"
    InAppNotificationTypeAssignmentUpdated = "assignment_updated"
    InAppNotificationTypeCustomerMessage = "customer_message"
)
```

### Database Schema

The current `in_app_notifications` table supports all required notification types. No schema changes needed.

### WebSocket Integration

Current WebSocket service can handle all notification types. Need to ensure all new notifications are sent via WebSocket for real-time updates.

## 📝 Implementation Checklist

### Phase 1: Critical Notifications

- [ ] Implement `SendBookingConfirmation` in NotificationService
- [ ] Add booking confirmation trigger in BookingService
- [ ] Implement `SendWorkerCompleted` in NotificationService
- [ ] Add worker completion trigger in WorkerAssignmentService
- [ ] Implement `SendQuoteProvided` in NotificationService
- [ ] Add quote provided trigger in QuoteService

### Phase 2: Workflow Notifications

- [ ] Implement `SendWorkerStarted` in NotificationService
- [ ] Implement `SendBookingCancelled` in NotificationService
- [ ] Implement `SendPaymentFailed` in NotificationService
- [ ] Add status change triggers in respective services

### Phase 3: Admin Notifications

- [ ] Implement admin notification methods
- [ ] Add admin notification triggers
- [ ] Test admin notification flow

### Phase 4: Enhanced Features

- [ ] Implement location tracking notifications
- [ ] Implement chat notifications
- [ ] Add notification preferences
- [ ] Add notification templates

## 🧪 Testing Strategy

### Unit Tests

- Test each notification method
- Test notification data structure
- Test error handling

### Integration Tests

- Test notification triggers
- Test WebSocket delivery
- Test notification persistence

### User Acceptance Tests

- Test notification display
- Test notification actions
- Test notification preferences

## 📈 Success Metrics

### User Engagement

- Notification open rates
- User action rates (accept quote, rate service, etc.)
- User satisfaction scores

### System Performance

- Notification delivery time
- WebSocket connection stability
- Database query performance

### Business Impact

- Booking completion rates
- Quote acceptance rates
- Customer satisfaction scores
- Worker assignment success rates

---

**Last Updated:** January 2024  
**Version:** 1.0  
**Status:** Draft - Ready for Implementation
