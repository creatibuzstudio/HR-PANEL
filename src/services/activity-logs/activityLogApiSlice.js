import { apiSlice } from "../api/apiSlice";

export const activityLogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query({
      query: (params = {}) => ({
        url: "/activity-logs",
        params: {
          ...(params.page ? { page: params.page } : {}),
          ...(params.limit ? { limit: params.limit } : {}),
          ...(params.search ? { search: params.search } : {}),
          ...(params.module && params.module !== "ALL" ? { module: params.module } : {}),
          ...(params.action && params.action !== "ALL" ? { action: params.action } : {}),
          ...(params.status && params.status !== "ALL" ? { status: params.status } : {}),
          ...(params.userId && params.userId !== "ALL" ? { userId: params.userId } : {}),
          ...(params.startDate ? { startDate: params.startDate } : {}),
          ...(params.endDate ? { endDate: params.endDate } : {}),
        },
      }),
      transformResponse: (res) => res?.data || res,
      providesTags: ["ActivityLog"],
    }),

    getActivityLogStats: builder.query({
      query: () => "/activity-logs/stats",
      transformResponse: (res) => res?.data || res,
      providesTags: ["ActivityLog"],
    }),

    getActivityLogsExport: builder.query({
      query: (params = {}) => ({
        url: "/activity-logs/export",
        params: {
          ...(params.search ? { search: params.search } : {}),
          ...(params.module && params.module !== "ALL" ? { module: params.module } : {}),
          ...(params.action && params.action !== "ALL" ? { action: params.action } : {}),
          ...(params.status && params.status !== "ALL" ? { status: params.status } : {}),
          ...(params.userId && params.userId !== "ALL" ? { userId: params.userId } : {}),
          ...(params.startDate ? { startDate: params.startDate } : {}),
          ...(params.endDate ? { endDate: params.endDate } : {}),
        },
      }),
      transformResponse: (res) => res?.data || res,
      providesTags: ["ActivityLog"],
    }),

    createActivityLog: builder.mutation({
      query: (body) => ({
        url: "/activity-logs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ActivityLog"],
    }),
  }),
});

export const {
  useGetActivityLogsQuery,
  useGetActivityLogStatsQuery,
  useLazyGetActivityLogsExportQuery,
  useCreateActivityLogMutation,
} = activityLogApiSlice;
