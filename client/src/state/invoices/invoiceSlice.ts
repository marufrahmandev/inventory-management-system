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
  tagTypes: ["Invoice", "SalesOrder", "Customer"],
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
      getNextInvoiceNumber: builder.query({
        query: () => "/invoices/next-number",
        providesTags: [{ type: "Invoice", id: "LIST" }],
      }),
      getInvoiceById: builder.query({
        query: (id: string) => `/invoices/${id}`,
        providesTags: (result, error, id) => [{ type: "Invoice", id }],
        transformResponse: (response: any) => {
          if (response.success && response.data) {
            return response;
          }
          return { success: true, data: response };
        },
      }),
      getInvoicesBySalesOrderId: builder.query({
        query: (salesOrderId: string) =>
          `/invoices/sales-order/${salesOrderId}`,
        providesTags: (result: any) =>
          providesList(result?.data, "Invoice"),
      }),
      createInvoiceFromSalesOrder: builder.mutation({
        query: (salesOrderId: string) => ({
          url: `/invoices/from-sales-order/${salesOrderId}`,
          method: "POST",
          body: {},
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "Invoice", id: "LIST" },
          { type: "SalesOrder", id: arg },
        ],
      }),
      addInvoice: builder.mutation({
        query: (invoiceData) => ({
          url: "/invoices",
          method: "POST",
          body: invoiceData,
        }),
        invalidatesTags: (result, error, arg) => {
          const tags: any[] = [{ type: "Invoice", id: "LIST" }];
          if (arg?.customerId) {
            tags.push({ type: "Customer", id: arg.customerId });
            tags.push({ type: "Customer", id: "LIST" });
          }
          if (arg?.salesOrderId) {
            tags.push({ type: "SalesOrder", id: arg.salesOrderId });
          }
          return tags;
        },
      }),
      updateInvoice: builder.mutation({
        query: ({ id, ...invoiceData }) => ({
          url: `/invoices/${id}`,
          method: "PUT",
          body: invoiceData,
        }),
        invalidatesTags: (result, error, arg) => {
          const tags: any[] = [
            { type: "Invoice", id: arg.id },
            { type: "Invoice", id: "LIST" },
          ];
          if (arg?.customerId) {
            tags.push({ type: "Customer", id: arg.customerId });
            tags.push({ type: "Customer", id: "LIST" });
          }
          if (arg?.salesOrderId) {
            tags.push({ type: "SalesOrder", id: arg.salesOrderId });
          }
          return tags;
        },
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
  useGetNextInvoiceNumberQuery,
  useGetInvoiceByIdQuery,
  useGetInvoicesBySalesOrderIdQuery,
  useCreateInvoiceFromSalesOrderMutation,
  useAddInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
} = invoicesApiSlice;

