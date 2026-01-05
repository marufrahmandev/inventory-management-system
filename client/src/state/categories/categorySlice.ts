import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryMeta,
  type FetchArgs,
  type BaseQueryFn,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { Category } from "../../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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

  const baseResult = await fetchBaseQuery({ baseUrl: BASE_URL })(
    args,
    api,
    extraOptions
  );

  return {
    ...baseResult,
    meta: baseResult.meta && { ...baseResult.meta, requestId, timestamp },
  };
};

export const categoriesApiSlice = createApi({
  reducerPath: "categories",
  baseQuery: metaBaseQuery,
  tagTypes: ["Category"],
  endpoints: (builder) => {
    return {
      getCategories: builder.query({
        queryFn: async (_arg, _queryApi, _extraOptions, fetchWithBQ) => {
          const result = await fetchWithBQ("/categories");
          if (result.error) {
            return { error: result.error };
          }
          // Backend now returns { success: true, data: [...] }
          // Return it directly without wrapping
          return { data: result.data };
        },
        providesTags: (result: any) => providesList(result?.data, "Category")
      }),
      addCategory: builder.mutation({
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
        invalidatesTags: [{ type: "Category", id: "LIST" }],
      }),
      getCategoryById: builder.query({
        query: (id: string) => ({
          url: `/categories/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [{ type: "Category", id }],
      }),

      updateCategory: builder.mutation({
        query: ({
          id,
          file,
          name,
          description,
          parent_category,
          category_image,
        }) => {
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
            formData: true,
          };
        },
        invalidatesTags: (result, error, arg) => [
          { type: "Category", id: arg.id },
          { type: "Category", id: "LIST" },
        ],
      }),
      deleteCategory: builder.mutation({
        query: ({ id }) => ({
          url: `/categories/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: (result, error, arg) => [
          { type: "Category", id: arg.id },
          { type: "Category", id: "LIST" },
        ],
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
