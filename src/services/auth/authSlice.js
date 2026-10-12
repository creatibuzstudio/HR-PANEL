import { setAuthLocalStorage } from "@/hooks/useLocal";
import { clearTokens, getTokens, setSessionToken } from "@/hooks/useToken";
import { createSlice } from "@reduxjs/toolkit";

const { accessToken, user } = getTokens();

const initialState = {
  accessToken: accessToken || null,
  user: user || null,
  isAuthenticated: !!accessToken,
  userPermissions: [],
  permissionsLoaded: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      const token = action.payload.accessToken || action.payload.access_token;
      const user = action.payload.user || action.payload.data || null;
      state.accessToken = token;
      state.isAuthenticated = !!token;
      state.user = user;
      if (action.payload.rememberMe) {
        setAuthLocalStorage({
          ...action.payload,
          accessToken: token,
          user,
        });
      } else {
        setSessionToken(
          token,
          action.payload.refreshToken,
          user,
        );
      }
    },
    userDetailsFetched: (state, action) => {
      state.user = action.payload;
    },
    userPermissionsFetched: (state, action) => {
      state.userPermissions = action.payload;
      state.permissionsLoaded = true;
    },
    userLoggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.userPermissions = [];
      state.permissionsLoaded = false;
      clearTokens();
    },
  },
});

export const {
  userLoggedIn,
  userDetailsFetched,
  userLoggedOut,
  userPermissionsFetched,
} = authSlice.actions;

export default authSlice.reducer;
