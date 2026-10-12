import { apiSlice } from "@/services/api/apiSlice.js";

export const departmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartmentsWithSearch: builder.query({
      query: () => "/department",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : response?.items || [];

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (d) =>
              d.name?.toLowerCase().includes(query) ||
              d.description?.toLowerCase().includes(query)
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
      providesTags: ["departments"],
    }),

    getDepartments: builder.query({
      query: () => "/department",
      transformResponse: (res) => res?.data || res || [],
      providesTags: ["departments"],
    }),

    addDepartment: builder.mutation({
      query: (newDepartment) => ({
        url: "/department",
        method: "POST",
        body: newDepartment,
      }),
      invalidatesTags: ["departments"],
    }),

    updateDepartment: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/department/${id}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: ["departments"],
    }),

    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/department/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["departments"],
    }),
  }),
});

export const {
  useGetDepartmentsWithSearchQuery,
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApiSlice;
