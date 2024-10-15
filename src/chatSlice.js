// chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ recipientId, message }, { getState, rejectWithValue }) => {
    if (!message.trim()) {
      return rejectWithValue("Message cannot be empty");
    }
    const { chat } = getState();
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: Date.now(),
      text: message,
      sender: chat.currentUser,
      recipient: recipientId,
      timestamp: new Date().toISOString(),
    };
  },
  {
    condition: (_, { getState }) => {
      const { chat } = getState();
      if (chat.status === "loading") {
        return false; // Don't send a new message if we're already sending one
      }
    },
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: {}, // { userId: { messages: [], unreadCount: 0 } }
    users: [
      { id: 1, name: "Alice", status: "online" },
      { id: 2, name: "Bob", status: "offline" },
      { id: 3, name: "Charlie", status: "online" },
    ],
    currentUser: "User",
    activeConversation: null,
    status: "idle",
    error: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateUserStatus: (state, action) => {
      const { id, status } = action.payload;
      const user = state.users.find((u) => u.id === id);
      if (user) {
        user.status = status;
      }
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      if (state.conversations[action.payload]) {
        state.conversations[action.payload].unreadCount = 0;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = "idle";
        const recipientId = action.payload.recipient;
        if (!state.conversations[recipientId]) {
          state.conversations[recipientId] = { messages: [], unreadCount: 0 };
        }
        state.conversations[recipientId].messages.push(action.payload);
        if (recipientId !== state.activeConversation) {
          state.conversations[recipientId].unreadCount++;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload || "Failed to send message";
      });
  },
});

export const {
  setCurrentUser,
  updateUserStatus,
  setActiveConversation,
  clearError,
} = chatSlice.actions;
export default chatSlice.reducer;
