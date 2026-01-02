import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "../../state/customers/customerSlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function Customers() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const columns: ColumnDef<Customer>[] = [
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
      cell: (info) => info.getValue(),
      size: 200,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => info.getValue() || "-",
      size: 200,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (info) => info.getValue() || "-",
      size: 150,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: (info) => info.getValue() || "-",
      size: 150,
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: (info) => info.getValue() || "-",
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/customers/edit/${row.original.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            disabled={deletingRowId === row.original.id}
            className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
            title="Delete"
          >
            {deletingRowId === row.original.id ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash size={16} />
            )}
          </button>
        </div>
      ),
      size: 100,
    },
  ];

  const {
    data: customers,
    error,
    isLoading,
    refetch,
  } = useGetCustomersQuery();

  useEffect(() => {
    setPageTitle("Customers");
  }, [setPageTitle]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setDeletingRowId(id);
      try {
        const response = await deleteCustomer(id);
        if (!response.error) {
          toast.success("Customer deleted successfully!", toastConfig.success);
          refetch();
        } else {
          const errorMsg = (response.error as any)?.data?.message || "Failed to delete customer";
          toast.error(errorMsg, toastConfig.error);
        }
      } catch (error: any) {
        console.error("Failed to delete customer:", error);
        toast.error(
          error?.data?.message || "Failed to delete customer",
          toastConfig.error
        );
      } finally {
        setDeletingRowId(null);
      }
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search customers..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => navigate("/customers/add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          data={customers?.data || []}
          columns={columns}
          isLoading={isLoading}
          isError={!!error}
          error={error}
          globalFilter={globalFilter}
          emptyMessage="No customers found. Click 'Add Customer' to create one."
        />
      </div>
    </div>
  );
}

export default Customers;

