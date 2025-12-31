import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryMeta,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { Stock } from "../../types";

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

export const stocksApiSlice = createApi({
  reducerPath: "stocks",
  baseQuery: metaBaseQuery,
  tagTypes: ["Stock"],
  endpoints: (builder) => {
    return {
      getStocks: builder.query({
        query: () => "/stocks",
        providesTags: (result: any) =>
          providesList(result?.data, "Stock"),
      }),
      getStockById: builder.query({
        query: (id: string) => `/stocks/${id}`,
        providesTags: (result, error, id) => [{ type: "Stock", id }],
      }),
      getStocksByProductId: builder.query({
        query: (productId: string) => `/stocks/product/${productId}`,
        providesTags: (result: any) =>
          providesList(result?.data, "Stock"),
      }),
      getLowStocks: builder.query({
        query: (threshold?: number) =>
          `/stocks/low-stock${threshold ? `?threshold=${threshold}` : ""}`,
        providesTags: (result: any) =>
          providesList(result?.data, "Stock"),
      }),
      addStock: builder.mutation({
        query: (stockData) => ({
          url: "/stocks",
          method: "POST",
          body: stockData,
        }),
        invalidatesTags: [{ type: "Stock", id: "LIST" }],
      }),
      updateStock: builder.mutation({
        query: ({ id, ...stockData }) => ({
          url: `/stocks/${id}`,
          method: "PUT",
          body: stockData,
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "Stock", id: arg.id },
          { type: "Stock", id: "LIST" },
        ],
      }),
      deleteStock: builder.mutation({
        query: ({ id }) => ({
          url: `/stocks/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "Stock", id: arg.id },
          { type: "Stock", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetStocksQuery,
  useGetStockByIdQuery,
  useGetStocksByProductIdQuery,
  useGetLowStocksQuery,
  useAddStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
} = stocksApiSlice;

