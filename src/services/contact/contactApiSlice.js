import { apiSlice } from "@/services/api/apiSlice.js";

export const contactApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllContacts: builder.query({
      query: () => "/contact",
      transformResponse: (res) => {
        const raw = res?.data || res || [];
        return Array.isArray(raw) ? raw : [];
      },
      providesTags: ["Contact"],
    }),

    searchContacts: builder.query({
      query: () => "/contact",
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
            (c) => (c.status || "PENDING").toUpperCase() === statusFilter
          );
        }

        // Filter by search query
        const query = arg?.query?.toLowerCase()?.trim();
        if (query) {
          items = items.filter(
            (c) =>
              c.fullName?.toLowerCase().includes(query) ||
              c.email?.toLowerCase().includes(query) ||
              c.whatsapp?.toLowerCase().includes(query) ||
              c.budget?.toLowerCase().includes(query) ||
              c.productDetails?.toLowerCase().includes(query) ||
              c.status?.toLowerCase().includes(query)
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
          allItems: items,
          meta: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
          },
        };
      },
      providesTags: ["Contact"],
    }),

    getContactById: builder.query({
      query: (id) => `/contact/${id}`,
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, id) => [{ type: "Contact", id }],
    }),

    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),

    sendFollowUpEmail: builder.mutation({
      query: (data) => ({
        url: "/contact/send-followup",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useGetAllContactsQuery,
  useSearchContactsQuery,
  useGetContactByIdQuery,
  useDeleteContactMutation,
  useSendFollowUpEmailMutation,
} = contactApiSlice;
