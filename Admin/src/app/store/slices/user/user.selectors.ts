import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

// Base selectors
export const selectUserState = (state: RootState) => state.user;

export const selectUser = (state: RootState) => state.user.user;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;

// Derived selectors
export const selectUserAvatar = createSelector(
  [selectUser],
  (user) => user?.avatar || undefined
);

export const selectUserName = createSelector([selectUser], (user) => {
  if (user?.name && user.name !== "User") {
    return user.name;
  }
  if (user?.phone) {
    return user.phone;
  }
  return "User";
});

export const selectUserEmail = createSelector([selectUser], (user) => {
  if (user?.email) {
    return user.email;
  }
  if (user?.phone) {
    return `${user.phone}`;
  }
  return "user@treesindia.com";
});

export const selectUserPhone = createSelector(
  [selectUser],
  (user) => user?.phone || null
);

export const selectUserInitials = createSelector([selectUserName], (name) => {
  if (name && name !== "User") {
    // If name is a phone number, use first two digits
    if (name.startsWith("+91")) {
      return name.slice(3, 5).toUpperCase();
    }
    // If name contains spaces, use initials
    if (name.includes(" ")) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    // Otherwise, use first two characters
    return name.slice(0, 2).toUpperCase();
  }
  return "U";
});

export const selectIsAuthenticated = createSelector(
  [selectUser],
  (user) => !!user
);
