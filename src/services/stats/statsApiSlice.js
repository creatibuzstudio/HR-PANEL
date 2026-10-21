import { apiSlice } from "@/services/api/apiSlice.js";

export const statsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/stats/dashboard",
      transformResponse: (response) => response?.data || response,
      providesTags: ["Stats", "Order", "Finance", "users"],
    }),
    getAboutStats: builder.query({
      query: () => "/stats/about",
      transformResponse: (response) => response?.data || response,
      providesTags: ["Stats", "AboutStats"],
    }),
    updateAboutStats: builder.mutation({
      query: (data) => ({
        url: "/stats/about",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Stats", "AboutStats"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAboutStatsQuery,
  useUpdateAboutStatsMutation,
} = statsApiSlice;
