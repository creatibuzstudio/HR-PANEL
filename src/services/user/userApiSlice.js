import { apiSlice } from "@/services/api/apiSlice.js";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserWithSearch: builder.query({
      query: ({ page = 1, limit = 10, query = "", types = "" }) =>
        `/users/search?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}&types=${types}`,
      providesTags: ["users"],
    }),

    addUser: builder.mutation({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["users"],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: ["users"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),

    getAllRegistrationRequestWithSearch: builder.query({
      query: ({ page = 1, limit = 10, query = "", approvalStatus, source }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          query: query || "",
        });

        if (
          approvalStatus !== null &&
          approvalStatus !== undefined &&
          approvalStatus !== ""
        ) {
          params.append("approvalStatus", approvalStatus.toString());
        }

        if (source && source !== "ALL") {
          params.append("source", source);
        }

        return `/users/all/registration-requests?${params.toString()}`;
      },
      providesTags: ["registrationRequests", "users"],
    }),

    approveRegistrationRequest: builder.mutation({
      query: ({ requestId, approvalStatus }) => ({
        url: `/users/registration-request/${requestId}`,
        method: "PATCH",
        body: { approvalStatus },
      }),
      invalidatesTags: ["registrationRequests", "users"],
    }),

    deleteRegistrationRequest: builder.mutation({
      query: (requestId) => ({
        url: `/users/${requestId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["registrationRequests", "users"],
    }),

    bulkUpdateCustomer: builder.mutation({
      query: ({ ids, status }) => ({
        url: `/users/bulk-update-customer`,
        method: "POST",
        body: { ids, status },
      }),
      invalidatesTags: ["registrationRequests", "users"],
    }),

    createCustomer: builder.mutation({
      query: (customerData) => ({
        url: `/users/create-customer`,
        method: "POST",
        body: customerData,
      }),
      invalidatesTags: ["registrationRequests", "users"],
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...customerData }) => ({
        url: `/users/update-customer/${id}`,
        method: "PATCH",
        body: customerData,
      }),
      invalidatesTags: ["registrationRequests", "users"],
    }),

    getUsersByForecastCategory: builder.query({
      query: ({ id }) => `/users/forecast-category/${id}`,
      providesTags: ["users"],
    }),
  }),
});

export const {
  useGetUserWithSearchQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useGetAllRegistrationRequestWithSearchQuery,
  useApproveRegistrationRequestMutation,
  useDeleteRegistrationRequestMutation,
  useBulkUpdateCustomerMutation,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetUsersByForecastCategoryQuery,
} = userApiSlice;
