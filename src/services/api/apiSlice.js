import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { userLoggedIn, userLoggedOut } from "@/services/auth/authSlice";
import { getTokens } from "@/hooks/useToken";

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.creatibuzstudio.com";


const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    headers.set("Cache-Control", "no-cache");
    headers.set("Pragma", "no-cache");
    return headers;
  },
  fetchFn: (input, init) => fetch(input, { ...init, cache: "no-store" }),
});

// const baseQueryWithReauth = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);

//   const { accessToken, refreshToken, rememberMe } = getTokens();
//   let retryCount = 0;

//   while (
//     (!accessToken || (result.error && result.error.status === 401)) &&
//     retryCount < MAX_RETRY_COUNT
//   ) {
//     retryCount++;
//     try {
//       if (refreshToken) {
//         const refreshResult = await baseQuery(
//           {
//             url: "/auth/refresh-token",
//             method: "POST",
//             body: { refreshToken },
//             credentials: "include",
//           },
//           api,
//           extraOptions,
//         );

//         if (refreshResult.data?.success) {
//           // Clear existing cache before logging in new user
//           api.dispatch(apiSlice.util.resetApiState());

//           api.dispatch(
//             userLoggedIn({
//               accessToken: refreshResult?.data?.data?.accessToken,
//               refreshToken: refreshResult?.data?.data?.refreshToken,
//               rememberMe,
//             }),
//           );

//           // Retry the original request with new token
//           result = await baseQuery(args, api, extraOptions);
//           break;
//         } else {
//           api.dispatch(userLoggedOut());
//           api.dispatch(apiSlice.util.resetApiState());
//           break;
//         }
//       } else {
//         api.dispatch(userLoggedOut());
//         api.dispatch(apiSlice.util.resetApiState());
//         break;
//       }
//     } catch (error) {
//       console.error("Refresh token failed:", error);
//       api.dispatch(userLoggedOut());
//       api.dispatch(apiSlice.util.resetApiState());
//       break;
//     }
//   }

//   return result;
// };

// Middleware to clear cache when user changes
const customMiddleware = (api) => (next) => (action) => {
  if (action.type === "auth/userLoggedIn") {
    // Clear all cache when a new user logs in
    api.dispatch(apiSlice.util.resetApiState());
  }
  return next(action);
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQuery,
  tagTypes: ["auth", "Role", "users", "user-profile", "Subscription", "NidCheck", "SmsLogs", "Notification", "Package", "PackageCategory", "PackageBooking", "Contact", "Category", "Blog", "Casestudy", "Order", "Finance", "ActivityLog", "TimeTracker"],
  keepUnusedDataFor: 0, // Don't keep any unused data
  refetchOnMountOrArgChange: true, // Always refetch when component mounts
  refetchOnReconnect: true, // Refetch on reconnection
  endpoints: () => ({}),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(customMiddleware),
});

// Export utility functions for cache management
export const {
  util: { resetApiState },
} = apiSlice;

export const setupApiSlice = (store) => {
  // Subscribe to store changes to handle user logout
  store.subscribe(() => {
    const state = store.getState();
    if (!state.auth.isAuthenticated) {
      store.dispatch(resetApiState());
    }
  });
};
