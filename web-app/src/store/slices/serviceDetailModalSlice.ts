import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Service, PopularService } from "@/types/api";

type ServiceDetailModalService = Service | PopularService;

interface ServiceDetailModalState {
  isOpen: boolean;
  service: ServiceDetailModalService | null;
}

const initialState: ServiceDetailModalState = {
  isOpen: false,
  service: null,
};

const serviceDetailModalSlice = createSlice({
  name: "serviceDetailModal",
  initialState,
  reducers: {
    openServiceDetailModal: (
      state,
      action: PayloadAction<ServiceDetailModalService>
    ) => {
      state.isOpen = true;
      state.service = action.payload;
    },
    closeServiceDetailModal: (state) => {
      state.isOpen = false;
      state.service = null;
    },
  },
});

export const { openServiceDetailModal, closeServiceDetailModal } =
  serviceDetailModalSlice.actions;
export default serviceDetailModalSlice.reducer;
