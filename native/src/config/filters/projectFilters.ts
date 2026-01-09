import { FilterConfig } from '../../components/FilterBottomSheet';

export const projectFilterConfig: FilterConfig = {
  fields: [
    {
      key: 'project_type',
      label: 'Project Type',
      type: 'toggle',
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Infrastructure', value: 'infrastructure' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'toggle',
      options: [
        { label: 'Starting Soon', value: 'starting_soon' },
        { label: 'Ongoing', value: 'on_going' },
        { label: 'Completed', value: 'completed' },
        { label: 'On Hold', value: 'on_hold' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
  ],
};
