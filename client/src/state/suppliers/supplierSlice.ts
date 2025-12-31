import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

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

export const suppliersApiSlice = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query<{ success: boolean; data: Supplier[]; count: number }, void>({
      query: () => "/suppliers",
      providesTags: ["Supplier"],
    }),
    getSupplier: builder.query<{ success: boolean; data: Supplier }, string>({
      query: (id) => `/suppliers/${id}`,
      providesTags: ["Supplier"],
    }),
    addSupplier: builder.mutation<{ success: boolean; data: Supplier }, Partial<Supplier>>({
      query: (supplier) => ({
        url: "/suppliers",
        method: "POST",
        body: supplier,
      }),
      invalidatesTags: ["Supplier"],
    }),
    updateSupplier: builder.mutation<{ success: boolean; data: Supplier }, { id: string } & Partial<Supplier>>({
      query: ({ id, ...supplier }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body: supplier,
      }),
      invalidatesTags: ["Supplier"],
    }),
    deleteSupplier: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supplier"],
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

