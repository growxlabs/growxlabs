"use client";

import { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  searchPlaceholder?: string;
  onExportCSV?: () => void;
}

export function DataTable({
  columns,
  data,
  searchPlaceholder = "Search records...",
  onExportCSV
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter
  const filteredData = data.filter((row) =>
    columns.some((col) => {
      const val = row[col.key];
      return val && String(val).toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Sort
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9 h-10 bg-white/5 border-white/10 text-white"
          />
        </div>

        {onExportCSV && (
          <Button onClick={onExportCSV} variant="outline" className="h-10 border-white/10 bg-white/5 text-neutral-300 hover:text-white">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left text-[13px] whitespace-nowrap">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-5 py-3 text-[11px] font-medium text-[var(--text-secondary)] ${
                    col.sortable ? "cursor-pointer select-none hover:text-white" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && <ArrowUpDown className="h-3 w-3 text-neutral-500" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-white/[0.01] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-5 py-4 ${col === columns[0] ? "admin-record-name" : ""}`}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-neutral-500 text-xs font-normal">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between text-xs text-neutral-400 px-2 pt-2">
        <span>Showing Page {currentPage} of {totalPages} ({sortedData.length} records)</span>
        <div className="flex gap-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            size="sm"
            variant="outline"
            className="h-8 border-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            size="sm"
            variant="outline"
            className="h-8 border-white/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
