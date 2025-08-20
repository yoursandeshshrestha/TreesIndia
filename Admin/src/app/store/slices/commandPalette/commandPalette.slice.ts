import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommandPaletteState {
  isOpen: boolean;
  searchQuery: string;
}

const initialState: CommandPaletteState = {
  isOpen: false,
  searchQuery: "",
};

const commandPaletteSlice = createSlice({
  name: "commandPalette",
  initialState,
  reducers: {
    open: (state, action: PayloadAction<string | undefined>) => {
      state.isOpen = true;
      state.searchQuery = action.payload || "";
    },
    close: (state) => {
      state.isOpen = false;
      state.searchQuery = "";
    },
    toggle: (state) => {
      state.isOpen = !state.isOpen;
      if (!state.isOpen) {
        state.searchQuery = "";
      }
    },
  },
});

export const { open, close, toggle } = commandPaletteSlice.actions;
export default commandPaletteSlice.reducer;
