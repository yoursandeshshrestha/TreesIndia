// Export reducer
export { default as userReducer } from "./user.slice";

// Export actions
export {
  setUser,
  setUserLoading,
  setUserError,
  updateUser,
  updateUserAvatar,
  clearUser,
} from "./user.slice";

// Export selectors
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
} from "./user.selectors";

// Export types
export type { UserState } from "./user.slice";
