import { createSlice } from "@reduxjs/toolkit";

interface SlotModalState {
  isOpen: boolean;
}

const initialState: SlotModalState = {
  isOpen: false,
};

const slotModalSlice = createSlice({
  name: "slotModal",
  initialState,
  reducers: {
    openSlotModal: (state) => {
      state.isOpen = true;
    },
    closeSlotModal: (state) => {
      state.isOpen = false;
    },
    toggleSlotModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openSlotModal, closeSlotModal, toggleSlotModal } =
  slotModalSlice.actions;

export default slotModalSlice.reducer;
