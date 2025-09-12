export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

/**
 * Parse address from API response which can be either a JSON string or an object
 */
export function parseAddress(address: string | Address): Address {
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch (error) {
      console.error('Failed to parse address:', error);
      return {
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      };
    }
  }
  return address;
}

/**
 * Format address for display in cards (short format)
 */
export function formatAddressShort(address: string | Address): string {
  const parsedAddress = parseAddress(address);
  const parts = [];
  
  if (parsedAddress.city) parts.push(parsedAddress.city);
  if (parsedAddress.state) parts.push(parsedAddress.state);
  
  return parts.join(', ') || 'Location not specified';
}

/**
 * Format address for display in details (full format)
 */
export function formatAddressFull(address: string | Address): string {
  const parsedAddress = parseAddress(address);
  const parts = [];
  
  if (parsedAddress.street) parts.push(parsedAddress.street);
  if (parsedAddress.city) parts.push(parsedAddress.city);
  if (parsedAddress.state) parts.push(parsedAddress.state);
  if (parsedAddress.pincode) parts.push(parsedAddress.pincode);
  
  return parts.join(', ') || 'Address not specified';
}

/**
 * Format address with landmark for detailed display
 */
export function formatAddressWithLandmark(address: string | Address): string {
  const parsedAddress = parseAddress(address);
  const parts = [];
  
  if (parsedAddress.street) parts.push(parsedAddress.street);
  if (parsedAddress.landmark) parts.push(`Near ${parsedAddress.landmark}`);
  if (parsedAddress.city) parts.push(parsedAddress.city);
  if (parsedAddress.state) parts.push(parsedAddress.state);
  if (parsedAddress.pincode) parts.push(`- ${parsedAddress.pincode}`);
  
  return parts.join(', ') || 'Address not specified';
}
