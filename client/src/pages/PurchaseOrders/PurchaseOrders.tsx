import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { PurchaseOrder } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import {
  useGetPurchaseOrdersQuery,
  useDeletePurchaseOrderMutation,
} from "../../state/purchaseOrders/purchaseOrderSlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash, Eye } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

function PurchaseOrders() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [deletePurchaseOrder] = useDeletePurchaseOrderMutation();

  const columns: ColumnDef<PurchaseOrder>[] = [
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
      accessorKey: "orderNumber",
      header: "PO #",
      cell: (row) => row.getValue(),
      size: 120,
    },
    {
      accessorKey: "supplierName",
      header: "Supplier",
      cell: (row) => row.getValue(),
      size: 180,
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: (row) => new Date(row.getValue() as string).toLocaleDateString(),
      size: 120,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: (row) => `$${(row.getValue() as number).toFixed(2)}`,
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const status = row.getValue() as string;
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          ordered: "bg-blue-100 text-blue-800",
          received: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-sm ${statusColors[status] || ""}`}
          >
            {status}
          </span>
        );
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
              navigate(`/purchase-orders/view/${row.row.original.id}`);
            }}
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/purchase-orders/edit/${row.row.original.id}`);
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
      size: 120,
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this purchase order?")) return;
    
    setDeletingRowId(id);
    const response = await deletePurchaseOrder({ id });
    setDeletingRowId(null);
    
    if (response.error) {
      toast.error("Error deleting purchase order", toastConfig.error);
    } else {
      toast.success("Purchase order deleted successfully", toastConfig.success);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetPurchaseOrdersQuery({});

  useEffect(() => {
    setPageTitle("Purchase Orders");
  }, []);

  // Extract data array from API response
  const purchaseOrders = data?.data || [];

  return (
    <div>
      <ToastContainer />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search purchase orders..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => navigate("/purchase-orders/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={purchaseOrders}
          isLoading={isLoading}
          isError={isError}
          error={error}
          globalFilter={globalFilter}
          emptyMessage="No purchase orders found. Click 'Add Purchase Order' to create one."
        />
      </div>
    </div>
  );
}

export default PurchaseOrders;

