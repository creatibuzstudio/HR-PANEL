import {
  getAuthLocalStorage,
  removeAuthLocalStorage,
  setAuthLocalStorage,
} from "./useLocal";

// Function to retrieve authentication tokens
export const getTokens = () => {
  // Try to get tokens from localStorage first (for "remember me" functionality)
  const {
    accessToken: localAccessToken,
    refreshToken: localRefreshToken,
    isExpired: isLocalExpired, // Get expiration status from localStorage
    user: localUser,
  } = getAuthLocalStorage();

  if (!isLocalExpired && localAccessToken && localUser) {
    return {
      accessToken: localAccessToken,
      refreshToken: localRefreshToken,
      rememberMe: true,
      user: localUser, // Include user data if available
    };
  } else {
    // If local storage tokens are not valid or not present, check sessionStorage for session-only tokens
    const sessionAccessToken = sessionStorage.getItem("celestial_access");
    const sessionRefreshToken = sessionStorage.getItem("celestial_refresh");
    const sessionUser = sessionStorage.getItem("celestial_user");

    // For sessionStorage, we assume they are valid for the current session until explicitly cleared
    // or the session ends (browser tab closed). No explicit 'exp' check here,
    // as it's typically handled by the server on token usage or on tab close.
    return {
      accessToken: sessionAccessToken,
      refreshToken: sessionRefreshToken,
      rememberMe: false,
      user: sessionUser ? JSON.parse(sessionUser) : null, // Parse user data if available
    };
  }
};

// Function to clear all authentication tokens from both sessionStorage and localStorage
export const clearTokens = () => {
  // Clear from sessionStorage
  sessionStorage.removeItem("celestial_access");
  sessionStorage.removeItem("celestial_refresh");
  sessionStorage.removeItem("celestial_user");

  // Clear from localStorage (for "remember me" data)
  removeAuthLocalStorage();
};

// Function to set authentication tokens specifically for the current session (not "remember me")
export const setSessionToken = (accessToken, refreshToken, user) => {
  sessionStorage.setItem("celestial_access", accessToken);
  sessionStorage.setItem("celestial_refresh", refreshToken);
  // Optionally, you can also store user data in sessionStorage
  sessionStorage.setItem("celestial_user", JSON.stringify(user));

  // When setting session tokens, ensure any "remember me" tokens are cleared
  // to avoid confusion or unintended persistent login.
  removeAuthLocalStorage();
};

// Optional: A helper function to explicitly set "remember me" tokens
export const setRememberMeTokens = (accessToken, refreshToken, user) => {
  // Use the localStorage setter to store tokens persistently
  setAuthLocalStorage({ accessToken, refreshToken, user });
  // Also, clear session storage in case it had temporary tokens
  sessionStorage.removeItem("celestial_access");
  sessionStorage.removeItem("celestial_refresh");
  sessionStorage.removeItem("celestial_user");
};
