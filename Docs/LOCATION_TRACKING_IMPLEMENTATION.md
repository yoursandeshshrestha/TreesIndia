# Location Tracking System Implementation

## Overview

The location tracking system provides real-time GPS tracking of workers during assignments, allowing customers to monitor worker location, distance, and estimated arrival time.

## Features

- **Real-time GPS tracking** every 30 seconds
- **Automatic start/stop** based on assignment status
- **Live map display** with Google Maps integration
- **Distance & ETA calculations** in real-time
- **WebSocket real-time updates** for customers
- **Worker controls** for manual location updates
- **Privacy-focused** - only tracks during active assignments

## Architecture

### Backend Components

1. **WorkerLocation Model** (`backend/models/worker_location.go`)

   - Stores GPS coordinates, assignment details, and tracking status
   - One active location per worker per assignment

2. **LocationTrackingService** (`backend/services/location_tracking_service.go`)

   - Manages tracking lifecycle (start/stop/update)
   - Calculates distance and ETA
   - Broadcasts updates via WebSocket

3. **WorkerLocationRepository** (`backend/repositories/worker_location_repository.go`)

   - Database operations for location data
   - Automatic cleanup of old records

4. **LocationTrackingController** (`backend/controllers/location_tracking_controller.go`)
   - REST API endpoints for location operations
   - Authentication and authorization

### Frontend Components

1. **useLocationTracking Hook** (`web-app/src/hooks/useLocationTracking.ts`)

   - Manages tracking state and WebSocket connection
   - Handles GPS updates for workers
   - Real-time updates for customers

2. **WorkerLocationMap** (`web-app/src/components/LocationTracking/WorkerLocationMap.tsx`)

   - Google Maps integration
   - Real-time worker marker updates
   - Route visualization

3. **WorkerLocationControls** (`web-app/src/components/LocationTracking/WorkerLocationControls.tsx`)

   - Start/stop tracking controls
   - Manual location updates
   - Status display

4. **LocationTrackingContainer** (`web-app/src/components/LocationTracking/LocationTrackingContainer.tsx`)
   - Main container component
   - Role-based view (worker vs customer)

## Setup Instructions

### 1. Environment Variables

Add Google Maps API key to your `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Database Migration

Run the migration to create the worker_locations table:

```bash
cd backend
goose up
```

### 3. Backend Integration

The location tracking service is automatically integrated with the worker assignment system. When a worker:

- **Starts an assignment** → Location tracking begins automatically
- **Completes an assignment** → Location tracking stops automatically

### 4. Frontend Integration

Import and use the LocationTrackingContainer component:

```tsx
import LocationTrackingContainer from "@/components/LocationTracking/LocationTrackingContainer";

// For customers (viewing worker location)
<LocationTrackingContainer
  assignmentId={assignmentId}
  isWorker={false}
/>

// For workers (controlling tracking)
<LocationTrackingContainer
  assignmentId={assignmentId}
  isWorker={true}
/>
```

## API Endpoints

### Worker Endpoints (Authenticated Workers)

```http
POST /api/v1/worker/assignments/{id}/start-tracking
POST /api/v1/worker/assignments/{id}/update-location
POST /api/v1/worker/assignments/{id}/stop-tracking
```

### Customer Endpoints (Authenticated Users)

```http
GET /api/v1/assignments/{id}/worker-location
GET /api/v1/bookings/{id}/worker-location
```

## Data Flow

### 1. Assignment Started

```
Worker starts assignment → Assignment status → "in_progress" → Location tracking starts
```

### 2. Location Updates

```
Worker GPS (30s) → Backend API → Database → WebSocket broadcast → Customer app
```

### 3. Assignment Completed

```
Worker completes assignment → Assignment status → "completed" → Location tracking stops
```

## WebSocket Messages

### Location Update

```json
{
  "type": "worker_location",
  "data": {
    "worker_id": 123,
    "assignment_id": 456,
    "booking_id": 789,
    "latitude": 22.5726,
    "longitude": 88.3639,
    "distance": 2.5,
    "eta": 15,
    "worker_name": "John Doe",
    "last_updated": "2024-01-20T10:30:00Z"
  }
}
```

### Tracking Stopped

```json
{
  "type": "tracking_stopped",
  "data": {
    "assignment_id": 456,
    "worker_id": 123,
    "status": "stopped"
  }
}
```

## Security & Privacy

- **Authentication required** for all endpoints
- **Worker authorization** - workers can only access their own assignments
- **Customer authorization** - customers can only view locations for their bookings
- **Automatic cleanup** - old location data is removed after 30 days
- **Assignment-based** - tracking only active during assignments

## Performance Considerations

- **30-second intervals** balance accuracy with battery life
- **WebSocket rooms** - only relevant users receive updates
- **Database indexing** - optimized queries for location lookups
- **Automatic cleanup** - prevents database bloat

## Error Handling

- **GPS failures** - graceful fallback with user notification
- **Network issues** - automatic retry mechanisms
- **Invalid coordinates** - validation and error responses
- **Permission denied** - clear user guidance

## Testing

### Backend Testing

```bash
cd backend
go test ./services/location_tracking_service_test.go
go test ./controllers/location_tracking_controller_test.go
```

### Frontend Testing

```bash
cd web-app
npm run test -- --testPathPattern=LocationTracking
```

## Troubleshooting

### Common Issues

1. **Google Maps not loading**

   - Check API key in environment variables
   - Verify API key has Maps JavaScript API enabled

2. **Location updates not working**

   - Check GPS permissions in browser
   - Verify assignment status is "in_progress"

3. **WebSocket connection failed**

   - Check backend WebSocket service is running
   - Verify room_id parameter is correct

4. **Database errors**
   - Run migrations: `goose up`
   - Check database connection

### Debug Mode

Enable debug logging in backend:

```go
logrus.SetLevel(logrus.DebugLevel)
```

## Future Enhancements

- **Offline support** - queue location updates when offline
- **Route optimization** - suggest best routes for workers
- **Geofencing** - automatic status updates based on location
- **Analytics** - tracking performance and efficiency metrics
- **Multi-worker support** - track multiple workers per assignment

## Support

For technical support or questions about the location tracking system, please refer to the main project documentation or contact the development team.
