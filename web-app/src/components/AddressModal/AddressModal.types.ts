export interface AddressFormData {
  name: string;
  customName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  landmark: string;
  house_number: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}

export interface AddressModalState {
  isAddingNew: boolean;
  isEditing: boolean;
  isConfirming: boolean;
  selectedAddressId: number | null;
  isServiceAvailable: boolean | null;
  isCheckingAvailability: boolean;
  loadingAddressId: number | null;
  formData: AddressFormData;
}
