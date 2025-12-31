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
  tagTypes: ["SalesOrder"],
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
      getSalesOrderById: builder.query({
        query: (id: string) => `/sales-orders/${id}`,
        providesTags: (result, error, id) => [{ type: "SalesOrder", id }],
      }),
      addSalesOrder: builder.mutation({
        query: (salesOrderData) => ({
          url: "/sales-orders",
          method: "POST",
          body: salesOrderData,
        }),
        invalidatesTags: [{ type: "SalesOrder", id: "LIST" }],
      }),
      updateSalesOrder: builder.mutation({
        query: ({ id, ...salesOrderData }) => ({
          url: `/sales-orders/${id}`,
          method: "PUT",
          body: salesOrderData,
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "SalesOrder", id: arg.id },
          { type: "SalesOrder", id: "LIST" },
        ],
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
  useGetSalesOrderByIdQuery,
  useAddSalesOrderMutation,
  useUpdateSalesOrderMutation,
  useDeleteSalesOrderMutation,
} = salesOrdersApiSlice;

