// Template for new slice exports
// Replace 'template' with your actual slice name

// Slice exports
export { templateReducer } from "./template.slice";
export { setLoading, setData, setError, reset } from "./template.slice";

// Selector exports
export {
  selectTemplateState,
  selectTemplateLoading,
  selectTemplateData,
  selectTemplateError,
  selectTemplateStatus,
} from "./template.selectors";

// Type exports
export type { TemplateState, TemplateActionPayload } from "./template.types";
