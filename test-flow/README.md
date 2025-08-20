# TREESINDIA Service Booking Test Frontend

A simple Next.js frontend to test the complete service booking flow for the TREESINDIA platform.

## Features

- **JWT Token Authentication**: Enter your JWT token to authenticate
- **Step-by-Step Booking Flow**:
  1. Select Category (Home Services / Construction Services)
  2. Select Subcategory (Plumbing, Painting, etc.)
  3. Select Service (Fixed Price or Inquiry Based)
  4. Select Time Slot
  5. Fill Booking Details
  6. Create Booking
- **Booking History**: View all your previous bookings
- **Real-time API Integration**: Connects to the backend API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:8080`
- JWT token from the backend

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### 1. Get a JWT Token

First, you need to get a JWT token from the backend. You can:

- Register a new user
- Login with existing credentials
- Use the admin token for testing

### 2. Start the Booking Flow

1. Paste your JWT token in the text area
2. Click "Start Booking Flow"
3. Follow the step-by-step process

### 3. Test Different Service Types

#### Fixed Price Services

- Services like "Tap Repair", "Switch Repair"
- Requires immediate payment
- Shows Razorpay order details

#### Inquiry-Based Services

- Services like "Interior Painting", "Kitchen Renovation"
- No immediate payment required
- Admin will review and send quote

### 4. View Booking History

- Click on "My Bookings" tab
- View all your previous bookings
- See booking status and payment status

## API Endpoints Used

The frontend connects to these backend endpoints:

- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/{id}/subcategories` - Get subcategories
- `GET /api/v1/subcategories/{id}/services` - Get services
- `GET /api/v1/time-slots` - Get available time slots
- `POST /api/v1/bookings` - Create booking (inquiry-based)
- `POST /api/v1/bookings/with-payment` - Create booking with payment (fixed-price)
- `POST /api/v1/bookings/verify-payment` - Verify payment
- `GET /api/v1/bookings` - Get user bookings

## Testing Scenarios

### 1. Fixed Price Service Booking

1. Select "Home Services" → "Plumbing" → "Tap Repair"
2. Select a time slot
3. Fill booking details
4. Create booking with payment
5. Verify payment (simulated)

### 2. Inquiry-Based Service Booking

1. Select "Home Services" → "Painting" → "Interior Painting"
2. Select a time slot
3. Fill booking details
4. Create booking (no payment required)
5. Admin will review and send quote later

### 3. Construction Services

1. Select "Construction Services" → "Renovation" → "Kitchen Renovation"
2. Follow the inquiry-based flow
3. Admin consultation required

## Troubleshooting

### Common Issues

1. **CORS Error**: Make sure the backend has CORS enabled for `http://localhost:3000`

2. **Authentication Error**:

   - Check if the JWT token is valid
   - Ensure the token hasn't expired
   - Verify the token format

3. **API Connection Error**:

   - Ensure the backend is running on `http://localhost:8080`
   - Check if all required endpoints are available

4. **No Categories/Services**:
   - Run the seed data in the backend first
   - Check if the database has the required data

### Debug Mode

Open browser developer tools to see:

- API requests and responses
- Error messages
- Network activity

## Development

### Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page with token input
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── BookingFlow.tsx   # Main booking flow component
│   └── UserBookings.tsx  # Booking history component
└── lib/
    └── api.ts           # API service functions
```

### Adding New Features

1. **New API Endpoints**: Add to `src/lib/api.ts`
2. **New Components**: Create in `src/components/`
3. **Styling**: Uses Tailwind CSS

### Environment Variables

Create `.env.local` for environment-specific settings:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This is a test frontend for the TREESINDIA platform.
