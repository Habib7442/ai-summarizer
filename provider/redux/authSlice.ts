import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

type GlobalState = {
  isLogged: boolean;
  user: Document | null; // Update the type of user to allow null or Document
  isLoading: boolean;
};

const initialState: GlobalState = {
  isLogged: false,
  user: null,
  isLoading: true,
};

// export const fetchUser = createAsyncThunk("global/fetchUser", async () => {
//   const response = await getCurrentUser();
//   return response;
// });

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsLogged: (state, action) => {
      state.isLogged = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setIsLogged, setUser, setIsLoading } = authSlice.actions;
export default authSlice.reducer;
