import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LocationModalState {
  isOpen: boolean;
}

const initialState: LocationModalState = {
  isOpen: false,
};

const locationModalSlice = createSlice({
  name: "locationModal",
  initialState,
  reducers: {
    openLocationModal: (state) => {
      state.isOpen = true;
    },
    closeLocationModal: (state) => {
      state.isOpen = false;
    },
    toggleLocationModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openLocationModal, closeLocationModal, toggleLocationModal } =
  locationModalSlice.actions;
export default locationModalSlice.reducer;
