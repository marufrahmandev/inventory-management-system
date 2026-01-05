import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryMeta,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { Product } from "../../types";

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

export const productsApiSlice = createApi({
  reducerPath: "products",
  baseQuery: metaBaseQuery,
  tagTypes: ["Product"],
  endpoints: (builder) => {
    return {
      getProducts: builder.query({
        query: () => "/products",
        providesTags: (result: any) =>
          providesList(result?.data, "Product"),
      }),
      getProductById: builder.query({
        query: (id: string) => `/products/${id}`,
        providesTags: (result, error, id) => [{ type: "Product", id }],
      }),
      getProductsByCategoryId: builder.query({
        query: (categoryId: string) => `/products/category/${categoryId}`,
        providesTags: (result: any) =>
          providesList(result?.data, "Product"),
      }),
      addProduct: builder.mutation({
        query: (productData) => ({
          url: "/products",
          method: "POST",
          body: productData,
          formData: true, // Tell RTK Query this is FormData
        }),
        invalidatesTags: [{ type: "Product", id: "LIST" }],
      }),
      updateProduct: builder.mutation({
        query: ({ id, formData }: { id: string; formData: FormData }) => {
          // Remove id from FormData as it goes in URL
          formData.delete("id");
          return {
            url: `/products/${id}`,
            method: "PUT",
            body: formData,
            formData: true, // Tell RTK Query this is FormData
          };
        },
        invalidatesTags: (result, error, arg) => {
          // arg is now { id, formData }
          return [
            { type: "Product", id: arg.id },
            { type: "Product", id: "LIST" },
          ];
        },
      }),
      deleteProduct: builder.mutation({
        query: ({ id }) => ({
          url: `/products/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "Product", id: arg.id },
          { type: "Product", id: "LIST" },
        ],
      }),
    };
  },
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
