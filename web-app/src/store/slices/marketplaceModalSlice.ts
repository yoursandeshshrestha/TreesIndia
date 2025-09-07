import { createSlice } from "@reduxjs/toolkit";

interface MarketplaceModalState {
  isOpen: boolean;
}

const initialState: MarketplaceModalState = {
  isOpen: false,
};

const marketplaceModalSlice = createSlice({
  name: "marketplaceModal",
  initialState,
  reducers: {
    openMarketplaceModal: (state) => {
      state.isOpen = true;
    },
    closeMarketplaceModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openMarketplaceModal, closeMarketplaceModal } =
  marketplaceModalSlice.actions;
export default marketplaceModalSlice.reducer;
