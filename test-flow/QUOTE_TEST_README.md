# Quote Acceptance Test Flow

This test page allows you to test the quote acceptance flow for inquiry-based bookings in the TREESINDIA system.

## Overview

The quote test flow simulates how customers accept or reject quotes provided by admins for inquiry-based service bookings.

## Prerequisites

1. **Backend Server**: Ensure the backend server is running on `http://localhost:8080`
2. **JWT Token**: You need a valid JWT token from a user account
3. **Inquiry Booking**: There should be at least one inquiry booking with a quote provided by an admin

## How to Use

### 1. Access the Test Page

Navigate to `/quote-test` in your browser or click the "Quote Test" link from the main test page.

### 2. Authentication

1. Paste your JWT token in the provided text area
2. Click "Start Quote Test" to authenticate and load your bookings

### 3. View Inquiry Bookings

The page will display all inquiry bookings that have quotes provided by admins. You'll see:

- **Booking Reference**: Unique identifier for the booking
- **Service Name**: The service being requested
- **Status**: Current status (quote_provided, quote_accepted, etc.)
- **Quote Amount**: The amount quoted by the admin
- **Quote Notes**: Any additional notes from the admin
- **Quote Provided Date**: When the quote was provided
- **Expiration Date**: When the quote expires

### 4. Accept or Reject Quotes

For bookings with "quote_provided" status, you can:

- **Accept Quote**: Click the green "Accept Quote" button
- **Reject Quote**: Click the red "Reject Quote" button

### 5. View Results

After accepting or rejecting a quote:

- You'll see a success message
- The booking status will update
- You can continue testing or start over

## Test Scenarios

### Scenario 1: Accept Quote

1. Find a booking with "quote_provided" status
2. Click "Accept Quote"
3. Verify the status changes to "quote_accepted"
4. Check that the booking is now ready for confirmation

### Scenario 2: Reject Quote

1. Find a booking with "quote_provided" status
2. Click "Reject Quote"
3. Verify the status changes to "rejected"
4. Check that the booking is no longer active

### Scenario 3: Expired Quote

1. Find a booking with an expired quote
2. Try to accept/reject the quote
3. Verify appropriate error handling

## API Endpoints Used

- `GET /api/v1/bookings` - Get user bookings
- `POST /api/v1/bookings/{id}/accept-quote` - Accept a quote
- `POST /api/v1/bookings/{id}/reject-quote` - Reject a quote
- `GET /api/v1/bookings/{id}/quote-info` - Get quote information

## Expected Workflow

1. **Customer creates inquiry booking** → Status: `pending`
2. **Admin provides quote** → Status: `quote_provided`
3. **Customer accepts/rejects quote** → Status: `quote_accepted` / `rejected`
4. **If accepted, admin confirms** → Status: `confirmed`
5. **Admin assigns worker** → Status: `assigned`
6. **Service completed** → Status: `completed`

## Troubleshooting

### No Bookings Found

- Ensure you have created inquiry bookings
- Check that an admin has provided quotes for your bookings
- Verify your JWT token is valid

### API Errors

- Check that the backend server is running
- Verify the API endpoints are accessible
- Check the browser console for detailed error messages

### Authentication Issues

- Ensure your JWT token is valid and not expired
- Check that the token has the correct permissions
- Try logging in again to get a fresh token

## Notes

- This test page only shows inquiry bookings with quotes
- Regular (fixed-price) bookings are not shown
- Quote acceptance/rejection is irreversible
- Expired quotes cannot be accepted or rejected
- The test page automatically refreshes the booking list after actions

## Related Files

- `test-flow/src/app/quote-test/page.tsx` - Main test page
- `test-flow/src/lib/api.ts` - API service with quote methods
- Backend quote controller and service files
