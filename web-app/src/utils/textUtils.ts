/**
 * Truncate text to a specified length and add ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  // Truncate to exactly maxLength characters and add ellipsis
  return text.substring(0, maxLength) + "...";
}

/**
 * Clean and format description text
 */
export function cleanDescription(
  description: string | null | undefined
): string {
  if (!description || typeof description !== "string") {
    return "";
  }

  // Remove extra whitespace and normalize line breaks
  return description
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n");
}

/**
 * Format description for card display (short version)
 */
export function formatDescriptionForCard(
  description: string | null | undefined,
  maxLength: number = 100
): string {
  const cleaned = cleanDescription(description);
  return truncateText(cleaned, maxLength);
}

/**
 * Format description for details page (full version with proper line breaks)
 */
export function formatDescriptionForDetails(
  description: string | null | undefined
): string {
  const cleaned = cleanDescription(description);

  if (!cleaned) {
    return "No description available.";
  }

  // Preserve intentional line breaks but clean up extra whitespace
  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Check if description needs truncation
 */
export function needsTruncation(text: string, maxLength: number): boolean {
  return Boolean(text && text.length > maxLength);
}
