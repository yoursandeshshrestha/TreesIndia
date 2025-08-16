/**
 * Generates a unique identifier string.
 * @returns UUID-like string.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
