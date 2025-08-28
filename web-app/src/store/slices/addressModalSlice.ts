import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AddressModalState {
  isOpen: boolean;
  initialModalType?: "list" | "add" | "edit" | "confirm";
  editingAddress?: any; // Address object to edit
}

const initialState: AddressModalState = {
  isOpen: false,
  initialModalType: "list",
  editingAddress: null,
};

const addressModalSlice = createSlice({
  name: "addressModal",
  initialState,
  reducers: {
    openAddressModal: (
      state,
      action: PayloadAction<{
        modalType?: "list" | "add" | "edit" | "confirm";
        editingAddress?: any;
      }>
    ) => {
      state.isOpen = true;
      state.initialModalType = action.payload?.modalType || "list";
      state.editingAddress = action.payload?.editingAddress || null;
    },
    closeAddressModal: (state) => {
      state.isOpen = false;
      state.initialModalType = "list";
      state.editingAddress = null;
    },
  },
});

export const { openAddressModal, closeAddressModal } =
  addressModalSlice.actions;

export default addressModalSlice.reducer;
