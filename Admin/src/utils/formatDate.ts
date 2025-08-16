/**
 * Formats a given date into YYYY-MM-DD format.
 * @param date - The date object or ISO string.
 * @returns Formatted date string.
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}
