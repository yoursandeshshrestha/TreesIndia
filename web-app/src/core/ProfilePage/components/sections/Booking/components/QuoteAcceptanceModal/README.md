# Quote Acceptance Modal

A refactored, Redux-powered modal component for accepting quotes and scheduling services.

## Features

- **Redux State Management**: Uses Redux Toolkit for predictable state management
- **Modular Architecture**: Clean separation of concerns with dedicated components
- **TypeScript Support**: Fully typed with proper interfaces
- **Responsive Design**: Mobile-friendly layout
- **Error Handling**: Comprehensive error states and user feedback
- **Payment Integration**: Supports both wallet and Razorpay payments

## Architecture

### Redux Slice (`quoteAcceptanceSlice.ts`)

- Manages all modal state
- Handles async operations
- Provides actions for state updates

### Custom Hook (`useQuoteAcceptanceRedux.ts`)

- Provides Redux state and actions
- Handles business logic
- Integrates with API hooks

### Components

- `QuoteAcceptanceModal.tsx` - Main modal container
- `QuoteAcceptanceHeader.tsx` - Modal header
- `QuoteAcceptanceContent.tsx` - Main content area
- `QuoteAcceptanceFooter.tsx` - Action buttons
- `QuoteAcceptanceError.tsx` - Error display
- `BookingDetailsCard.tsx` - Booking information
- `DateTimeSelection.tsx` - Date/time picker
- `PaymentSection.tsx` - Payment method selection
- `SimpleSummary.tsx` - Summary display

## Usage

```tsx
import QuoteAcceptanceModal from "@/components/QuoteAcceptanceModal";

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  const handleSuccess = () => {
    // Handle successful quote acceptance
    setIsModalOpen(false);
    // Refresh data, show success message, etc.
  };

  return (
    <QuoteAcceptanceModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      booking={booking}
      onSuccess={handleSuccess}
    />
  );
}
```

## State Flow

1. **Open Modal**: `openModal(booking)` action
2. **Date Selection**: User selects date → `setSelectedDate(date)`
3. **Time Selection**: User selects time → `setSelectedTimeSlot(slot)` → `setCurrentStep("payment")`
4. **Payment Method**: User selects payment → `setSelectedPaymentMethod(method)`
5. **Process Payment**: `handleProceedToPayment()` → API call → Success/Error
6. **Close Modal**: `closeModal()` action

## Benefits of Redux Approach

- **Predictable State**: All state changes are explicit and traceable
- **Better Performance**: Redux optimizes re-renders
- **Debugging**: Redux DevTools for state inspection
- **Testing**: Easy to test individual actions and reducers
- **Scalability**: Easy to add new features and state
- **Consistency**: Follows established patterns in the codebase

## Migration from Context

The modal was refactored from using React Context to Redux for:

- Better performance with complex state
- Improved debugging capabilities
- Consistent state management patterns
- Better separation of concerns
- Easier testing and maintenance
