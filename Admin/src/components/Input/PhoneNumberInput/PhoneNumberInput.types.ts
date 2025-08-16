export interface PhoneNumber {
  id: string;
  countryCode: string;
  phoneNumber: string;
}

export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag?: string;
}

export interface PhoneNumberInputProps {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  value: PhoneNumber[];
  onChange: (phoneNumbers: PhoneNumber[]) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  maxPhoneNumbers?: number;
  countryCodes?: CountryCode[];
  showFlags?: boolean;
} 