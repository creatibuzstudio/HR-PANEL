import { apiSlice } from "../api/apiSlice";

export const timeTrackerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    clockIn: builder.mutation({
      query: (body) => ({
        url: "/time-tracker/clock-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TimeTracker"],
    }),

    clockOut: builder.mutation({
      query: (body) => ({
        url: "/time-tracker/clock-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TimeTracker"],
    }),

    deleteSession: builder.mutation({
      query: (id) => ({
        url: `/time-tracker/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TimeTracker"],
    }),

    getActiveSession: builder.query({
      query: (userId) => ({
        url: "/time-tracker/active",
        params: { userId },
      }),
      transformResponse: (res) => (res && Object.prototype.hasOwnProperty.call(res, "data") ? res.data : res),
      providesTags: ["TimeTracker"],
    }),

    getMyWorkReport: builder.query({
      query: ({ userId, date, startDate, endDate } = {}) => ({
        url: "/time-tracker/my-report",
        params: {
          ...(userId ? { userId } : {}),
          ...(date ? { date } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      }),
      transformResponse: (res) => (res && Object.prototype.hasOwnProperty.call(res, "data") ? res.data : res),
      providesTags: ["TimeTracker"],
    }),

    getAdminLiveSessions: builder.query({
      query: () => "/time-tracker/admin/live",
      transformResponse: (res) => (res && Object.prototype.hasOwnProperty.call(res, "data") ? res.data : res),
      providesTags: ["TimeTracker"],
    }),

    getAdminAllSessions: builder.query({
      query: (params = {}) => ({
        url: "/time-tracker/admin/sessions",
        params: {
          ...(params.page ? { page: params.page } : {}),
          ...(params.limit ? { limit: params.limit } : {}),
          ...(params.search ? { search: params.search } : {}),
          ...(params.userId && params.userId !== "ALL" ? { userId: params.userId } : {}),
          ...(params.date ? { date: params.date } : {}),
          ...(params.startDate ? { startDate: params.startDate } : {}),
          ...(params.endDate ? { endDate: params.endDate } : {}),
          ...(params.status && params.status !== "ALL" ? { status: params.status } : {}),
        },
      }),
      transformResponse: (res) => (res && Object.prototype.hasOwnProperty.call(res, "data") ? res.data : res),
      providesTags: ["TimeTracker"],
    }),

    getAdminDailyReport: builder.query({
      query: (date) => ({
        url: "/time-tracker/admin/daily-report",
        params: { ...(date ? { date } : {}) },
      }),
      transformResponse: (res) => (res && Object.prototype.hasOwnProperty.call(res, "data") ? res.data : res),
      providesTags: ["TimeTracker"],
    }),
  }),
});

export const {
  useClockInMutation,
  useClockOutMutation,
  useDeleteSessionMutation,
  useGetActiveSessionQuery,
  useGetMyWorkReportQuery,
  useGetAdminLiveSessionsQuery,
  useGetAdminAllSessionsQuery,
  useGetAdminDailyReportQuery,
} = timeTrackerApiSlice;
