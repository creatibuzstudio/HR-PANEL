import { apiSlice } from "@/services/api/apiSlice.js";

export const packageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPackages: builder.query({
      query: () => "/packages",
      providesTags: ["Package"],
    }),
    searchPackages: builder.query({
      query: ({ query = "", limit = 10, page = 1 }) => ({
        url: `/packages/search`,
        params: { query, limit, page },
      }),
      providesTags: ["Package"],
    }),
    getPackageById: builder.query({
      query: (id) => `/packages/${id}`,
      providesTags: (result, error, id) => [{ type: "Package", id }],
    }),
    createPackage: builder.mutation({
      query: (data) => ({
        url: "/packages",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Package"],
    }),
    updatePackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/packages/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Package"],
    }),
    deletePackage: builder.mutation({
      query: (id) => ({
        url: `/packages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Package"],
    }),
  }),
});

export const {
  useGetAllPackagesQuery,
  useSearchPackagesQuery,
  useGetPackageByIdQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageApiSlice;
