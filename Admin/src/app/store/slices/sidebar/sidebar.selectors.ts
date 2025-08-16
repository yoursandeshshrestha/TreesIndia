import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";

// Base selector
export const selectSidebarState = (state: RootState) => state.sidebar;

// Derived selectors
export const selectIsSidebarOpen = createSelector(
  [selectSidebarState],
  (sidebar) => sidebar.isOpen
);

export const selectSidebarStatus = createSelector(
  [selectIsSidebarOpen],
  (isOpen) => ({
    isOpen,
    isClosed: !isOpen,
  })
);
