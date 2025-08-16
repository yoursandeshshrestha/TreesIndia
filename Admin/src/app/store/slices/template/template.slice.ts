import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TemplateState, TemplateActionPayload } from "./template.types";

const initialState: TemplateState = {
  isLoading: false,
  data: [],
  error: null,
};

const templateSlice = createSlice({
  name: "template",
  initialState,
  reducers: {
    // Define your reducers here
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setData: (state, action: PayloadAction<TemplateActionPayload>) => {
      state.data = action.payload.data || [];
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    reset: (state) => {
      state.isLoading = false;
      state.data = [];
      state.error = null;
    },
  },
});

export const { setLoading, setData, setError, reset } = templateSlice.actions;
export const templateReducer = templateSlice.reducer;
