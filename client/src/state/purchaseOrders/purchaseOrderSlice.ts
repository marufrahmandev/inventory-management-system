import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryMeta,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { PurchaseOrder } from "../../types";

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

export const purchaseOrdersApiSlice = createApi({
  reducerPath: "purchaseOrders",
  baseQuery: metaBaseQuery,
  tagTypes: ["PurchaseOrder", "Supplier"],
  endpoints: (builder) => {
    return {
      getPurchaseOrders: builder.query({
        query: (params = {}) => {
          const queryParams = new URLSearchParams(params).toString();
          return `/purchase-orders${queryParams ? `?${queryParams}` : ""}`;
        },
        providesTags: (result: any) =>
          providesList(result?.data, "PurchaseOrder"),
      }),
      getPurchaseOrderById: builder.query({
        query: (id: string) => `/purchase-orders/${id}`,
        providesTags: (result, error, id) => [{ type: "PurchaseOrder", id }],
        transformResponse: (response: any) => {
          // Handle both wrapped and unwrapped responses
          if (response.success && response.data) {
            return response;
          }
          return { success: true, data: response };
        },
      }),
      addPurchaseOrder: builder.mutation({
        query: (purchaseOrderData) => ({
          url: "/purchase-orders",
          method: "POST",
          body: purchaseOrderData,
        }),
        invalidatesTags: (result, error, arg) => {
          const tags: any[] = [{ type: "PurchaseOrder", id: "LIST" }];
          // If supplierId is present, also invalidate supplier cache
          if (arg?.supplierId) {
            tags.push({ type: "Supplier", id: arg.supplierId });
            tags.push({ type: "Supplier", id: "LIST" });
          }
          return tags;
        },
      }),
      updatePurchaseOrder: builder.mutation({
        query: ({ id, ...purchaseOrderData }) => ({
          url: `/purchase-orders/${id}`,
          method: "PUT",
          body: purchaseOrderData,
        }),
        invalidatesTags: (result, error, arg) => {
          const tags: any[] = [
            { type: "PurchaseOrder", id: arg.id },
            { type: "PurchaseOrder", id: "LIST" },
          ];
          // If supplierId is present, also invalidate supplier cache
          if (arg?.supplierId) {
            tags.push({ type: "Supplier", id: arg.supplierId });
            tags.push({ type: "Supplier", id: "LIST" });
          }
          return tags;
        },
      }),
      deletePurchaseOrder: builder.mutation({
        query: ({ id }) => ({
          url: `/purchase-orders/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "PurchaseOrder", id: arg.id },
          { type: "PurchaseOrder", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useAddPurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} = purchaseOrdersApiSlice;

