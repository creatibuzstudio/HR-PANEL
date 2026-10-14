import { apiSlice } from "@/services/api/apiSlice.js";

export const payrollApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayrollSummary: builder.query({
      query: (month) => ({
        url: "/payroll/summary",
        params: month ? { month } : undefined,
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ["Payroll", "Finance"],
    }),

    generatePayroll: builder.mutation({
      query: (data) => ({
        url: "/payroll/generate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payroll", "Finance"],
    }),

    withdrawExecutive: builder.mutation({
      query: (data) => ({
        url: "/payroll/withdraw-executive",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payroll", "Finance"],
    }),

    disbursePayroll: builder.mutation({
      query: (data) => ({
        url: "/payroll/disburse",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payroll", "Finance"],
    }),

    getPayrollHistory: builder.query({
      query: () => "/payroll/history",
      transformResponse: (response) => response?.data || response || [],
      providesTags: ["Payroll"],
    }),

    getPayslip: builder.query({
      query: (id) => `/payroll/item/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ["Payroll"],
    }),
  }),
});

export const {
  useGetPayrollSummaryQuery,
  useGeneratePayrollMutation,
  useWithdrawExecutiveMutation,
  useDisbursePayrollMutation,
  useGetPayrollHistoryQuery,
  useGetPayslipQuery,
} = payrollApiSlice;
