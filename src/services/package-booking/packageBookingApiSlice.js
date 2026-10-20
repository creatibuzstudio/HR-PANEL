import { apiSlice } from "@/services/api/apiSlice.js";

export const packageBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBookings: builder.query({
      query: () => "/package-booking",
      transformResponse: (res) => {
        const raw = res?.data || res || [];
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: ["PackageBooking"],
    }),

    searchBookings: builder.query({
      query: () => "/package-booking",
      transformResponse: (response, meta, arg) => {
        let items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : response?.items || [];

        // Filter by status if provided
        const statusFilter = arg?.status?.toUpperCase()?.trim();
        if (statusFilter && statusFilter !== "ALL") {
          items = items.filter(
            (b) => (b.status || "PENDING").toUpperCase() === statusFilter
          );
        }

        // Filter by search query
        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (b) =>
              b.name?.toLowerCase().includes(query) ||
              b.userEmail?.toLowerCase().includes(query) ||
              b.companyName?.toLowerCase().includes(query) ||
              b.companyEmail?.toLowerCase().includes(query) ||
              b.billingCycle?.toLowerCase().includes(query) ||
              b.status?.toLowerCase().includes(query) ||
              b.package?.name?.toLowerCase().includes(query)
          );
        }

        // Sort descending by createdAt
        items = [...items].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const page = Number(arg?.page) || 1;
        const limit = Number(arg?.limit) || 10;
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        const paginatedItems = items.slice((page - 1) * limit, page * limit);

        return {
          items: paginatedItems,
          allItems: items, // Useful for stats calculation
          meta: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
          },
        };
      },
      providesTags: ["PackageBooking"],
    }),

    getBookingById: builder.query({
      query: (id) => `/package-booking/${id}`,
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "PackageBooking", id }],
    }),

    createBooking: builder.mutation({
      query: (data) => ({
        url: "/package-booking",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PackageBooking", "users"],
    }),

    updateBooking: builder.mutation({
      query: ({ id, data }) => ({
        url: `/package-booking/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["PackageBooking"],
    }),

    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `/package-booking/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PackageBooking"],
    }),
  }),
});

export const {
  useGetAllBookingsQuery,
  useSearchBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = packageBookingApiSlice;
