/**
 * Validates Indian mobile phone numbers
 * @param phone - Phone number string (should be 10 digits)
 * @returns boolean - true if valid, false otherwise
 */
export function isValidMobile(phone: string): boolean {
  // Remove any spaces or special characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Indian mobile numbers should be exactly 10 digits
  // and should start with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;

  return indianMobileRegex.test(cleanPhone);
}
