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
        async queryFn(
          _arg,
          _queryApi,
          _extraOptions,
          fetchWithBQ
        ): Promise<{ data: Category[] }> {
          // call the actual API
          const result = await fetchWithBQ("/categories");
          return result as { data: Category[] };
        },
        providesTags: ["Categories" as any],
      }),

      // addCategory: builder.mutation({
      //   query: (category) => ({
      //     url: "/categories",
      //     method: "POST",
      //     body: category,
      //   }),
      // }),
      addCategory: builder.mutation<
        any,
        {
          file: File;
          name: string;
          description: string;
          parent_category: string | null;
        }
      >({
        query: ({ file, name, description, parent_category }) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("name", name);
          formData.append("description", description);
          formData.append("parent_category", parent_category || "");
          return {
            url: "/categories",
            method: "POST",
            body: formData,
            formData: true, // This explicitly tells RTK Query to handle it as FormData
          };
        },
        invalidatesTags: ["Categories" as any],
      }),
      getCategoryById: builder.query({
        query: (id: string) => ({
          url: `/categories/${id}`,
          method: "GET",
        }),
        providesTags: ["Categories" as any],
      }),

       updateCategory: builder.mutation<
        any,
        {
          id: string;
          file: File;
          name: string;
          description: string;
          parent_category: string | null;
          category_image: string | null;
        }
      >({
        query: ({ id, file, name, description, parent_category, category_image }) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("name", name);
          formData.append("description", description);
          formData.append("parent_category", parent_category || "");
          formData.append("category_image", category_image || "");
          return {
            url: `/categories/${id}`,
            method: "PUT",
            body: formData,
            formData: true, // This explicitly tells RTK Query to handle it as FormData
          };
        },
        invalidatesTags: ["Categories" as any],
      }),
      // updateCategory: builder.mutation({
      //   query: (category) => {
      //     const { id, ...body } = category;
      //     return {
      //       url: `categories/${id}`,
      //       method: "PUT",
      //       body,
      //     };
      //   },
      // }),

      deleteCategory: builder.mutation({
        query: ({ id }) => ({
          url: `/categories/${id}`,
          method: "DELETE",
          body: { id },
        }),
        invalidatesTags: ["Categories" as any],
      }),
    };
  },
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetCategoryByIdQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} = categoriesApiSlice;
