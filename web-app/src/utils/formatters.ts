/**
 * Utility functions for formatting data
 */

/**
 * Formats a number as Indian Rupees with proper formatting
 * @param amount - Amount to format
 * @returns Formatted amount string with ₹ symbol
 */
export const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString()}`;
};

/**
 * Formats a number as Indian Rupees with paise (for payment amounts)
 * @param amount - Amount in paise
 * @returns Formatted amount string with ₹ symbol
 */
export const formatAmountFromPaise = (amountInPaise: number): string => {
  const amountInRupees = amountInPaise / 100;
  return formatAmount(amountInRupees);
};
