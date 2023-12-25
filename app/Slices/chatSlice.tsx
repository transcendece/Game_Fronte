import { createAsyncThunk ,createSlice, PayloadAction } from '@reduxjs/toolkit'
import store from '../store/store';
import { messages } from '../components/chatComp/messages';

export interface Message {
  avatar: string,
  content: string;
  sender: string;
  reciever:string;
  senderId: string;
  recieverId:string;
  isOwner: boolean;
  conversationId: string;
}

export interface Conversation {
  id: number;
  online: boolean;
  username: string;
  avatar: string;
  owner:string;
  timestamp?: number;
  messages: Message[];
  senderId: string;
  Conversationid: string;
  recieverId:string;
  sender: string;
  reciever:string;
}

const initialState:{entity:Conversation []; loading: boolean; error: null | string } = {
  entity: [],
  loading: true,
  error: null,
};


export const fetchChatData = createAsyncThunk("chat/fetch", async (thunkApi) => {
    try {
        const response = await fetch("http://localhost:4000/Chat/user", {
          method: "GET",
          credentials: 'include',
        });
        const data = await response.json();
        // console.log('Chat data from server:', data);
        return data;
      } catch (error) {
        console.error('Error fetching chat chat data:', error);
        throw error;
      }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<{ convId: string, message: Message }>) => {
     const conversation = state.entity.find(conv => conv.Conversationid === action.payload.convId);
     if (conversation){
      conversation.messages.push(action.payload.message);
     }
     //if (conversation) {
     //  conversation.messages.push({
     //    avatar: conversation.avatar,
     //    content: action.payload.message,
     //    sender: conversation.sender,
     //    isOwner: true,
     //    senderId: 'userId',
     //    recieverId: conversation.recieverId,
     //    conversationId: action.payload.convId,
     //    receiver:conversation.receiver
     //  });
     //}
    }
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatData.fulfilled, (state, action) => {
        // console.log('Chat data from server:', action.payload);
        state.entity = action.payload;
        if (state.entity !== undefined)
          state.loading = false;
      })
      .addCase(fetchChatData.rejected, (state, action) => {
        state.loading = true;
        state.error = action.error.message || 'Something went wrong !';
      });
  },
});


// export const { addInfos } = chatSlice.actions;
export default chatSlice.reducer;
export const { addMessage } = chatSlice.actions;
// export const selectUser = (state: RootState) => state.user.user_Data
// export const selectLoading = (state: RootState) => state.user.loading
// export const selectError = (state: RootState) => state.user.error

