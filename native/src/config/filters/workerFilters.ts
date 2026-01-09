import { FilterConfig } from '../../components/FilterBottomSheet';

export const workerFilterConfig: FilterConfig = {
  fields: [
    {
      key: 'experience',
      label: 'Experience',
      type: 'toggle',
      options: [
        { label: 'Any', value: 'any' },
        { label: '0-2 years', value: '0-2' },
        { label: '3-5 years', value: '3-5' },
        { label: '6-10 years', value: '6-10' },
        { label: '10+ years', value: '10+' },
      ],
    },
  ],
};

// Helper function to convert experience string to min/max values for API
export const parseExperienceFilter = (experience: string) => {
  switch (experience) {
    case 'any':
      return { experience_min: undefined, experience_max: undefined };
    case '0-2':
      return { experience_min: 0, experience_max: 2 };
    case '3-5':
      return { experience_min: 3, experience_max: 5 };
    case '6-10':
      return { experience_min: 6, experience_max: 10 };
    case '10+':
      return { experience_min: 10, experience_max: undefined };
    default:
      return { experience_min: undefined, experience_max: undefined };
  }
};
