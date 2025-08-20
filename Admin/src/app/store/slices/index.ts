// Export all slice reducers
export { sidebarReducer } from "./sidebar";
export { default as commandPaletteReducer } from "./commandPalette/commandPalette.slice";

// Export all slice actions
export { toggleSidebar, setSidebarOpen } from "./sidebar";
export { open, close, toggle } from "./commandPalette/commandPalette.slice";

// Export all selectors
export {
  selectSidebarState,
  selectIsSidebarOpen,
  selectSidebarStatus,
} from "./sidebar";

// Export all types
export type { SidebarState, SetSidebarOpenPayload } from "./sidebar";

// Add new slices here as they are created
// Example:
// export { userReducer } from "./user";
// export { selectUser, selectUserProfile } from "./user";
// export type { UserState, UserProfile } from "./user";
