import { useEffect } from 'react'
import { useOutletContext } from 'react-router';
import TanstackTable from '../../components/TanstackTable/TanstackTable';
import type { Product } from '../../types';
import type { ColumnDef } from '@tanstack/react-table';
import IndeterminateCheckbox from '../../components/TanstackTable/IndeterminateCheckbox';
import { useGetProductsQuery } from '../../state/products/productSlice';
function Products() {
  const { setPageTitle } = useOutletContext() as { setPageTitle: (title: string) => void };  

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
      accessorKey: "name",
      header: "Name",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 300,
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 200,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 100,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 100,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (row) => row.getValue(),
      enableColumnFilter: false,
      filterFn: "includesString",
      size: 300,
    },
  ];

  const { data = [] as Product[], isLoading, isError, error } = useGetProductsQuery({});

  useEffect(() => {
    setPageTitle("Products");
  }, []);
  return (
    <div>
    
      <TanstackTable columns={columns} data={data} isLoading={isLoading} isError={isError} error={error} />
    </div>
  )
}

export default Products