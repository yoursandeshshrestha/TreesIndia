import { configureStore } from "@reduxjs/toolkit";
import locationModalReducer from "./slices/locationModalSlice";

export const store = configureStore({
  reducer: {
    locationModal: locationModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
