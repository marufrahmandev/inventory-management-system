import { useEffect } from 'react'
import { useOutletContext } from 'react-router';
import TanstackTable from '../../components/TanstackTable/TanstackTable';
import type { Category } from '../../types';
import type { ColumnDef } from '@tanstack/react-table';
import IndeterminateCheckbox from '../../components/TanstackTable/IndeterminateCheckbox';
import { useGetCategoriesQuery } from '../../state/categories/categorySlice';
  
function Categories() { 
  const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();  

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

  const { data = [] as Category[], isLoading, isError, error } = useGetCategoriesQuery({});

  useEffect(() => {
    setPageTitle("Categories");
  }, []);
  return (
    <div>
      <TanstackTable columns={columns} data={data} isLoading={isLoading} isError={isError} error={error} />
    </div>
  )
}

export default Categories