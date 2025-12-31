import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export interface Customer {
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
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const customersApiSlice = createApi({
  reducerPath: "customersApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomers: builder.query<{ success: boolean; data: Customer[]; count: number }, void>({
      query: () => "/customers",
      providesTags: ["Customer"],
    }),
    getCustomer: builder.query<{ success: boolean; data: Customer }, string>({
      query: (id) => `/customers/${id}`,
      providesTags: ["Customer"],
    }),
    addCustomer: builder.mutation<{ success: boolean; data: Customer }, Partial<Customer>>({
      query: (customer) => ({
        url: "/customers",
        method: "POST",
        body: customer,
      }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation<{ success: boolean; data: Customer }, { id: string } & Partial<Customer>>({
      query: ({ id, ...customer }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: customer,
      }),
      invalidatesTags: ["Customer"],
    }),
    deleteCustomer: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApiSlice;

