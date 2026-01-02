import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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
      providesTags: (result: any) => providesList(result?.data, "Customer"),
    }),
    getCustomer: builder.query<{ success: boolean; data: Customer }, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: "Customer", id }],
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        if (response.success && response.data) {
          return response;
        }
        return { success: true, data: response };
      },
    }),
    addCustomer: builder.mutation<{ success: boolean; data: Customer }, Partial<Customer>>({
      query: (customer) => ({
        url: "/customers",
        method: "POST",
        body: customer,
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),
    updateCustomer: builder.mutation<{ success: boolean; data: Customer }, { id: string } & Partial<Customer>>({
      query: ({ id, ...customer }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body: customer,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Customer", id: arg.id },
        { type: "Customer", id: "LIST" },
      ],
    }),
    deleteCustomer: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
      ],
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

