import { useCallback, useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  getSortedRowModel,
  getPaginationRowModel,
  type PaginationState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import TableSkeleton from "./TableSkeleton";

function TanstackTable({
  columns,
  data,
  isLoading,
  isError,
  error,
  globalFilter,
  emptyMessage = "No data found",
}: {
  columns: ColumnDef<any>[];
  data: any[];
  isLoading: boolean;
  isError: boolean;
  error: any;
  globalFilter: string;
  emptyMessage?: string;
}) {


  const [rowSelection, setRowSelection] = useState({});
  const [, setGlobalFilter] = useState(globalFilter);


  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);


  useCallback(() => {
    setGlobalFilter(globalFilter);
  }, [globalFilter]);

  const table = useReactTable({
    defaultColumn: {
      size: 100,
    },
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    columnResizeMode: "onChange",
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableGlobalFilter: true,
  });

  if (isLoading)
    return (
      <TableSkeleton rows={data.length || 20} columns={columns.length || 4} />
    );






  return (
    <div id="table-container" className="space-y-4">

      <table className="table" style={{ width: `${table.getTotalSize()}px` }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ width: `${header.getSize()}px` }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  {header.column.getCanSort() && (
                    <span
                      className="sort-icon"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      &#8645;
                    </span>
                  )}

                  {
                    {
                      asc: " ▼",
                      desc: " ▲",
                    }[header.column.getIsSorted() as "asc" | "desc"]
                  }

                  <div
                    onMouseDown={header.getResizeHandler()} //for desktop
                    onTouchStart={header.getResizeHandler()} //for mobile
                    className={`resizer ${
                      header.column.getIsResizing() ? "isResizing" : ""
                    }`}
                  ></div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={row.getIsSelected() ? "selected" : undefined}
                onClick={row.getToggleSelectedHandler()}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: `${cell.column.getSize()}px`,
                      backgroundColor: "transparent",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination-container">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div>
          <button
            className="border rounded p-1"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>{" "}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>{" "}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>{" "}
          <button
            className="border rounded p-1"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TanstackTable;
