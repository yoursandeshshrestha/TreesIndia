# Exotel Call Masking Integration

This document describes the implementation of Exotel call masking for the TREESINDIA platform.

## Overview

The call masking system allows customers and workers to communicate via phone calls without exposing their real phone numbers. All calls are routed through Exotel's Connect API, ensuring privacy and security.

## Features

- **Call Masking**: Customers and workers can call each other without revealing phone numbers
- **Automatic Session Management**: Call masking sessions are created when workers accept assignments
- **Call Logging**: All calls are logged with duration and status
- **Admin Monitoring**: Admins can view call logs for quality assurance
- **Error Handling**: Graceful handling of Exotel service unavailability

## Architecture

### Database Schema

#### Call Masking Sessions

```sql
CREATE TABLE call_masking_sessions (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    worker_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    exotel_session_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    call_count INTEGER DEFAULT 0,
    total_call_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    terminated_at TIMESTAMPTZ
);
```

#### Call Logs

```sql
CREATE TABLE call_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    caller_id BIGINT NOT NULL,
    call_duration INTEGER NOT NULL,
    call_status VARCHAR(50) NOT NULL,
    exotel_call_sid VARCHAR(255),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Services

#### ExotelService

- Handles Exotel API interactions
- Creates masking sessions
- Initiates calls
- Manages call status updates

#### CallMaskingService

- Business logic for call masking
- Session management
- Call initiation
- Webhook handling

### API Endpoints

#### Call Masking Endpoints

- `POST /api/v1/call-masking/call` - Initiate a call
- `POST /api/v1/call-masking/terminate/{booking_id}` - Terminate call masking
- `GET /api/v1/call-masking/logs/{booking_id}` - Get call logs
- `GET /api/v1/call-masking/status/{booking_id}` - Get call masking status

#### Webhook Endpoint

- `POST /api/v1/call-masking/webhook/exotel` - Handle Exotel callbacks

#### Test Endpoints (Development)

- `GET /api/v1/test/exotel/status` - Check Exotel service status
- `POST /api/v1/test/call` - Make test call with custom parameters
- `POST /api/v1/test/webhook/exotel` - Test webhook handling

##### Test Call Endpoint

The test call endpoint allows you to make calls with custom parameters:

```bash
POST /api/v1/test/call
Content-Type: application/json

{
  "from": "+919876543210",
  "to": "+919876543211",
  "caller_id": "080-473-59907"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Test call initiated",
  "data": {
    "call_sid": "exotel_call_123",
    "from": "+919876543210",
    "to": "+919876543211",
    "caller_id": "080-473-59907",
    "message": "Test call initiated successfully"
  }
}
```

## Configuration

### Environment Variables

```env
# Exotel Configuration
EXOTEL_ACCOUNT_SID=your_exotel_account_sid
EXOTEL_API_KEY=your_exotel_api_key
EXOTEL_API_TOKEN=your_exotel_api_token
EXOTEL_SUB_DOMAIN=your_exotel_subdomain
EXOTEL_WEBHOOK_URL=https://your-domain.com/api/v1/call-masking/webhook/exotel
EXOTEL_TEST_CALLER_ID=your_test_caller_id
```

### Exotel Setup

1. **Create Exotel Account**: Sign up at [exotel.com](https://exotel.com)
2. **Get Credentials**: Obtain Account SID, API Key, and API Token
3. **Purchase ExoPhone**: Buy a phone number for your account
4. **Configure Connect API**: Set up Connect API for call routing
5. **Configure Webhook**: Set webhook URL for call status updates

## Integration Flow

### 1. Worker Assignment Acceptance

When a worker accepts an assignment:

1. Chat room is created
2. Call masking session is automatically initiated (backend)
3. Exotel masking session is created
4. Notification is sent

### 2. Call Initiation

When user clicks "Call" button:

1. Frontend calls `POST /api/v1/call-masking/call`
2. Backend validates call masking session exists
3. Check if user is authorized to call
4. Initiate call through Exotel
5. Create call log entry
6. Update session call count

### 3. Call Completion

When call ends:

1. Exotel sends webhook with call status
2. Call log is updated with duration and status
3. Session total duration is updated

### 4. Session Termination

When booking is completed:

1. Call masking session is terminated
2. Exotel masking session is terminated
3. Session status is updated

## Frontend Integration

### Call Button Component

```tsx
<CallButton bookingId={booking.id} userType="customer" className="w-full" />
```

### Call Logs Component

```tsx
<CallLogs bookingId={booking.id} />
```

## Error Handling

### Exotel Service Unavailable

- Shows "Can't call right now" message
- Logs error for debugging
- Continues with other functionality

### Call Initiation Failure

- Displays user-friendly error message
- Logs detailed error information
- Allows retry

### Webhook Processing Failure

- Logs error details
- Continues processing other webhooks
- No user impact

## Testing

### Development Testing

1. Use test endpoints to verify Exotel connection
2. Test call masking initiation
3. Test call initiation
4. Test webhook handling

### Production Testing

1. Test with real phone numbers
2. Verify call quality
3. Check call logs accuracy
4. Test error scenarios

## Monitoring

### Call Logs

- Track call frequency
- Monitor call duration
- Identify failed calls
- Quality assurance

### Session Management

- Monitor active sessions
- Track session duration
- Identify stuck sessions
- Cleanup expired sessions

## Security Considerations

### Phone Number Privacy

- Real phone numbers are never exposed
- All calls go through Exotel Connect API
- Session isolation per booking

### Access Control

- Only assigned worker and customer can call
- Session validation on each call
- Admin access to logs only

### Rate Limiting

- Prevent call abuse
- Monitor call frequency
- Implement call limits if needed

## Cost Management

### Exotel Costs

- **ExoPhone**: ~$1/month per phone number
- **Call Charges**: ~$0.05/minute for calls
- **SMS**: ~$0.0075 per SMS (if used)

### Optimization

- Terminate sessions immediately after booking completion
- Monitor call duration
- Implement call limits if needed
- Use least expensive Exotel options

## Troubleshooting

### Common Issues

#### Call Not Connecting

- Check Exotel service status
- Verify phone numbers are valid
- Check proxy session status
- Review call logs

#### Webhook Not Receiving

- Verify webhook URL is accessible
- Check Exotel webhook configuration
- Review server logs
- Test webhook endpoint

#### Session Not Creating

- Check Exotel credentials
- Verify proxy service configuration
- Review database connection
- Check error logs

### Debug Tools

- Test endpoints for development
- Call logs for troubleshooting
- Exotel Console for service status
- Server logs for error details

## Future Enhancements

### Potential Features

- Call recording (if needed)
- Call analytics dashboard
- Call quality monitoring
- International calling support
- Call scheduling
- Call history export

### Performance Optimizations

- Session pooling
- Call caching
- Webhook batching
- Database indexing
- Connection pooling

## Support

### Documentation

- Twilio API Documentation
- This integration guide
- Code comments and examples

### Contact

- Exotel Support for service issues
- Development team for integration issues
- Admin team for usage questions
