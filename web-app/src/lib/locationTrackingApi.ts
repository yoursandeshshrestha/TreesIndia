import { authenticatedFetch } from "./auth-api";
import {
  LocationUpdate,
  WorkerLocationResponse,
  CustomerLocationResponse,
} from "@/types/locationTracking";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Location tracking API functions

/**
 * Start location tracking for a worker's assignment
 */
export async function startLocationTracking(
  assignmentId: number
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/worker/assignments/${assignmentId}/start-tracking`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start location tracking");
  }
}

/**
 * Update worker's current location
 */
export async function updateWorkerLocation(
  assignmentId: number,
  location: LocationUpdate
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/worker/assignments/${assignmentId}/update-location`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update location");
  }
}

/**
 * Stop location tracking for a worker's assignment
 */
export async function stopLocationTracking(
  assignmentId: number
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/worker/assignments/${assignmentId}/stop-tracking`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to stop location tracking");
  }
}

/**
 * Get current worker location for an assignment
 */
export async function getWorkerLocation(
  assignmentId: number
): Promise<WorkerLocationResponse | null> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/assignments/${assignmentId}/worker-location`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No active location tracking
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to get worker location");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get worker location by booking ID
 */
export async function getWorkerLocationByBooking(
  bookingId: number
): Promise<WorkerLocationResponse | null> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/bookings/${bookingId}/worker-location`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No active location tracking
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to get worker location");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Get customer location for an assignment (workers only)
 */
export async function getCustomerLocation(
  assignmentId: number
): Promise<CustomerLocationResponse | null> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/worker/assignments/${assignmentId}/customer-location`
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null; // No customer location found
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to get customer location");
  }

  const data = await response.json();
  return data.data;
}
