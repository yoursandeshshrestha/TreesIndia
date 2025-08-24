# Available Workers API Guide

## Overview

The Available Workers API allows you to get a list of workers who are available for booking assignments at a specific time slot. This is essential for manual worker assignment in the booking system.

## API Endpoint

### Get Available Workers

**Endpoint:** `GET /api/v1/bookings/available-workers`

**Authentication:** Required (Admin only)

**Query Parameters:**

- `scheduled_time` (required): ISO 8601 datetime string (e.g., "2024-01-15T14:00:00Z")
- `service_duration` (optional): Service duration in minutes (default: 120)

**Example Request:**

```bash
curl -X GET "http://localhost:8080/api/v1/bookings/available-workers?scheduled_time=2024-01-15T14:00:00Z&service_duration=90" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Available workers retrieved successfully",
  "data": {
    "available_workers": [
      {
        "id": 1,
        "name": "John Doe",
        "phone": "+919876543210",
        "email": "john@example.com",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "worker": {
          "id": 1,
          "user_id": 1,
          "service_id": 1,
          "hourly_rate": 500.0,
          "is_available": true,
          "rating": 4.5,
          "total_bookings": 25,
          "worker_type": "treesindia",
          "skills": "[\"plumbing\", \"electrical\", \"carpentry\"]",
          "experience_years": 5,
          "service_areas": "[\"Siliguri\", \"Matigara\"]",
          "earnings": 50000.0,
          "total_jobs": 50,
          "service": {
            "id": 1,
            "name": "Home Maintenance",
            "price": 1000.0,
            "category_id": 1
          }
        }
      }
    ],
    "scheduled_time": "2024-01-15T14:00:00Z",
    "service_duration": 90
  }
}
```

## How It Works

### 1. Worker Availability Check

The system checks worker availability by:

1. **Getting Active Workers**: Retrieves all active workers from the database
2. **Checking Conflicts**: For each worker, checks if they have any conflicting bookings during the specified time period
3. **Filtering Results**: Returns only workers who are available (no conflicts)

### 2. Conflict Detection

A worker is considered unavailable if they have any bookings with these statuses during the time period:

- `assigned`
- `accepted`
- `in_progress`

### 3. Time Period Calculation

The system calculates the total time period as:

```
Start Time: scheduled_time
End Time: scheduled_time + service_duration_minutes
```

## Frontend Integration

### React Hook

Use the `useAvailableWorkers` hook to fetch available workers:

```typescript
import { useAvailableWorkers } from "@/hooks/useAvailableWorkers";

const MyComponent = () => {
  const { workers, loading, error, refetch } = useAvailableWorkers({
    scheduledTime: "2024-01-15T14:00:00Z",
    serviceDuration: 120,
    enabled: true,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {workers.map((worker) => (
        <div key={worker.id}>{worker.name}</div>
      ))}
    </div>
  );
};
```

### React Component

Use the `AvailableWorkersSelector` component for a complete UI:

```typescript
import { AvailableWorkersSelector } from "@/components/AvailableWorkersSelector";

const MyComponent = () => {
  const [selectedWorker, setSelectedWorker] = useState(null);

  return (
    <AvailableWorkersSelector
      scheduledTime="2024-01-15T14:00:00Z"
      serviceDuration={120}
      onWorkerSelect={setSelectedWorker}
      selectedWorkerId={selectedWorker?.id}
    />
  );
};
```

## Complete Workflow Example

### 1. Backend Implementation

```go
// In your booking controller
func (bc *BookingController) GetAvailableWorkers(c *gin.Context) {
    scheduledTimeStr := c.Query("scheduled_time")
    scheduledTime, err := time.Parse(time.RFC3339, scheduledTimeStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format"})
        return
    }

    serviceDurationMinutes := 120
    if durationStr := c.Query("service_duration"); durationStr != "" {
        if duration, err := strconv.Atoi(durationStr); err == nil {
            serviceDurationMinutes = duration
        }
    }

    availableWorkers, err := bc.bookingService.GetAvailableWorkers(scheduledTime, serviceDurationMinutes)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "available_workers": availableWorkers,
            "scheduled_time": scheduledTime,
            "service_duration": serviceDurationMinutes,
        },
    })
}
```

### 2. Frontend Implementation

```typescript
// Complete booking assignment component
const BookingAssignmentForm = ({ bookingId }: { bookingId: number }) => {
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const handleAssignWorker = async () => {
    if (!selectedWorker) return;

    try {
      const response = await assignWorkerToBooking({
        bookingId,
        workerId: selectedWorker.id,
        notes: "Assigned via admin panel",
      });

      console.log("Worker assigned successfully:", response);
    } catch (error) {
      console.error("Failed to assign worker:", error);
    }
  };

  return (
    <div>
      <input
        type="datetime-local"
        value={scheduledTime}
        onChange={(e) => setScheduledTime(e.target.value)}
      />

      <AvailableWorkersSelector
        scheduledTime={scheduledTime}
        onWorkerSelect={setSelectedWorker}
        selectedWorkerId={selectedWorker?.id}
      />

      <button onClick={handleAssignWorker} disabled={!selectedWorker}>
        Assign Worker
      </button>
    </div>
  );
};
```

## Error Handling

### Common Errors

1. **Invalid Time Format**

   ```json
   {
     "error": "Invalid scheduled_time format. Use ISO format: 2024-01-15T14:00:00Z"
   }
   ```

2. **Missing Required Parameter**

   ```json
   {
     "error": "scheduled_time is required"
   }
   ```

3. **No Available Workers**
   ```json
   {
     "success": true,
     "data": {
       "available_workers": [],
       "scheduled_time": "2024-01-15T14:00:00Z",
       "service_duration": 120
     }
   }
   ```

## Best Practices

### 1. Time Zone Handling

Always use UTC timezone for API requests:

```typescript
// Convert local time to UTC
const localTime = new Date("2024-01-15T14:00:00");
const utcTime = localTime.toISOString(); // "2024-01-15T08:30:00.000Z"
```

### 2. Error Handling

Implement proper error handling in your frontend:

```typescript
const { workers, loading, error, refetch } = useAvailableWorkers({
  scheduledTime,
  serviceDuration,
});

if (error) {
  return (
    <div className="error-message">
      <p>Failed to load workers: {error}</p>
      <button onClick={refetch}>Retry</button>
    </div>
  );
}
```

### 3. Loading States

Show appropriate loading states:

```typescript
if (loading) {
  return <Spinner />;
}
```

### 4. Empty States

Handle cases when no workers are available:

```typescript
if (workers.length === 0) {
  return (
    <div className="empty-state">
      <p>No workers available for the selected time slot.</p>
      <p>Try selecting a different time or date.</p>
    </div>
  );
}
```

## Testing

### Test the API

1. **Start your backend server**
2. **Make a test request:**
   ```bash
   curl -X GET "http://localhost:8080/api/v1/bookings/available-workers?scheduled_time=2024-01-15T14:00:00Z" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

### Test the Frontend

1. **Navigate to the test page:**

   ```
   http://localhost:3000/dashboard/worker-assignment-test
   ```

2. **Select a date and time**
3. **View available workers**
4. **Select a worker and assign them**

## Troubleshooting

### Common Issues

1. **No workers returned**

   - Check if workers exist in the database
   - Verify workers are active (`is_active = true`)
   - Check if workers have the correct user type (`user_type = 'worker'`)

2. **All workers showing as unavailable**

   - Check for conflicting bookings
   - Verify the time period calculation
   - Check worker assignment statuses

3. **API authentication errors**
   - Ensure you're using a valid admin JWT token
   - Check token expiration
   - Verify admin middleware is working

### Debug Queries

Check worker availability manually:

```sql
-- Get all active workers
SELECT * FROM users WHERE user_type = 'worker' AND is_active = true;

-- Check worker assignments for a time period
SELECT wa.*, b.scheduled_time, b.scheduled_end_time
FROM worker_assignments wa
JOIN bookings b ON wa.booking_id = b.id
WHERE wa.worker_id = 1
  AND wa.status IN ('assigned', 'accepted', 'in_progress')
  AND b.scheduled_time < '2024-01-15T16:00:00Z'
  AND b.scheduled_end_time > '2024-01-15T14:00:00Z';
```

## Related Components

- `AvailableWorkersSelector` - React component for selecting workers
- `BookingWorkerAssignment` - Complete assignment workflow
- `useAvailableWorkers` - React hook for fetching workers
- `BookingService.GetAvailableWorkers` - Backend service method

## Next Steps

1. **Implement worker assignment API** to actually assign selected workers
2. **Add worker filtering** by skills, location, or rating
3. **Add real-time updates** when worker availability changes
4. **Implement worker preferences** and auto-assignment logic
