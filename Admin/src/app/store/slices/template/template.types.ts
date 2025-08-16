// Template for new slice types
// Replace 'Template' with your actual slice name

export interface TemplateState {
  // Define your state properties here
  isLoading: boolean;
  data: unknown[];
  error: string | null;
}

export interface TemplateActionPayload {
  // Define action payload types here
  data?: unknown[];
  error?: string;
}
