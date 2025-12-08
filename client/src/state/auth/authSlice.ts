import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface User {
  id: number;
  name: string;
  email: string;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state: AuthState, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoading = false;
    },
    logout: (state: AuthState) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loginAsync.fulfilled, (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoading = false;
    });
    builder.addCase(loginAsync.rejected, (state) => {
      state.isLoading = false;
    });
    builder.addCase(logoutAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
    });
  }
});

export const loginAsync = createAsyncThunk("auth/login", async (user: User) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return user;
});

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return null;
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
