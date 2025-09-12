/**
 * Utility functions for handling subscription-related errors and checks
 */

/**
 * Checks if an error is subscription-related
 * @param error - The error object to check
 * @returns true if the error is subscription-related, false otherwise
 */
export function isSubscriptionRequiredError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return false;
  }

  const errorMessage = (error as { message: string }).message;
  if (typeof errorMessage !== "string") {
    return false;
  }

  // Check for various subscription required error patterns
  const subscriptionErrorPatterns = [
    "Subscription required",
    "Active subscription required",
    "subscription required",
    "active subscription required",
    // HTTP status text patterns
    "Forbidden",
    "failed to fetch",
    // API error patterns
    "subscription",
    "active subscription",
  ];

  return subscriptionErrorPatterns.some((pattern) =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Checks if an HTTP response indicates a subscription required error
 * @param response - The HTTP response object
 * @returns true if the response indicates subscription required, false otherwise
 */
export function isSubscriptionRequiredResponse(response: Response): boolean {
  // 403 Forbidden often indicates subscription required
  if (response.status === 403) {
    return true;
  }

  // Check status text for subscription-related messages
  const statusText = response.statusText.toLowerCase();
  return statusText.includes("forbidden") || statusText.includes("subscription");
}

/**
 * Extracts subscription-related error message from an error object
 * @param error - The error object
 * @returns A formatted error message for subscription required scenarios
 */
export function getSubscriptionRequiredMessage(error: unknown): string {
  if (!error || typeof error !== "object" || !("message" in error)) {
    return "Active subscription required to access this feature.";
  }

  const errorMessage = (error as { message: string }).message;
  if (typeof errorMessage !== "string") {
    return "Active subscription required to access this feature.";
  }

  // If the error message already contains subscription info, use it
  if (errorMessage.toLowerCase().includes("subscription")) {
    return errorMessage;
  }

  // Default subscription required message
  return "Active subscription required to access this feature.";
}
