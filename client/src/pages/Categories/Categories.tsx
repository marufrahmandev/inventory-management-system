import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { Category } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import { useDeleteCategoryMutation, useGetCategoriesQuery } from "../../state/categories/categorySlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Loader2, Pencil, Plus, Trash } from 'lucide-react';
import { useNavigate } from "react-router";
import { Bounce, ToastContainer, toast } from 'react-toastify';

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
      accessorKey: "optimizedImageUrl",
      header: "Image",
      cell: (row) => row.getValue()?<img src={row.getValue() as string} alt="Category Image" className="w-10 h-10 rounded-sm" />:<div className="w-10 h-10 rounded-sm bg-gray-200"></div>,
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
    console.log("id in handleDelete", id);
    const response = await deleteCategory({ id });
    setIsDeleting(false);
    setDeletingRowId(null);
    console.log("response in handleDelete", response);
    if(response.error){
      toast.error("Error in deleting category", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }else{
      toast.success("Category deleted successfully", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  };

  const {
    data = [] as Category[],
    isLoading,
    isError,
    error,
  } = useGetCategoriesQuery({});

  useEffect(() => {
    setPageTitle("Categories");

  }, []);
  return (
    <div>
      <div className="flex justify-between gap-2 action_container">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="global-filter-input"
          placeholder="Search..."
        />

        
        <button
          type="submit"
          className="action_btn"
          onClick={() => navigate("/categories/add")}
        >
          <Plus className="w-6 h-6" />
          Add Category
        </button>

      </div>

    
 
      <TanstackTable
        columns={columns}
        data={data}
        isLoading={isLoading }
        isError={isError}
        error={error}
        globalFilter={globalFilter}
      />
      <ToastContainer />
    </div>
  );
}

export default Categories;
