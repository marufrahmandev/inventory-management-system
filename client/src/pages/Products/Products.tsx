import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { Product } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../state/products/productSlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash } from "lucide-react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

function Products() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [deleteProduct] = useDeleteProductMutation();

  const columns: ColumnDef<Product>[] = [
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
      accessorKey: "product_image_url",
      header: "Image",
      cell: (row) => {
        const imageUrl = row.row.original.product_image_url || 
                        row.row.original.product_image_secureUrl || 
                        row.row.original.product_image_optimizedUrl;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Product"
            className="w-12 h-12 rounded-sm object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-sm bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        );
      },
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 100,
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 200,
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 120,
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: (row) => row.getValue() || "N/A",
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 150,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (row) => `$${(row.getValue() as number).toFixed(2)}`,
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 100,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: (row) => {
        const stock = row.getValue() as number;
        const minStock = row.row.original.minStock || 0;
        return (
          <span
            className={stock <= minStock ? "text-red-600 font-semibold" : ""}
          >
            {stock}
          </span>
        );
      },
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 80,
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 80,
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/edit/${row.row.original.id}`);
            }}
          >
            <Pencil className="w-4 h-4 text-blue-500" aria-label="Edit" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.row.original.id as string);
            }}
            disabled={deletingRowId !== null}
          >
            {deletingRowId === row.row.original.id ? (
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
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
    const response = await deleteProduct({ id });
    setIsDeleting(false);
    setDeletingRowId(null);
    if (response.error) {
      toast.error("Error deleting product", toastConfig.error);
    } else {
      toast.success("Product deleted successfully", toastConfig.success);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetProductsQuery({});

  useEffect(() => {
    setPageTitle("Products");
  }, []);

  // Extract data array from API response
  const products = data?.data || [];

  return (
    <div>
      <ToastContainer />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search products..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => navigate("/products/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          isError={isError}
          error={error}
          globalFilter={globalFilter}
          emptyMessage="No products found. Click 'Add Product' to create one."
        />
      </div>
    </div>
  );
}

export default Products;