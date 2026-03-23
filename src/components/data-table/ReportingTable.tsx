"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnResizeMode,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ... (Interface ReportingTableProps mantida igual) ...
interface ReportingTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  enableResizing?: boolean;
  hidePagination?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  classNames?: {
    container?: string;
    headerRow?: string;
    headerCell?: string;
    row?: string;
    cell?: string;
  };
}

export function ReportingTable<TData, TValue>({
  columns,
  data,
  pageSize = 100,
  onRowClick,
  enableResizing = true,
  hidePagination = false,
  onSelectionChange,
  classNames,
}: ReportingTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableColumnResizing: enableResizing,
    columnResizeMode,
    defaultColumn: {
      size: 150,
      minSize: 50,
      maxSize: 800,
    },
    state: {
      sorting,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full bg-background",
        classNames?.container,
      )}
    >
      <div className="flex-1 w-full min-h-0 relative">
        {/* CONTAINER DE SCROLL REAL */}
        <div className="absolute inset-0 overflow-auto custom-scrollbar">
          <Table
            style={{ width: enableResizing ? table.getTotalSize() : "100%" }}
            className={cn(
              enableResizing ? "border-separate border-spacing-0" : "w-full",
            )}
          >
            {/* HEADER STICKY */}
            {/* z-20 garante que fique acima do corpo. sticky top-0 fixa no topo do container overflow-auto */}
            <TableHeader
              className={cn(
                "sticky top-0 z-20 shadow-sm bg-card",
                classNames?.headerRow,
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      className={cn(
                        "h-10 text-[11px] font-bold uppercase text-muted-foreground px-4 whitespace-nowrap bg-card", // bg-card é CRUCIAL
                        "sticky top-0", // Fixa verticalmente
                        "border-r border-border/40 last:border-r-0", // Linhas verticais
                        classNames?.headerCell,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {enableResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-[4px] cursor-col-resize user-select-none touch-action-none z-50 flex justify-center hover:bg-primary/50",
                            header.column.getIsResizing() ? "bg-primary" : "",
                          )}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b border-border hover:bg-muted/50 transition-colors",
                      classNames?.row,
                    )}
                    onClick={() => onRowClick && onRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3 px-4 text-[13px] whitespace-nowrap overflow-hidden text-ellipsis bg-background",
                          "border-r border-border/30 last:border-r-0", // Linhas verticais
                          classNames?.cell,
                        )}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Sem resultados encontrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
