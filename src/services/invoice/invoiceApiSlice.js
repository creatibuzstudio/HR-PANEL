import { apiSlice } from "@/services/api/apiSlice";

export const adminInvoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoicesWithSearch: builder.query({
      query: ({
        query = "",
        limit = 15,
        page = 1,
        status = "",
        type = "",
      }) => ({
        url: "/invoice/search",
        params: {
          limit,
          page,
          query,
          type,
          status,
        },
      }),
      providesTags: ["Invoice"],
    }),
    getInvoiceById: builder.query({
      query: (id) => `/invoice/${id}`,
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),
    createInvoice: builder.mutation({
      query: (data) => ({
        url: "/invoice",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Invoice"],
    }),
    updateInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `/invoice/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Invoice"],
    }),
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoice/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoice"],
    }),
  }),
});

export const {
  useGetInvoicesWithSearchQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = adminInvoiceApi;
