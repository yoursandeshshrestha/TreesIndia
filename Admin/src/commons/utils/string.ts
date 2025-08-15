/**
 * Converts a string to a URL-friendly slug
 * @param str The string to convert to a slug
 * @returns A URL-friendly slug
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("Company Name & Co.") // "company-name-co"
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};
