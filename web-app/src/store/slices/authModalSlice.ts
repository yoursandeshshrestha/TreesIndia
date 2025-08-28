import { createSlice } from "@reduxjs/toolkit";

interface AuthModalState {
  isOpen: boolean;
  redirectTo?: string;
}

const initialState: AuthModalState = {
  isOpen: false,
  redirectTo: undefined,
};

const authModalSlice = createSlice({
  name: "authModal",
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.isOpen = true;
      state.redirectTo = action.payload?.redirectTo;
    },
    closeAuthModal: (state) => {
      state.isOpen = false;
      state.redirectTo = undefined;
    },
    toggleAuthModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openAuthModal, closeAuthModal, toggleAuthModal } =
  authModalSlice.actions;
export default authModalSlice.reducer;
