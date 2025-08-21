// Export all slice reducers
export { sidebarReducer } from "./sidebar";
export { default as commandPaletteReducer } from "./commandPalette/commandPalette.slice";
export { userReducer } from "./user";

// Export all slice actions
export { toggleSidebar, setSidebarOpen } from "./sidebar";
export { open, close, toggle } from "./commandPalette/commandPalette.slice";
export {
  setUser,
  setUserLoading,
  setUserError,
  updateUser,
  updateUserAvatar,
  clearUser,
} from "./user";

// Export all selectors
export {
  selectSidebarState,
  selectIsSidebarOpen,
  selectSidebarStatus,
} from "./sidebar";
export {
  selectUserState,
  selectUser,
  selectUserLoading,
  selectUserError,
  selectUserAvatar,
  selectUserName,
  selectUserEmail,
  selectUserPhone,
  selectUserInitials,
  selectIsAuthenticated,
} from "./user";

// Export all types
export type { SidebarState, SetSidebarOpenPayload } from "./sidebar";
export type { UserState } from "./user";
