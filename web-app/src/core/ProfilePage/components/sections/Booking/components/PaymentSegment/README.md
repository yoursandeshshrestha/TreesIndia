# Payment Segment Components

This directory contains components for handling segment-based payments in the web application.

## Components

### PaymentSegment

Displays individual payment segment information with status, amount, due date, and notes.

**Props:**

- `segment: PaymentSegmentInfo` - The payment segment data
- `onEdit?: (segment: PaymentSegmentInfo) => void` - Edit callback
- `onDelete?: (segmentId: number) => void` - Delete callback
- `canEdit?: boolean` - Whether editing is allowed
- `canDelete?: boolean` - Whether deletion is allowed
- `showActions?: boolean` - Whether to show action buttons

### PaymentProgress

Shows overall payment progress with a progress bar and summary statistics.

**Props:**

- `progress: PaymentProgress` - Payment progress data
- `showSegments?: boolean` - Whether to show individual segments
- `className?: string` - Additional CSS classes

### PaymentSegmentManager

Manages payment segments with the ability to pay individual segments.

**Props:**

- `bookingId: number` - The booking ID
- `segments: PaymentSegmentInfo[]` - Array of payment segments
- `onPaymentSuccess?: (segmentId: number) => void` - Payment success callback
- `onPaymentError?: (error: string) => void` - Payment error callback
- `walletBalance?: number` - User's wallet balance

## Usage

```tsx
import { PaymentSegment, PaymentProgress, PaymentSegmentManager } from '@/commonComponents/PaymentSegment';

// Display payment progress
<PaymentProgress progress={paymentProgress} showSegments={true} />

// Manage payment segments
<PaymentSegmentManager
  bookingId={booking.id}
  segments={segments}
  onPaymentSuccess={handleSuccess}
  onPaymentError={handleError}
  walletBalance={user.walletBalance}
/>
```

## API Integration

The components integrate with the following API endpoints:

- `GET /bookings/{id}/payment-segments` - Get payment segments
- `POST /bookings/{id}/payment-segments/pay` - Pay for a segment
- `GET /bookings/{id}/payment-segments/pending` - Get pending segments
- `GET /bookings/{id}/payment-segments/paid` - Get paid segments

## Features

- **Visual Progress Tracking**: Progress bar showing payment completion
- **Individual Segment Payment**: Pay segments one by one or all at once
- **Wallet Integration**: Support for wallet payments when sufficient balance
- **Razorpay Integration**: Support for card/UPI payments
- **Status Management**: Visual indicators for pending, paid, overdue, and cancelled segments
- **Due Date Tracking**: Shows days until due or overdue status
- **Responsive Design**: Works on desktop and mobile devices
