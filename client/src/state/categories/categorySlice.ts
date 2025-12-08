import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Category } from "../../types";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const categoriesApiSlice = createApi({
  reducerPath: "categories",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000",
  }),
  endpoints: (builder) => {
    return {
      getCategories: builder.query({
        // query: () => `/categories`,

        // Code to simulate a delay in the API call
        async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ): Promise<{ data: Category[] }>   {
            // call the actual API
            const result = await fetchWithBQ('/categories');

            // wait 10 seconds before returning
            await delay(2000);

            return result as { data: Category[] };
        },


      }),

      addCategory: builder.mutation({
        query: (category) => ({
          url: "/categories",
          method: "POST",
          body: category,
        }),
      }),

      updateCategory: builder.mutation({
        query: (category) => {
          const { id, ...body } = category;
          return {
            url: `categories/${id}`,
            method: "PUT",
            body,
          };
        },
      }),

      deleteCategory: builder.mutation({
        query: ({ id }) => ({
          url: `/categories/${id}`,
          method: "DELETE",
          body: id,
        }),
      }),
    };
  },
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} = categoriesApiSlice;
