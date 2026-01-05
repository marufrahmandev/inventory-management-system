import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { SalesOrder } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import {
  useGetSalesOrdersQuery,
  useDeleteSalesOrderMutation,
} from "../../state/salesOrders/salesOrderSlice";
import { useCreateInvoiceFromSalesOrderMutation } from "../../state/invoices/invoiceSlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash, Eye, FileText } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

function SalesOrders() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [deleteSalesOrder] = useDeleteSalesOrderMutation();
  const [createInvoiceFromSalesOrder] = useCreateInvoiceFromSalesOrderMutation();

  const columns: ColumnDef<SalesOrder>[] = [
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
      header: "Order #",
      cell: (row) => row.getValue(),
      size: 120,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
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
          confirmed: "bg-blue-100 text-blue-800",
          processing: "bg-purple-100 text-purple-800",
          completed: "bg-green-100 text-green-800",
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
      cell: (row) => {
        const order = row.row.original;
        const canGenerateInvoice = (order.status === "confirmed" || order.status === "completed") && !(order as any).hasInvoice;
        
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/sales-orders/view/${order.id}`);
              }}
              title="View"
            >
              <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/sales-orders/edit/${order.id}`);
              }}
              title="Edit"
            >
              <Pencil className="w-4 h-4 text-blue-500 hover:text-blue-700" />
            </button>
            {canGenerateInvoice && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateInvoice(order.id);
                }}
                disabled={generatingInvoiceId !== null}
                title="Generate Invoice"
                className="disabled:opacity-50"
              >
                {generatingInvoiceId === order.id ? (
                  <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 text-green-500 hover:text-green-700" />
                )}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(order.id);
              }}
              disabled={deletingRowId !== null}
              title="Delete"
            >
              {deletingRowId === order.id ? (
                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              ) : (
                <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
              )}
            </button>
          </div>
        );
      },
      size: 150,
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sales order?")) return;
    
    setDeletingRowId(id);
    const response = await deleteSalesOrder({ id });
    setDeletingRowId(null);
    
    if (response.error) {
      const errorMsg = (response.error as any)?.data?.message || "Error deleting sales order";
      toast.error(errorMsg, toastConfig.error);
    } else {
      toast.success("Sales order deleted successfully", toastConfig.success);
    }
  };

  const handleGenerateInvoice = async (salesOrderId: string) => {
    if (!confirm("Generate invoice from this sales order?")) return;
    
    setGeneratingInvoiceId(salesOrderId);
    try {
      const response = await createInvoiceFromSalesOrder(salesOrderId);
      setGeneratingInvoiceId(null);
      
      if (response.error) {
        const errorMsg = (response.error as any)?.data?.message || "Error generating invoice";
        toast.error(errorMsg, toastConfig.error);
      } else {
        toast.success("Invoice generated successfully!", toastConfig.success);
        // Navigate to the generated invoice after a short delay
        setTimeout(() => {
          const invoiceId = (response.data as any)?.data?.id;
          if (invoiceId) {
            navigate(`/invoices/view/${invoiceId}`);
          } else {
            navigate("/invoices");
          }
        }, 1500);
      }
    } catch (error) {
      setGeneratingInvoiceId(null);
      toast.error("Error generating invoice", toastConfig.error);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetSalesOrdersQuery({});

  useEffect(() => {
    setPageTitle("Sales Orders");
  }, []);

  // Extract data array from API response
  const salesOrders = data?.data || [];

  return (
    <div>
      <ToastContainer />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search sales orders..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => navigate("/sales-orders/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Sales Order
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={salesOrders}
          isLoading={isLoading}
          isError={isError}
          error={error}
          globalFilter={globalFilter}
          emptyMessage="No sales orders found. Click 'Add Sales Order' to create one."
        />
      </div>
    </div>
  );
}

export default SalesOrders;

