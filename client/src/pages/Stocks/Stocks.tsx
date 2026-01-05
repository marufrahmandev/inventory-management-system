import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { Stock } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import {
  useGetStocksQuery,
  useDeleteStockMutation,
} from "../../state/stocks/stockSlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

function Stocks() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [deleteStock] = useDeleteStockMutation();

  const columns: ColumnDef<Stock>[] = [
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
      accessorKey: "productName",
      header: "Product",
      cell: (row) => row.getValue() || "N/A",
      size: 200,
    },
    {
      accessorKey: "productSku",
      header: "SKU",
      cell: (row) => row.getValue() || "N/A",
      size: 120,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: (row) => row.getValue(),
      size: 100,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: (row) => row.getValue() || "N/A",
      size: 150,
    },
    {
      accessorKey: "warehouseSection",
      header: "Section",
      cell: (row) => row.getValue() || "N/A",
      size: 120,
    },
    {
      accessorKey: "batchNumber",
      header: "Batch #",
      cell: (row) => row.getValue() || "N/A",
      size: 120,
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: (row) => {
        const expiry = row.getValue() as string | null;
        return expiry ? new Date(expiry).toLocaleDateString() : "N/A";
      },
      size: 120,
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/stocks/edit/${row.row.original.id}`);
            }}
            title="Edit"
          >
            <Pencil className="w-4 h-4 text-blue-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.row.original.id);
            }}
            disabled={deletingRowId !== null}
            title="Delete"
          >
            {deletingRowId === row.row.original.id ? (
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
            ) : (
              <Trash className="w-4 h-4 text-red-500" />
            )}
          </button>
        </div>
      ),
      size: 100,
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stock record?")) return;
    
    setDeletingRowId(id);
    const response = await deleteStock({ id });
    setDeletingRowId(null);
    
    if (response.error) {
      toast.error("Error deleting stock", toastConfig.error);
    } else {
      toast.success("Stock deleted successfully", toastConfig.success);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetStocksQuery({});

  useEffect(() => {
    setPageTitle("Stock Management");
  }, []);

  // Extract data array from API response
  const stocks = data?.data || [];

  return (
    <div>
      <ToastContainer />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search stocks..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => navigate("/stocks/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Stock
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={stocks}
          isLoading={isLoading}
          isError={isError}
          error={error}
          globalFilter={globalFilter}
          emptyMessage="No stock records found. Click 'Add Stock' to create one."
        />
      </div>
    </div>
  );
}

export default Stocks;

