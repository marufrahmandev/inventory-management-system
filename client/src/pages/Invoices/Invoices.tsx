import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { Invoice } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
} from "../../state/invoices/invoiceSlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash, Eye } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

function Invoices() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [deleteInvoice] = useDeleteInvoiceMutation();

  const columns: ColumnDef<Invoice>[] = [
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
      accessorKey: "invoiceNumber",
      header: "Invoice #",
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
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      cell: (row) => new Date(row.getValue() as string).toLocaleDateString(),
      size: 120,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: (row) => {
        const dueDate = row.getValue() as string | null;
        return dueDate ? new Date(dueDate).toLocaleDateString() : "N/A";
      },
      size: 120,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: (row) => `$${(row.getValue() as number).toFixed(2)}`,
      size: 100,
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: (row) => `$${(row.getValue() as number).toFixed(2)}`,
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const status = row.getValue() as string;
        const statusColors: Record<string, string> = {
          paid: "bg-green-100 text-green-800",
          unpaid: "bg-red-100 text-red-800",
          partial: "bg-yellow-100 text-yellow-800",
          overdue: "bg-red-200 text-red-900",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-sm ${statusColors[status] || ""}`}
          >
            {status}
          </span>
        );
      },
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
              navigate(`/invoices/view/${row.row.original.id}`);
            }}
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/invoices/edit/${row.row.original.id}`);
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
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    
    setDeletingRowId(id);
    const response = await deleteInvoice({ id });
    setDeletingRowId(null);
    
    if (response.error) {
      toast.error("Error deleting invoice", toastConfig.error);
    } else {
      toast.success("Invoice deleted successfully", toastConfig.success);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetInvoicesQuery({});

  useEffect(() => {
    setPageTitle("Invoices");
  }, []);

  // Extract data array from API response
  const invoices = data?.data || [];

  return (
    <div>
      <ToastContainer />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search invoices..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => navigate("/invoices/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={invoices}
          isLoading={isLoading}
          isError={isError}
          error={error}
          globalFilter={globalFilter}
          emptyMessage="No invoices found. Click 'Add Invoice' to create one."
        />
      </div>
    </div>
  );
}

export default Invoices;

