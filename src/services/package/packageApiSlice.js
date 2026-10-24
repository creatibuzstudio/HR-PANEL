import { apiSlice } from "@/services/api/apiSlice.js";

export const packageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPackages: builder.query({
      query: () => "/package",
      transformResponse: (res) => res?.data || res || [],
      providesTags: ["Package"],
    }),

    searchPackages: builder.query({
      query: () => "/package",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : response?.items || [];

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (p) =>
              p.name?.toLowerCase().includes(query) ||
              p.description?.toLowerCase().includes(query) ||
              p.duration?.toLowerCase().includes(query)
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
      providesTags: ["Package"],
    }),

    getPackageById: builder.query({
      query: (id) => `/package/${id}`,
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "Package", id }],
    }),

    getPackageCategories: builder.query({
      query: () => "/package-category",
      transformResponse: (res) => res?.data || res || [],
      providesTags: ["PackageCategory"],
    }),

    searchPackageCategories: builder.query({
      query: () => "/package-category",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : response?.items || [];

        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (c) =>
              c.name?.toLowerCase().includes(query) ||
              c.description?.toLowerCase().includes(query)
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
      providesTags: ["PackageCategory"],
    }),

    createPackageCategory: builder.mutation({
      query: (data) => ({
        url: "/package-category",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PackageCategory", "Package"],
    }),

    updatePackageCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package-category/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PackageCategory", "Package"],
    }),

    deletePackageCategory: builder.mutation({
      query: (id) => ({
        url: `/package-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PackageCategory", "Package"],
    }),

    createPackage: builder.mutation({
      query: (data) => ({
        url: "/package",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Package"],
    }),

    updatePackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Package"],
    }),

    deletePackage: builder.mutation({
      query: (id) => ({
        url: `/package/${id}`,
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
  useGetPackageCategoriesQuery,
  useSearchPackageCategoriesQuery,
  useCreatePackageCategoryMutation,
  useUpdatePackageCategoryMutation,
  useDeletePackageCategoryMutation,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageApiSlice;
