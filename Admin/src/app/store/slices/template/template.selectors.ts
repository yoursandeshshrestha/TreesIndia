import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";

// Base selector
export const selectTemplateState = (state: RootState) => state.template;

// Derived selectors
export const selectTemplateLoading = createSelector(
  [selectTemplateState],
  (template) => template.isLoading
);

export const selectTemplateData = createSelector(
  [selectTemplateState],
  (template) => template.data
);

export const selectTemplateError = createSelector(
  [selectTemplateState],
  (template) => template.error
);

export const selectTemplateStatus = createSelector(
  [selectTemplateLoading, selectTemplateError, selectTemplateData],
  (isLoading, error, data) => ({
    isLoading,
    error,
    hasData: data.length > 0,
    isEmpty: data.length === 0,
  })
);
