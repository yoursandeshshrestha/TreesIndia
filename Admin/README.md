# Trees India Admin Panel

A modern, secure admin panel built with Next.js 15, TypeScript, and shadcn/ui components. Features a beautiful authentication system based on the [shadcn login template](https://ui.shadcn.com/view/login-01) adapted for phone number + OTP authentication.

## Features

- 🔐 **Secure Authentication**: Phone number + OTP based authentication
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **State Management**: Zustand for efficient state management
- ✅ **Form Validation**: Zod schema validation with react-hook-form
- 🔒 **Production Middleware**: Rate limiting, authentication, and security headers
- 📊 **Performance Monitoring**: Built-in performance tracking
- 🚨 **Error Handling**: Comprehensive error handling and logging
- 🔔 **Toast Notifications**: User-friendly notifications

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Authentication**: JWT tokens

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

1. **Clone the repository**

   ```bash
   cd Admin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` and update the API URL if needed:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Authentication Flow

1. **Phone Number Input**: User enters their phone number
2. **OTP Request**: System sends OTP to the provided phone number
3. **OTP Verification**: User enters the 4-digit OTP
4. **Login Success**: User is redirected to dashboard upon successful verification

### API Endpoints Used

- `POST /api/v1/auth/login` - Send OTP to phone number
- `POST /api/v1/auth/verify-otp` - Verify OTP and get JWT token

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   │   ├── login-form.tsx # Login form component
│   │   └── auth-layout.tsx # Authentication layout
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication utilities
│   ├── error-handler.ts   # Error handling
│   ├── logger.ts          # Logging system
│   ├── performance-monitor.ts # Performance monitoring
│   ├── rate-limiter.ts    # Rate limiting
│   └── utils.ts           # General utilities
├── store/                 # Zustand stores
│   └── auth-store.ts      # Authentication state
└── middleware.ts          # Next.js middleware
```

## Middleware Features

The application includes a production-level middleware that provides:

- **Authentication**: JWT token verification
- **Authorization**: Role-based access control
- **Rate Limiting**: Request rate limiting per IP
- **Security Headers**: XSS protection, CSRF protection, etc.
- **Logging**: Request/response logging
- **Error Handling**: Graceful error handling

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable              | Description     | Default                                |
| --------------------- | --------------- | -------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api/v1`         |
| `JWT_SECRET`          | JWT secret key  | `your-secret-key-change-in-production` |
| `LOG_LEVEL`           | Logging level   | `INFO`                                 |

## Testing the Login

Use these test phone numbers for development:

- `+918597831351`
- `+919609321667`
- `+919609321668`
- `+918597831352`

For all test numbers, use OTP: `0000`

## Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set production environment variables**

   - Update `NEXT_PUBLIC_API_URL` to your production API
   - Set a strong `JWT_SECRET`
   - Configure `LOG_LEVEL` as needed

3. **Deploy to your hosting platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify
   - Or any other platform supporting Node.js

## Security Considerations

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Rate limiting is implemented to prevent brute force attacks
- Security headers are automatically added by middleware
- Input validation using Zod schemas
- Error messages don't expose sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Trees India application.
