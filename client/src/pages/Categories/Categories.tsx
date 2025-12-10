import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { Category } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import { useDeleteCategoryMutation, useGetCategoriesQuery } from "../../state/categories/categorySlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Pencil, Plus, Trash } from 'lucide-react';
import { useNavigate } from "react-router";
import { Bounce, ToastContainer, toast } from 'react-toastify';

function Categories() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  console.log("globalFilter in Categories", globalFilter);
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
      accessorKey: "action",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
        <button  onClick={() => navigate(`/categories/edit/${row.row.original.id}`)} >
          <Pencil className="w-4 h-4 text-blue-500" aria-label="Edit" />
        </button>
        <button  onClick={() => handleDelete(row.row.original.id as string)}> 
            <Trash className={`w-4 h-4 text-red-500 ${isDeleting ? "animate-pulse" : ""}`} aria-label="Delete" />
          </button>
        </div>
      ),
      size: 100,
    },
  ];

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    console.log("id in handleDelete", id);
    const response = await deleteCategory({ id });
    setIsDeleting(false);
    console.log("response in handleDelete", response);
    if(response.error){
      return toast.error("Error in deleting category", {
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
      return;
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
      return setTimeout(() => {
        navigate("/categories");
      }, 1500);
    }
  };

  const {
    data = [] as Category[],
    isLoading,
    isError,
    error,
  } = useGetCategoriesQuery({});
  console.log("data in Categories", data);

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
        isLoading={isLoading}
        isError={isError}
        error={error}
        globalFilter={globalFilter}
      />
      <ToastContainer />
    </div>
  );
}

export default Categories;
