import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Location {
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationState {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  location: null,
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<Location>) => {
      state.location = action.payload;
      state.error = null;
    },
    setLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLocationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearLocation: (state) => {
      state.location = null;
      state.error = null;
    },
  },
});

export const {
  setLocation,
  setLocationLoading,
  setLocationError,
  clearLocation,
} = locationSlice.actions;
export default locationSlice.reducer;
