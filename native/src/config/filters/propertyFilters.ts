import { FilterConfig } from '../../components/FilterBottomSheet';

export const propertyFilterConfig: FilterConfig = {
  fields: [
    {
      key: 'listing_type',
      label: 'Listing Type',
      type: 'toggle',
      options: [
        { label: 'For Sale', value: 'sale' },
        { label: 'For Rent', value: 'rent' },
      ],
    },
    {
      key: 'property_type',
      label: 'Property Type',
      type: 'toggle',
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
      ],
    },
    {
      key: 'bedrooms',
      label: 'Bedrooms',
      type: 'toggle',
      options: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5+', value: 5 },
      ],
    },
    {
      key: 'bathrooms',
      label: 'Bathrooms',
      type: 'toggle',
      options: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4+', value: 4 },
      ],
    },
    {
      key: 'furnishing_status',
      label: 'Furnishing Status',
      type: 'toggle',
      options: [
        { label: 'Furnished', value: 'furnished' },
        { label: 'Semi-Furnished', value: 'semi-furnished' },
        { label: 'Unfurnished', value: 'unfurnished' },
      ],
    },
    {
      key: 'max_price',
      label: 'Max Price',
      type: 'toggle',
      options: [
        { label: 'Under ₹50K', value: 50000 },
        { label: 'Under ₹1L', value: 100000 },
        { label: 'Under ₹2L', value: 200000 },
        { label: 'Under ₹10L', value: 1000000 },
      ],
    },
  ],
};
