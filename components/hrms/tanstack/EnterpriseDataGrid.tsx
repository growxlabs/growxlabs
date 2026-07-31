"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Download, Search } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type EnterpriseDataGridProps<TData extends object> = {
  ariaLabel: string;
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  rowCount: number;
  pagination: PaginationState;
  sorting: SortingState;
  filters: ColumnFiltersState;
  search: string;
  loading?: boolean;
  getRowId: (row: TData) => string;
  onPaginationChange: (value: PaginationState) => void;
  onSortingChange: (value: SortingState) => void;
  onFiltersChange: (value: ColumnFiltersState) => void;
  onSearchChange: (value: string) => void;
  onBulkAction?: (action: string, rows: TData[]) => void;
  exportFileName?: string;
};

export function EnterpriseDataGrid<TData extends object>({
  ariaLabel,
  columns,
  data,
  rowCount,
  pagination,
  sorting,
  filters,
  search,
  loading = false,
  getRowId,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  onSearchChange,
  onBulkAction,
  exportFileName = "export.csv",
}: EnterpriseDataGridProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const resolvedColumns = useMemo<ColumnDef<TData, unknown>[]>(() => [
    {
      id: "select",
      size: 44,
      enableResizing: false,
      enableSorting: false,
      header: ({ table: currentTable }) => (
        <input
          aria-label="Select all visible rows"
          type="checkbox"
          checked={currentTable.getIsAllPageRowsSelected()}
          onChange={currentTable.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          aria-label={`Select row ${row.id}`}
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    ...columns,
  ], [columns]);
  const table = useReactTable({
    data,
    columns: resolvedColumns,
    rowCount,
    getRowId,
    state: { pagination, sorting, columnFilters: filters, rowSelection, columnVisibility, columnPinning },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: (updater) => onPaginationChange(typeof updater === "function" ? updater(pagination) : updater),
    onSortingChange: (updater) => onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater) => onFiltersChange(typeof updater === "function" ? updater(filters) : updater),
    getCoreRowModel: getCoreRowModel(),
  });
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });
  const selectedRows = table.getSelectedRowModel().flatRows.map((row) => row.original);

  function exportCSV() {
    const visible = table.getVisibleLeafColumns();
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const content = [
      visible.map((column) => quote(typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)).join(","),
      ...rows.map((row) => visible.map((column) => quote(row.getValue(column.id))).join(",")),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    link.download = exportFileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <section aria-label={ariaLabel} className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-border px-3">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">Search</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-9 w-full bg-transparent text-sm outline-none"
            placeholder="Search records"
          />
        </label>
        {selectedRows.length > 0 && onBulkAction ? (
          <button className="rounded-lg border border-border px-3 py-2 text-xs" onClick={() => onBulkAction("archive", selectedRows)}>
            Archive {selectedRows.length}
          </button>
        ) : null}
        <details className="relative">
          <summary className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs">Columns</summary>
          <div className="absolute right-0 z-30 mt-2 w-64 space-y-2 rounded-lg border border-border bg-card p-3 shadow-xl">
            {table.getAllLeafColumns().filter((column) => column.id !== "select").map((column) => (
              <div key={column.id} className="flex items-center gap-2 text-xs">
                <label className="flex flex-1 items-center gap-2">
                  <input type="checkbox" checked={column.getIsVisible()} onChange={column.getToggleVisibilityHandler()} />
                  <span className="truncate">{column.id}</span>
                </label>
                <button aria-label={`Pin ${column.id} left`} onClick={() => column.pin(column.getIsPinned() === "left" ? false : "left")}>
                  {column.getIsPinned() === "left" ? "Unpin" : "Pin"}
                </button>
              </div>
            ))}
          </div>
        </details>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs" onClick={exportCSV}>
          <Download className="size-4" aria-hidden /> CSV
        </button>
      </div>

      <div ref={scrollRef} className="max-h-[560px] overflow-auto" role="grid" aria-rowcount={rowCount} aria-busy={loading}>
        <div role="rowgroup" className="sticky top-0 z-20 min-w-max bg-card">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} role="row" className="flex border-b border-border">
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  role="columnheader"
                  aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none"}
                  style={{ width: header.getSize() }}
                  className="relative shrink-0 px-3 py-2 text-left text-xs font-semibold"
                >
                  <button
                    className="w-full text-left"
                    onClick={header.column.getToggleSortingHandler()}
                    disabled={!header.column.getCanSort()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </button>
                  {header.column.getCanResize() ? (
                    <button
                      aria-label={`Resize ${header.column.id} column`}
                      onDoubleClick={() => header.column.resetSize()}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div role="rowgroup" className="relative min-w-max" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                role="row"
                tabIndex={0}
                aria-rowindex={pagination.pageIndex * pagination.pageSize + virtualRow.index + 2}
                aria-selected={row.getIsSelected()}
                onKeyDown={(event) => {
                  if (event.key === " ") {
                    event.preventDefault();
                    row.toggleSelected();
                  }
                }}
                className="absolute left-0 flex border-b border-border/60 outline-none focus:bg-muted/60"
                style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} role="gridcell" style={{ width: cell.column.getSize() }} className="shrink-0 truncate px-3 py-3 text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between p-3 text-xs">
        <span>{rowCount.toLocaleString()} records</span>
        <div className="flex items-center gap-2">
          <button className="rounded border border-border px-2 py-1 disabled:opacity-50" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            Previous
          </button>
          <span>Page {pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</span>
          <button className="rounded border border-border px-2 py-1 disabled:opacity-50" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
