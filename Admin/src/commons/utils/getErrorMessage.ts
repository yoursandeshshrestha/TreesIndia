/**
 * Extracts human-readable error message from various error structures.
 * @param error - Can be an Error object or a string.
 * @returns A readable error message string.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "An unknown error occurred";
}
