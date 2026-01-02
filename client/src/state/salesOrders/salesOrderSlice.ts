import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryMeta,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { SalesOrder } from "../../types";

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

export const salesOrdersApiSlice = createApi({
  reducerPath: "salesOrders",
  baseQuery: metaBaseQuery,
  tagTypes: ["SalesOrder", "Customer"],
  endpoints: (builder) => {
    return {
      getSalesOrders: builder.query({
        query: (params = {}) => {
          const queryParams = new URLSearchParams(params).toString();
          return `/sales-orders${queryParams ? `?${queryParams}` : ""}`;
        },
        providesTags: (result: any) =>
          providesList(result?.data, "SalesOrder"),
      }),
      getNextSalesOrderNumber: builder.query({
        query: () => "/sales-orders/next-number",
        providesTags: [{ type: "SalesOrder", id: "LIST" }],
      }),
      getSalesOrderById: builder.query({
        query: (id: string) => `/sales-orders/${id}`,
        providesTags: (result, error, id) => [{ type: "SalesOrder", id }],
        transformResponse: (response: any) => {
          // Handle both wrapped and unwrapped responses
          if (response.success && response.data) {
            return response;
          }
          return { success: true, data: response };
        },
      }),
      addSalesOrder: builder.mutation({
        query: (salesOrderData) => ({
          url: "/sales-orders",
          method: "POST",
          body: salesOrderData,
        }),
        invalidatesTags: (result, error, arg) => {
          const tags: any[] = [{ type: "SalesOrder", id: "LIST" }];
          // If customerId is present, also invalidate customer cache
          if (arg?.customerId) {
            tags.push({ type: "Customer", id: arg.customerId });
            tags.push({ type: "Customer", id: "LIST" });
          }
          return tags;
        },
      }),
      updateSalesOrder: builder.mutation({
        query: ({ id, ...salesOrderData }) => ({
          url: `/sales-orders/${id}`,
          method: "PUT",
          body: salesOrderData,
        }),
        invalidatesTags: (result, error, arg) => {
          const tags: any[] = [
            { type: "SalesOrder", id: arg.id },
            { type: "SalesOrder", id: "LIST" },
          ];
          // If customerId is present, also invalidate customer cache
          if (arg?.customerId) {
            tags.push({ type: "Customer", id: arg.customerId });
            tags.push({ type: "Customer", id: "LIST" });
          }
          return tags;
        },
      }),
      deleteSalesOrder: builder.mutation({
        query: ({ id }) => ({
          url: `/sales-orders/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "SalesOrder", id: arg.id },
          { type: "SalesOrder", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetSalesOrdersQuery,
  useGetNextSalesOrderNumberQuery,
  useGetSalesOrderByIdQuery,
  useAddSalesOrderMutation,
  useUpdateSalesOrderMutation,
  useDeleteSalesOrderMutation,
} = salesOrdersApiSlice;

