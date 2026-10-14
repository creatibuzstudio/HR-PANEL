import { apiSlice } from "@/services/api/apiSlice.js";

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceOverview: builder.query({
      query: () => "/finance/overview",
      transformResponse: (response) => response?.data || response,
      providesTags: ["Finance", "Order"],
    }),

    getFinanceSettings: builder.query({
      query: () => "/finance/settings",
      transformResponse: (response) => response?.data || response,
      providesTags: ["Finance"],
    }),

    updateFinanceSettings: builder.mutation({
      query: (data) => ({
        url: "/finance/settings",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Finance"],
    }),

    getFinanceExecutives: builder.query({
      query: () => "/finance/executives",
      transformResponse: (response) => response?.data || response,
      providesTags: ["Finance", "users"],
    }),

    // --- Investor Capitals ---
    getCapitals: builder.query({
      query: () => "/finance/capitals",
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Finance"],
    }),

    createCapital: builder.mutation({
      query: (data) => ({
        url: "/finance/capitals",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Finance"],
    }),

    deleteCapital: builder.mutation({
      query: (id) => ({
        url: `/finance/capitals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Finance"],
    }),

    // --- Company Expenses & Dual Approvals ---
    getExpenses: builder.query({
      query: (status) => ({
        url: "/finance/expenses",
        params: status ? { status } : undefined,
      }),
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Finance"],
    }),

    getExpenseById: builder.query({
      query: (id) => `/finance/expenses/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ["Finance"],
    }),

    createExpense: builder.mutation({
      query: (data) => ({
        url: "/finance/expenses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Finance"],
    }),

    approveExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/finance/expenses/${id}/approve`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Finance"],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/finance/expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Finance"],
    }),
  }),
});

export const {
  useGetFinanceOverviewQuery,
  useGetFinanceSettingsQuery,
  useUpdateFinanceSettingsMutation,
  useGetFinanceExecutivesQuery,
  useGetCapitalsQuery,
  useCreateCapitalMutation,
  useDeleteCapitalMutation,
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useApproveExpenseMutation,
  useDeleteExpenseMutation,
} = financeApiSlice;
