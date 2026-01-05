import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { Category } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "../../state/categories/categorySlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash } from "lucide-react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

function Categories() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [deleteCategory] = useDeleteCategoryMutation();
  const columns: ColumnDef<Category>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      ),
      size: 50,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 500,
    },
    {
      accessorKey: "parent_category_name",
      header: "Parent Category",
      cell: (row) => row.getValue() || "N/A",
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 150,
    },
    {
      accessorKey: "category_image_url",
      header: "Image",
      cell: (row) => {
        const imageUrl = row.row.original.category_image_url || 
                        row.row.original.secureUrl || 
                        row.row.original.optimizedImageUrl;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Category Image"
            className="w-10 h-10 rounded-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-sm bg-gray-200"></div>
        );
      },
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 100,
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/categories/edit/${row.row.original.id}`);
            }}
          >
            <Pencil className="w-4 h-4 text-blue-500" aria-label="Edit" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();

              handleDelete(row.row.original.id as string);
            }}
            disabled={deletingRowId !== null} // disable all buttons while deleting
          >
            {deletingRowId === row.row.original.id ? (
              <>
                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              </>
            ) : (
              <Trash className="w-4 h-4 text-red-500" aria-label="Delete" />
            )}
          </button>
        </div>
      ),
      size: 100,
    },
  ];

  const handleDelete = async (id: string) => {
    setDeletingRowId(id);
    setIsDeleting(true);
    const response = await deleteCategory({ id });
    setIsDeleting(false);
    setDeletingRowId(null);
    console.log("response in handleDelete", response);
    if (response.error) {
      toast.error("Error in deleting category", toastConfig.error);
    } else {
      toast.success("Category deleted successfully", toastConfig.success);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetCategoriesQuery({});

  useEffect(() => {
    setPageTitle("Categories");
  }, []);

  // Extract data array from API response
  const categories = data?.data || [];

  return (
    <div>
      <ToastContainer />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search categories..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => navigate("/categories/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={categories}
          isLoading={isLoading}
          isError={isError}
          error={error}
          globalFilter={globalFilter}
          emptyMessage="No categories found. Click 'Add Category' to create one."
        />
      </div>
    </div>
  );
}

export default Categories;
