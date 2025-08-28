# Production-Ready Authentication System

## Overview

This document describes the production-ready authentication system implemented for TreesIndia, featuring OTP-based authentication with HTTP-only cookies for enhanced security.

## Architecture

### Frontend (Next.js)

- **Modal-based UI**: Authentication happens in a popup modal, similar to location selection
- **Context-based state management**: React Context for auth state
- **Automatic token refresh**: Background token refresh every 50 minutes
- **Type-safe API calls**: Full TypeScript support

### Backend (Go)

- **JWT-based authentication**: Access tokens (1 hour) + Refresh tokens (30 days)
- **HTTP-only cookies**: Secure cookie storage for tokens
- **OTP verification**: 6-digit OTP system (currently hardcoded to "000000")
- **User auto-creation**: New users are created automatically on first login

## Security Features

### 1. HTTP-Only Cookies

- **Access Token**: Stored in HTTP-only cookie with 1-hour expiry
- **Refresh Token**: Stored in HTTP-only cookie with 30-day expiry
- **CSRF Protection**: SameSite=Strict cookies
- **Secure Flag**: HTTPS-only in production

### 2. Cookie Naming Strategy

```typescript
// Environment-specific cookie names to avoid conflicts
const COOKIE_PREFIX =
  process.env.NODE_ENV === "production" ? "treesindia_" : "dev_treesindia_";
export const COOKIE_NAMES = {
  ACCESS_TOKEN: `${COOKIE_PREFIX}access_token`,
  REFRESH_TOKEN: `${COOKIE_PREFIX}refresh_token`,
  CSRF_TOKEN: `${COOKIE_PREFIX}csrf_token`,
};
```

### 3. Token Security

- **Short-lived access tokens**: 1 hour expiry
- **Long-lived refresh tokens**: 30 days expiry
- **Automatic refresh**: Background refresh every 50 minutes
- **Token blacklisting**: Planned for logout functionality

## API Endpoints

### 1. Request OTP

```http
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "phone": "+918597831351"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "+918597831351",
    "expires_in": 60,
    "is_new_user": false
  }
}
```

### 2. Verify OTP

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919609321667",
  "otp": "000000"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "phone": "+919609321667",
      "name": null,
      "role": "user",
      "wallet_balance": 0,
      "created_at": "2024-01-01T00:00:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "is_new_user": false
  }
}
```

### 3. Refresh Token

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### 5. Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

## Frontend Components

### 1. AuthModal

- **Multi-step flow**: Phone → OTP → Success
- **Real-time validation**: Phone number and OTP validation
- **Error handling**: Comprehensive error states
- **Auto-close**: Closes automatically after successful authentication

### 2. PhoneInput

- **Auto-formatting**: Formats phone numbers as user types
- **Validation**: Real-time validation with visual feedback
- **Auto-focus**: Automatically focuses on mount

### 3. OTPInput

- **Individual digit inputs**: 6 separate input boxes
- **Auto-focus**: Moves to next input automatically
- **Keyboard navigation**: Arrow keys and backspace support
- **Paste support**: Accepts pasted OTP codes

### 4. UserMenu

- **Conditional rendering**: Shows login button or user menu
- **User info display**: Shows name, phone, and wallet balance
- **Dropdown menu**: Settings and logout options

## State Management

### AuthContext

```typescript
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requestOTP: (phone: string) => Promise<RequestOTPResponse>;
  verifyOTP: (phone: string, otp: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}
```

### Automatic Token Refresh

- **Background refresh**: Every 50 minutes
- **Error handling**: Logs out user if refresh fails
- **Manual refresh**: Available through context

## Production Considerations

### 1. Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.treesindia.com/api/v1

# Backend (.env)
JWT_SECRET=your-super-secure-jwt-secret
REFRESH_EXPIRY_DAYS=30
```

### 2. Cookie Security

- **HTTPS only**: Secure flag in production
- **SameSite**: Strict mode for CSRF protection
- **HttpOnly**: Prevents XSS attacks
- **Domain**: Restricted to application domain

### 3. Rate Limiting

- **OTP requests**: Limit per phone number
- **Login attempts**: Limit per IP address
- **Token refresh**: Reasonable limits

### 4. Monitoring

- **Failed login attempts**: Log and alert
- **Token refresh failures**: Monitor for patterns
- **User creation**: Track new user signups

## Testing

### Test Phone Numbers

```json
{
  "admin": "+918597831351",
  "normal_user": "+919609321667",
  "worker": "+919876543210"
}
```

### Test OTP

- **All test numbers**: Use "000000" as OTP

## Future Enhancements

### 1. SMS Integration

- **Twilio integration**: Real SMS delivery
- **OTP expiry**: Configurable expiry times
- **Resend limits**: Prevent abuse

### 2. Enhanced Security

- **Device fingerprinting**: Track login devices
- **Suspicious activity**: Detect and block
- **Two-factor authentication**: Additional security layer

### 3. User Experience

- **Remember me**: Extended session option
- **Social login**: Google, Facebook integration
- **Email verification**: Additional verification method

## Deployment Checklist

### Frontend

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Cookie settings verified
- [ ] Error handling tested

### Backend

- [ ] JWT secret configured
- [ ] Cookie settings verified
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Database migrations run

### Security

- [ ] HTTPS certificates valid
- [ ] Cookie security settings verified
- [ ] Rate limiting tested
- [ ] Error messages sanitized
- [ ] CORS settings configured

## Troubleshooting

### Common Issues

1. **Cookies not setting**: Check HTTPS and domain settings
2. **Token refresh failing**: Verify refresh token validity
3. **CORS errors**: Check backend CORS configuration
4. **OTP not working**: Verify test OTP is "000000"

### Debug Mode

Enable debug logging in development:

```typescript
// Frontend
console.log("Auth state:", authState);

// Backend
log.Debug("Token refresh attempt", "user_id", userID);
```

## Support

For authentication-related issues:

1. Check browser console for frontend errors
2. Check backend logs for API errors
3. Verify cookie settings in browser dev tools
4. Test with known working phone numbers
