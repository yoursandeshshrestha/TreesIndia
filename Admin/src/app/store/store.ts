import { configureStore } from "@reduxjs/toolkit";
import { sidebarReducer, commandPaletteReducer, userReducer } from "./slices";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    commandPalette: commandPaletteReducer,
    user: userReducer,
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
