# Wallet Test Page

This page allows you to test the wallet recharge functionality with Razorpay integration.

## Features

- **Token Authentication**: Enter JWT token to authenticate
- **Wallet Summary**: View current balance, total recharged, total spent, and transaction count
- **Recharge Wallet**: Add money to wallet using Razorpay
- **Transaction History**: View recent wallet transactions
- **Payment Flow**: Complete Razorpay payment and verify transaction

## How to Use

1. **Get JWT Token**: Obtain a JWT token from the backend (login/signup)
2. **Enter Token**: Paste the token in the authentication field
3. **View Wallet**: See your current wallet balance and transaction history
4. **Enter Amount**: Specify the amount you want to recharge
5. **Initiate Payment**: Click "Recharge with Razorpay" to create payment order
6. **Complete Payment**: Follow Razorpay payment flow
7. **Verify Transaction**: Payment completion updates wallet balance

## API Endpoints Used

- `GET /api/v1/wallet/summary` - Get wallet summary
- `GET /api/v1/wallet/transactions` - Get transaction history
- `POST /api/v1/razorpay/create-order` - Create Razorpay payment order
- `POST /api/v1/wallet/recharge/{id}/complete` - Complete wallet recharge

## Payment Flow

1. **Create Order**: Backend creates Razorpay order and pending wallet transaction
2. **Payment Gateway**: User completes payment through Razorpay
3. **Webhook/Verification**: Payment is verified and transaction is completed
4. **Balance Update**: User's wallet balance is updated

## Transaction Types

- `recharge` - Adding money to wallet
- `service_payment` - Paying for services
- `refund` - Getting money back
- `admin_adjustment` - Manual admin adjustments
- `subscription` - Subscription payments

## Security Features

- JWT token authentication required
- Payment signature verification
- Transaction audit trail
- Admin-only wallet adjustments

## Testing Notes

- This is a test implementation with simulated payment completion
- In production, integrate with actual Razorpay Checkout
- Webhook handling should be implemented for production use
- Payment verification should include proper signature validation
