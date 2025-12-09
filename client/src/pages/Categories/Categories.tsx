import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import TanstackTable from "../../components/TanstackTable/TanstackTable";
import type { Category } from "../../types";
import type { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "../../components/TanstackTable/IndeterminateCheckbox";
import { useGetCategoriesQuery } from "../../state/categories/categorySlice";
import DebouncedInput from "../../components/TanstackTable/DebouncedInput";
import { Plus } from 'lucide-react';
import { useNavigate } from "react-router";

function Categories() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const [globalFilter, setGlobalFilter] = useState("");
  console.log("globalFilter in Categories", globalFilter);
  const navigate = useNavigate();
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
  ];

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
    </div>
  );
}

export default Categories;
