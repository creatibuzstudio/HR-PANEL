import { apiSlice } from "@/services/api/apiSlice.js";

export const roleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => "/roles",
      providesTags: ["Role"],
    }),

    getRolesWithSearch: builder.query({
      query: ({ page = 1, limit = 10, query = "" }) => ({
        url: `/roles/search?page=${page}&limit=${limit}&query=${query}`,
        method: "GET",
      }),
      providesTags: ["Role"],
    }),

    getSingleRole: builder.query({
      query: (id) => `/roles/${id}`,
      providesTags: ["Role"],
    }),

    createRole: builder.mutation({
      query: (newRole) => ({
        url: "/roles",
        method: "POST",
        body: newRole,
      }),
      invalidatesTags: ["Role"],
    }),

    updateRole: builder.mutation({
      query: ({ id, ...updatedRole }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body: updatedRole,
      }),
      invalidatesTags: ["Role"],
    }),

    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),

    getAllPermissions: builder.query({
      query: () => "/roles/permissions",
    }),

    updateRolePermissions: builder.mutation({
      query: ({ id, payload }) => ({
        url: `roles/permission/${id}`,
        method: "PATCH",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetSingleRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesWithSearchQuery,
  useGetAllPermissionsQuery,
  useUpdateRolePermissionsMutation,
} = roleApiSlice;
