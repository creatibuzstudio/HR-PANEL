import { apiSlice } from "@/services/api/apiSlice.js";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => "/category",
      transformResponse: (res) => res?.data || (Array.isArray(res) ? res : []),
      providesTags: ["Category"],
    }),

    searchCategories: builder.query({
      query: () => "/category",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter((c) =>
            c.name?.toLowerCase().includes(query)
          );
        }

        // Sort by order if present
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
      providesTags: ["Category"],
    }),

    getCategoryById: builder.query({
      query: (id) => `/category/${id}`,
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    createCategory: builder.mutation({
      query: (data) => ({
        url: "/category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/category/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    uploadCategoryImage: builder.mutation({
      query: (formData) => ({
        url: "/uploads",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useSearchCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} = categoryApiSlice;
