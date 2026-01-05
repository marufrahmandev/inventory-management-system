import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: string;
  bankDetails?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function providesList<R extends { id: string | number }[], T extends string>(
  resultsWithIds: R | undefined,
  tagType: T
) {
  return resultsWithIds
    ? [
        { type: tagType, id: "LIST" },
        ...resultsWithIds.map(({ id }) => ({ type: tagType, id })),
      ]
    : [{ type: tagType, id: "LIST" }];
}

export const suppliersApiSlice = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query<{ success: boolean; data: Supplier[]; count: number }, void>({
      query: () => "/suppliers",
      providesTags: (result: any) => providesList(result?.data, "Supplier"),
    }),
    getSupplier: builder.query<{ success: boolean; data: Supplier }, string>({
      query: (id) => `/suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: "Supplier", id }],
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        if (response.success && response.data) {
          return response;
        }
        return { success: true, data: response };
      },
    }),
    addSupplier: builder.mutation<{ success: boolean; data: Supplier }, Partial<Supplier>>({
      query: (supplier) => ({
        url: "/suppliers",
        method: "POST",
        body: supplier,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),
    updateSupplier: builder.mutation<{ success: boolean; data: Supplier }, { id: string } & Partial<Supplier>>({
      query: ({ id, ...supplier }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body: supplier,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Supplier", id: arg.id },
        { type: "Supplier", id: "LIST" },
      ],
    }),
    deleteSupplier: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useAddSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApiSlice;

