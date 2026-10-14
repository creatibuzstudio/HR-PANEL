import { apiSlice } from "@/services/api/apiSlice.js";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserWithSearch: builder.query({
      query: () => "/users",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : response?.items || [];

        // Exclude 'client' role from system users
        items = items.filter(
          (u) => u.role?.toLowerCase() !== "client"
        );

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (u) =>
              u.name?.toLowerCase().includes(query) ||
              u.email?.toLowerCase().includes(query) ||
              u.phone?.toLowerCase().includes(query) ||
              u.role?.toLowerCase().includes(query) ||
              u.department?.name?.toLowerCase().includes(query) ||
              u.designation?.title?.toLowerCase().includes(query)
          );
        }

        const page = Number(arg?.page) || 1;
        const limit = Number(arg?.limit) || 10;
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const paginatedItems = items.slice((page - 1) * limit, page * limit);

        return {
          items: paginatedItems,
          meta: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
          },
        };
      },
      providesTags: ["users"],
    }),

    getClients: builder.query({
      query: () => "/users",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : response?.items || [];

        // Filter ONLY role === 'client'
        items = items.filter(
          (u) => u.role?.toLowerCase() === "client"
        );

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (u) =>
              u.name?.toLowerCase().includes(query) ||
              u.email?.toLowerCase().includes(query) ||
              u.phone?.toLowerCase().includes(query) ||
              u.location?.toLowerCase().includes(query)
          );
        }

        const page = Number(arg?.page) || 1;
        const limit = Number(arg?.limit) || 10;
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const paginatedItems = items.slice((page - 1) * limit, page * limit);

        return {
          items: paginatedItems,
          meta: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
          },
        };
      },
      providesTags: ["users"],
    }),

    getAllClientUsers: builder.query({
      query: () => "/users",
      transformResponse: (response) => {
        const raw = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : response?.items || [];
        return raw.filter((u) => u.role?.toLowerCase() === "client");
      },
      providesTags: ["users"],
    }),

    getDepartments: builder.query({
      query: () => "/department",
      transformResponse: (res) => res?.data || res || [],
      providesTags: ["departments"],
    }),

    getDesignations: builder.query({
      query: () => "/designation",
      transformResponse: (res) => res?.data || res || [],
      providesTags: ["designations"],
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

    uploadImage: builder.mutation({
      query: (formData) => ({
        url: "/uploads",
        method: "POST",
        body: formData,
      }),
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

    getSingleUser: builder.query({
      query: (id) => `/users/${id}`,
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "users", id }],
    }),
  }),
});

export const {
  useGetUserWithSearchQuery,
  useGetClientsQuery,
  useGetAllClientUsersQuery,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useUploadImageMutation,
  useGetAllRegistrationRequestWithSearchQuery,
  useApproveRegistrationRequestMutation,
  useDeleteRegistrationRequestMutation,
  useBulkUpdateCustomerMutation,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetUsersByForecastCategoryQuery,
  useGetSingleUserQuery,
} = userApiSlice;

