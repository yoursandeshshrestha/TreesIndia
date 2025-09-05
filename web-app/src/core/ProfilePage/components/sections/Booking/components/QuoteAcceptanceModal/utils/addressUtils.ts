// Helper function to get address name
export const getAddressName = (
  address: string | Record<string, unknown> | null | undefined
): string => {
  if (!address) return "Address";

  if (typeof address === "string") {
    try {
      const parsedAddress = JSON.parse(address);
      if (typeof parsedAddress === "object") {
        return parsedAddress.name || "Address";
      }
    } catch {
      return "Address";
    }
    return "Address";
  }

  if (typeof address === "object") {
    return (address.name as string) || "Address";
  }

  return "Address";
};

// Helper function to get address details like booking flow
export const getAddressDetails = (
  address: string | Record<string, unknown> | null | undefined
): string => {
  if (!address) return "";

  let addressObj: Record<string, unknown> = {};

  if (typeof address === "string") {
    try {
      const parsedAddress = JSON.parse(address);
      if (typeof parsedAddress === "object") {
        addressObj = parsedAddress;
      }
    } catch {
      return "";
    }
  } else if (typeof address === "object") {
    addressObj = address;
  }

  const parts = [];
  if (addressObj.house_number) parts.push(`${addressObj.house_number},`);
  if (addressObj.city) parts.push(addressObj.city);
  if (addressObj.address) parts.push(addressObj.address);

  const fullAddress = parts.join(" ");

  // Truncate address if it's longer than 30 characters
  if (fullAddress.length > 30) {
    return fullAddress.substring(0, 30) + "...";
  }

  return fullAddress;
};

// Helper function to format address (kept for compatibility)
export const formatAddress = (
  address: string | Record<string, unknown> | null | undefined
): string => {
  const name = getAddressName(address);
  const details = getAddressDetails(address);
  return details ? `${name} - ${details}` : name;
};
