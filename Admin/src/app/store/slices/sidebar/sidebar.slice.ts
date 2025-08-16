import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SidebarState, SetSidebarOpenPayload } from "./sidebar.types";

const initialState: SidebarState = {
  isOpen: true,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<SetSidebarOpenPayload>) => {
      state.isOpen = action.payload.isOpen;
    },
  },
});

export const { toggleSidebar, setSidebarOpen } = sidebarSlice.actions;
export const sidebarReducer = sidebarSlice.reducer;
