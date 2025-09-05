import { createSlice } from "@reduxjs/toolkit";

interface SearchModalState {
  isOpen: boolean;
}

const initialState: SearchModalState = {
  isOpen: false,
};

const searchModalSlice = createSlice({
  name: "searchModal",
  initialState,
  reducers: {
    openSearchModal: (state) => {
      state.isOpen = true;
    },
    closeSearchModal: (state) => {
      state.isOpen = false;
    },
    toggleSearchModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { openSearchModal, closeSearchModal, toggleSearchModal } =
  searchModalSlice.actions;
export default searchModalSlice.reducer;
