import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [],
        activeChatUser: null,
    },
    reducers: {
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        setActiveChatUser: (state, action) => {
            state.activeChatUser = action.payload;
        }
    }
});

export const { setOnlineUsers, setMessages, addMessage, setActiveChatUser } = chatSlice.actions;
export default chatSlice.reducer;
