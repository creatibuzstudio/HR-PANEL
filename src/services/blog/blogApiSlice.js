import { apiSlice } from "@/services/api/apiSlice.js";

export const blogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBlogs: builder.query({
      query: () => "/blog",
      transformResponse: (res) => res?.data || (Array.isArray(res) ? res : []),
      providesTags: ["Blog"],
    }),

    searchBlogs: builder.query({
      query: () => "/blog",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (b) =>
              b.title?.toLowerCase().includes(query) ||
              b.slug?.toLowerCase().includes(query) ||
              b.author?.toLowerCase().includes(query) ||
              b.seoTitle?.toLowerCase().includes(query) ||
              b.keywords?.toLowerCase().includes(query)
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
      providesTags: ["Blog"],
    }),

    getBlogById: builder.query({
      query: (id) => `/blog/${id}`,
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    createBlog: builder.mutation({
      query: (data) => ({
        url: "/blog",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blog"],
    }),

    updateBlog: builder.mutation({
      query: ({ id, data }) => ({
        url: `/blog/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Blog"],
    }),

    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),

    uploadBlogImage: builder.mutation({
      query: (formData) => ({
        url: "/uploads",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useSearchBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useUploadBlogImageMutation,
} = blogApiSlice;
