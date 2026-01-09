import { FilterConfig } from '../../components/FilterBottomSheet';

export const vendorFilterConfig: FilterConfig = {
  fields: [
    {
      key: 'business_type',
      label: 'Business Type',
      type: 'toggle',
      options: [
        { label: 'Any', value: undefined },
        { label: 'Individual', value: 'individual' },
        { label: 'Partnership', value: 'partnership' },
        { label: 'Company', value: 'company' },
        { label: 'LLP', value: 'llp' },
        { label: 'Pvt Ltd', value: 'pvt_ltd' },
        { label: 'Public Ltd', value: 'public_ltd' },
      ],
    },
  ],
};
