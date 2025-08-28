import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ContactInfoModalState {
  isOpen: boolean;
}

const initialState: ContactInfoModalState = {
  isOpen: false,
};

const contactInfoModalSlice = createSlice({
  name: "contactInfoModal",
  initialState,
  reducers: {
    openContactInfoModal: (state) => {
      state.isOpen = true;
    },
    closeContactInfoModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openContactInfoModal, closeContactInfoModal } =
  contactInfoModalSlice.actions;
export default contactInfoModalSlice.reducer;
