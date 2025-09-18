import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatModalState {
  isOpen: boolean;
  preselectedConversationId?: number;
  createConversationWithUser?: {
    user_1: number;
    user_2: number;
  };
}

const initialState: ChatModalState = {
  isOpen: false,
  preselectedConversationId: undefined,
  createConversationWithUser: undefined,
};

const chatModalSlice = createSlice({
  name: "chatModal",
  initialState,
  reducers: {
    openChatModal: (state) => {
      state.isOpen = true;
      state.preselectedConversationId = undefined;
      state.createConversationWithUser = undefined;
    },
    openChatModalWithConversation: (
      state,
      action: PayloadAction<{ conversationId: number }>
    ) => {
      state.isOpen = true;
      state.preselectedConversationId = action.payload.conversationId;
      state.createConversationWithUser = undefined;
    },
    openChatModalWithUser: (
      state,
      action: PayloadAction<{
        user_1: number;
        user_2: number;
      }>
    ) => {
      state.isOpen = true;
      state.preselectedConversationId = undefined;
      state.createConversationWithUser = action.payload;
    },
    closeChatModal: (state) => {
      state.isOpen = false;
      state.preselectedConversationId = undefined;
      state.createConversationWithUser = undefined;
    },
  },
});

export const {
  openChatModal,
  openChatModalWithConversation,
  openChatModalWithUser,
  closeChatModal,
} = chatModalSlice.actions;
export default chatModalSlice.reducer;
