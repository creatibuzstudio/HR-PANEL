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
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.user = action.payload.user || null;
      if (action.payload.rememberMe) {
        setAuthLocalStorage(action.payload);
      } else {
        setSessionToken(
          action.payload.accessToken,
          action.payload.refreshToken,
          action.payload.user || null,
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
