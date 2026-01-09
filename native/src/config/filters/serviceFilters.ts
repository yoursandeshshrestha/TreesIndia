import { FilterConfig } from '../../components/FilterBottomSheet';

export const serviceFilterConfig: FilterConfig = {
  fields: [
    {
      key: 'price_type',
      label: 'Price Type',
      type: 'toggle',
      options: [
        { label: 'Fixed Price', value: 'fixed' },
        { label: 'Inquiry Based', value: 'inquiry' },
      ],
    },
    {
      key: 'price_min',
      label: 'Min Price',
      type: 'toggle',
      options: [
        { label: '₹500', value: 500 },
        { label: '₹1K', value: 1000 },
        { label: '₹5K', value: 5000 },
        { label: '₹10K', value: 10000 },
        { label: '₹25K', value: 25000 },
        { label: '₹50K', value: 50000 },
      ],
    },
    {
      key: 'price_max',
      label: 'Max Price',
      type: 'toggle',
      options: [
        { label: 'Under ₹5K', value: 5000 },
        { label: 'Under ₹10K', value: 10000 },
        { label: 'Under ₹25K', value: 25000 },
        { label: 'Under ₹50K', value: 50000 },
        { label: 'Under ₹1L', value: 100000 },
        { label: 'Under ₹5L', value: 500000 },
      ],
    },
  ],
};
