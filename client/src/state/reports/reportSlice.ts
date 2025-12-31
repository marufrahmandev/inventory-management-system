import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryMeta,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type {
  DashboardSummary,
  SalesReport,
  PurchaseReport,
  InventoryReport,
  InvoiceReport,
} from "../../types";

type Meta = {
  requestId: number;
  timestamp: number;
};

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

export const reportsApiSlice = createApi({
  reducerPath: "reports",
  baseQuery: metaBaseQuery,
  tagTypes: ["Report"],
  endpoints: (builder) => {
    return {
      getDashboardSummary: builder.query<DashboardSummary, void>({
        query: () => "/reports/dashboard",
        providesTags: ["Report"],
      }),
      getSalesReport: builder.query<SalesReport, { startDate?: string; endDate?: string }>({
        query: (params = {}) => {
          const queryParams = new URLSearchParams(params).toString();
          return `/reports/sales${queryParams ? `?${queryParams}` : ""}`;
        },
        providesTags: ["Report"],
      }),
      getPurchaseReport: builder.query<
        PurchaseReport,
        { startDate?: string; endDate?: string }
      >({
        query: (params = {}) => {
          const queryParams = new URLSearchParams(params).toString();
          return `/reports/purchase${queryParams ? `?${queryParams}` : ""}`;
        },
        providesTags: ["Report"],
      }),
      getInventoryReport: builder.query<InventoryReport, void>({
        query: () => "/reports/inventory",
        providesTags: ["Report"],
      }),
      getInvoiceReport: builder.query<
        InvoiceReport,
        { startDate?: string; endDate?: string }
      >({
        query: (params = {}) => {
          const queryParams = new URLSearchParams(params).toString();
          return `/reports/invoice${queryParams ? `?${queryParams}` : ""}`;
        },
        providesTags: ["Report"],
      }),
    };
  },
});

export const {
  useGetDashboardSummaryQuery,
  useGetSalesReportQuery,
  useGetPurchaseReportQuery,
  useGetInventoryReportQuery,
  useGetInvoiceReportQuery,
} = reportsApiSlice;

