import { apiSlice } from "@/services/api/apiSlice.js";

export const casestudyApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCasestudies: builder.query({
      query: () => "/casestudies",
      transformResponse: (res) => res?.data || (Array.isArray(res) ? res : []),
      providesTags: ["Casestudy"],
    }),

    searchCasestudies: builder.query({
      query: () => "/casestudies",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (c) =>
              c.title?.toLowerCase().includes(query) ||
              c.slug?.toLowerCase().includes(query) ||
              c.tag?.toLowerCase().includes(query) ||
              c.category?.name?.toLowerCase().includes(query) ||
              c.technologies?.toLowerCase().includes(query)
          );
        }

        // Sort by order
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
      providesTags: ["Casestudy"],
    }),

    getCasestudyById: builder.query({
      query: (id) => `/casestudies/${id}`,
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "Casestudy", id }],
    }),

    createCasestudy: builder.mutation({
      query: (data) => ({
        url: "/casestudies",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Casestudy"],
    }),

    updateCasestudy: builder.mutation({
      query: ({ id, data }) => ({
        url: `/casestudies/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Casestudy"],
    }),

    deleteCasestudy: builder.mutation({
      query: (id) => ({
        url: `/casestudies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Casestudy"],
    }),

    uploadCasestudyImage: builder.mutation({
      query: (formData) => ({
        url: "/uploads",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetAllCasestudiesQuery,
  useSearchCasestudiesQuery,
  useGetCasestudyByIdQuery,
  useCreateCasestudyMutation,
  useUpdateCasestudyMutation,
  useDeleteCasestudyMutation,
  useUploadCasestudyImageMutation,
} = casestudyApiSlice;
