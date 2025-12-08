import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Product } from "../../types";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const productsApiSlice = createApi({
  reducerPath: "products",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:3000",
  }),
  endpoints: (builder) => {
    return {
      getProducts: builder.query({
        // query: () => `/products`,

        // Code to simulate a delay in the API call
        async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ): Promise<{ data: Product[] }>   {  
            // call the actual API
            const result = await fetchWithBQ('/products');

            // wait 10 seconds before returning
            await delay(2000);

            return result as { data: Product[] };
        },


      }),

      addProduct: builder.mutation({
        query: (product) => ({
          url: "/products",
          method: "POST",
          body: product,
        }),
      }),

      updateProduct: builder.mutation({
        query: (product) => {
          const { id, ...body } = product;
          return {
            url: `products/${id}`,
            method: "PUT",
            body,
          };
        },
      }),

      deleteProduct: builder.mutation({
        query: ({ id }) => ({
          url: `/products/${id}`,
          method: "DELETE",
          body: id,
        }),
      }),
    };
  },
});

export const {
  useGetProductsQuery,
  useAddProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} = productsApiSlice;
