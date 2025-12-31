import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryMeta,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { Invoice } from "../../types";

type Meta = {
  requestId: number;
  timestamp: number;
};

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

const metaBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  Meta & FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const requestId = Math.floor(Math.random() * 1000000);
  const timestamp = Date.now();

  const baseResult = await fetchBaseQuery({ baseUrl: "http://localhost:3000/api" })(
    args,
    api,
    extraOptions
  );

  return {
    ...baseResult,
    meta: baseResult.meta && { ...baseResult.meta, requestId, timestamp },
  };
};

export const invoicesApiSlice = createApi({
  reducerPath: "invoices",
  baseQuery: metaBaseQuery,
  tagTypes: ["Invoice"],
  endpoints: (builder) => {
    return {
      getInvoices: builder.query({
        query: (params = {}) => {
          const queryParams = new URLSearchParams(params).toString();
          return `/invoices${queryParams ? `?${queryParams}` : ""}`;
        },
        providesTags: (result: any) =>
          providesList(result?.data, "Invoice"),
      }),
      getInvoiceById: builder.query({
        query: (id: string) => `/invoices/${id}`,
        providesTags: (result, error, id) => [{ type: "Invoice", id }],
      }),
      getInvoicesBySalesOrderId: builder.query({
        query: (salesOrderId: string) =>
          `/invoices/sales-order/${salesOrderId}`,
        providesTags: (result: any) =>
          providesList(result?.data, "Invoice"),
      }),
      addInvoice: builder.mutation({
        query: (invoiceData) => ({
          url: "/invoices",
          method: "POST",
          body: invoiceData,
        }),
        invalidatesTags: [{ type: "Invoice", id: "LIST" }],
      }),
      updateInvoice: builder.mutation({
        query: ({ id, ...invoiceData }) => ({
          url: `/invoices/${id}`,
          method: "PUT",
          body: invoiceData,
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "Invoice", id: arg.id },
          { type: "Invoice", id: "LIST" },
        ],
      }),
      deleteInvoice: builder.mutation({
        query: ({ id }) => ({
          url: `/invoices/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "Invoice", id: arg.id },
          { type: "Invoice", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoicesBySalesOrderIdQuery,
  useAddInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoicesApiSlice;

