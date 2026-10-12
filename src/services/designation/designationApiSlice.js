import { apiSlice } from "@/services/api/apiSlice.js";

export const designationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDesignationsWithSearch: builder.query({
      query: () => "/designation",
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
              d.title?.toLowerCase().includes(query) ||
              d.level?.toLowerCase().includes(query) ||
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
      providesTags: ["designations"],
    }),

    getDesignations: builder.query({
      query: () => "/designation",
      transformResponse: (res) => res?.data || res || [],
      providesTags: ["designations"],
    }),

    addDesignation: builder.mutation({
      query: (newDesignation) => ({
        url: "/designation",
        method: "POST",
        body: newDesignation,
      }),
      invalidatesTags: ["designations"],
    }),

    updateDesignation: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/designation/${id}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: ["designations"],
    }),

    deleteDesignation: builder.mutation({
      query: (id) => ({
        url: `/designation/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["designations"],
    }),
  }),
});

export const {
  useGetDesignationsWithSearchQuery,
  useGetDesignationsQuery,
  useAddDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
} = designationApiSlice;
