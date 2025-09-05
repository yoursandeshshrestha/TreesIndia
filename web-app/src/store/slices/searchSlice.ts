import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SearchState {
  isModalOpen: boolean;
  searchQuery: string;
  isSearching: boolean;
  recentSearches: string[];
  selectedSuggestion: string | null;
}

const initialState: SearchState = {
  isModalOpen: false,
  searchQuery: "",
  isSearching: false,
  recentSearches: [],
  selectedSuggestion: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    openSearchModal: (state) => {
      state.isModalOpen = true;
      state.selectedSuggestion = null;
    },
    closeSearchModal: (state) => {
      state.isModalOpen = false;
      state.searchQuery = "";
      state.selectedSuggestion = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        // Keep only last 10 searches
        if (state.recentSearches.length > 10) {
          state.recentSearches = state.recentSearches.slice(0, 10);
        }
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setSelectedSuggestion: (state, action: PayloadAction<string | null>) => {
      state.selectedSuggestion = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = "";
      state.selectedSuggestion = null;
    },
  },
});

export const {
  openSearchModal,
  closeSearchModal,
  setSearchQuery,
  setSearching,
  addRecentSearch,
  clearRecentSearches,
  setSelectedSuggestion,
  clearSearchQuery,
} = searchSlice.actions;

export default searchSlice.reducer;

