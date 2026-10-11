// utils/authStorage.js (or wherever you put these functions)

import { decodeJWT } from "@/lib/jwt-decoder";

export const setAuthLocalStorage = (auth, name = "celestial") => {
  const { accessToken, refreshToken, user } = auth;

  try {
    const { exp } = decodeJWT(accessToken);

    localStorage.setItem(`${name}_access`, accessToken);
    if (refreshToken) {
      localStorage.setItem(`${name}_refresh`, refreshToken);
    }
    localStorage.setItem(`${name}_exp`, exp.toString());

    if (user) {
      localStorage.setItem(`${name}_user`, JSON.stringify(user));
    }
  } catch (error) {
    console.error("Failed to set authentication data in localStorage:", error);
    // Depending on your error handling strategy, you might want to re-throw or handle differently
    throw error;
  }
};

export const getAuthLocalStorage = (name = "celestial") => {
  const accessToken = localStorage.getItem(`${name}_access`);
  const refreshToken = localStorage.getItem(`${name}_refresh`);
  const tokenExp = localStorage.getItem(`${name}_exp`);
  const user = localStorage.getItem(`${name}_user`);

  // Quick expiration check
  const isExpired = tokenExp && parseInt(tokenExp) * 1000 < Date.now();

  return {
    accessToken: isExpired ? null : accessToken,
    refreshToken,
    isExpired,
    user: user ? JSON.parse(user) : null,
  };
};

export const removeAuthLocalStorage = (name = "celestial") => {
  localStorage.removeItem(`${name}_access`);
  localStorage.removeItem(`${name}_refresh`);
  localStorage.removeItem(`${name}_exp`);
  localStorage.removeItem(`${name}_user`);
};
