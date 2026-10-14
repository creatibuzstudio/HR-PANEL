import { apiSlice } from "@/services/api/apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params = {}) => {
        const { query = "", status = "", paymentStatus = "" } = params;
        const cleanedParams = {};
        if (query) cleanedParams.query = query;
        if (status && status !== "ALL") cleanedParams.status = status;
        if (paymentStatus && paymentStatus !== "ALL") cleanedParams.paymentStatus = paymentStatus;

        return {
          url: "/orders",
          params: cleanedParams,
        };
      },
      transformResponse: (response) => {
        let items = [];
        if (Array.isArray(response)) {
          items = response;
        } else if (response?.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response?.items && Array.isArray(response.items)) {
          items = response.items;
        }
        return items;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Order", id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    getOrderByInvoice: builder.query({
      query: (invoiceNumber) => `/orders/invoice/${invoiceNumber}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, invoiceNumber) => [
        { type: "Order", id: invoiceNumber },
      ],
    }),

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),

    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    recordPayment: builder.mutation({
      query: ({ id, paymentData }) => ({
        url: `/orders/${id}/payment`,
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderByInvoiceQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useRecordPaymentMutation,
  useDeleteOrderMutation,
} = orderApiSlice;
