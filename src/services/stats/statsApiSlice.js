import { apiSlice } from "@/services/api/apiSlice.js";

export const statsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/stats/dashboard",
      transformResponse: (response) => response?.data || response,
      providesTags: ["Stats", "Order", "Finance", "users"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = statsApiSlice;
