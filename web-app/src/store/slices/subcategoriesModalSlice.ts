import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SubcategoriesModalState {
  isOpen: boolean;
  categoryId: number | null;
  categoryName: string;
}

const initialState: SubcategoriesModalState = {
  isOpen: false,
  categoryId: null,
  categoryName: "",
};

const subcategoriesModalSlice = createSlice({
  name: "subcategoriesModal",
  initialState,
  reducers: {
    openSubcategoriesModal: (
      state,
      action: PayloadAction<{ categoryId: number; categoryName: string }>
    ) => {
      state.isOpen = true;
      state.categoryId = action.payload.categoryId;
      state.categoryName = action.payload.categoryName;
    },
    closeSubcategoriesModal: (state) => {
      state.isOpen = false;
      state.categoryId = null;
      state.categoryName = "";
    },
  },
});

export const { openSubcategoriesModal, closeSubcategoriesModal } =
  subcategoriesModalSlice.actions;
export default subcategoriesModalSlice.reducer;
