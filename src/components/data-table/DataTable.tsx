"use client";

import React, { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  useReactTable,
  Table as TanstackTable,
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageSize?: number;
  meta?: any;
  onRowClick?: (row: TData) => void;
  toolbar?: (table: TanstackTable<TData>) => React.ReactNode;
  hidePagination?: boolean;
  enableResizing?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  scrollableContainer?: boolean;
  classNames?: {
    container?: string;
    headerRow?: string;
    headerCell?: string;
    row?: string;
    cell?: string;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  meta,
  onRowClick,
  toolbar,
  hidePagination = false,
  enableResizing = false,
  onSelectionChange,
  scrollableContainer = false,
  classNames,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
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
      columnVisibility,
      rowSelection,
    },
    meta: meta,
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
        "flex flex-col w-full bg-background",
        // 🔥 CORREÇÃO: Força altura 100% para ocupar o container pai da página
        scrollableContainer ? "h-full" : "",
        classNames?.container,
      )}
    >
      {toolbar && <div className="shrink-0 mb-3 px-1">{toolbar(table)}</div>}

      <div
        className={cn(
          "border rounded-md border-border w-full",
          // 🔥 CORREÇÃO: Usa flex-1 para expandir e ocupar o espaço restante
          scrollableContainer
            ? "flex flex-col flex-1 min-h-0 overflow-hidden relative"
            : "overflow-auto custom-scrollbar",
        )}
      >
        <div
          className={cn(
            scrollableContainer
              ? "absolute inset-0 overflow-auto custom-scrollbar bg-background"
              : "",
          )}
        >
          <Table
            style={{ width: enableResizing ? table.getTotalSize() : "100%" }}
            className={cn(
              enableResizing ? "border-separate border-spacing-0" : "w-full",
            )}
          >
            <TableHeader className={cn("z-20", classNames?.headerRow)}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className={cn(
                    "border-b border-border hover:bg-transparent",
                    classNames?.headerRow,
                  )}
                >
                  {headerGroup.headers.map((header) => {
                    const isSelect = header.id === "select";
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: isSelect ? "48px" : header.getSize() }}
                        className={cn(
                          "h-10 text-[11px] font-bold uppercase text-muted-foreground tracking-wide px-4 whitespace-nowrap shadow-sm bg-card",
                          scrollableContainer ? "sticky top-0 z-20" : "",
                          enableResizing
                            ? "border-r border-border/50 last:border-r-0"
                            : "",
                          isSelect ? "w-[48px] px-0 text-center" : "",
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
                              "absolute right-0 top-0 h-full w-[5px] cursor-col-resize user-select-none touch-action-none z-30 flex justify-center",
                              "opacity-0 group-hover:opacity-100 transition-opacity",
                              header.column.getIsResizing()
                                ? "opacity-100"
                                : "",
                            )}
                          >
                            <div
                              className={cn(
                                "h-full w-[1px] bg-primary/50",
                                header.column.getIsResizing()
                                  ? "bg-primary w-[2px]"
                                  : "",
                              )}
                            />
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
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
                      "border-b border-border hover:bg-muted/50 transition-colors bg-background",
                      onRowClick ? "cursor-pointer" : "",
                      classNames?.row,
                    )}
                    onClick={() => onRowClick && onRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isSelect = cell.column.id === "select";
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-3 px-4 text-[13px] whitespace-nowrap overflow-hidden text-ellipsis",
                            enableResizing
                              ? "border-r border-border/30 last:border-r-0"
                              : "",
                            isSelect ? "w-[48px] px-0 text-center" : "",
                            classNames?.cell,
                          )}
                          style={{
                            width: isSelect ? "48px" : cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
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

      {!hidePagination && (
        <div className="shrink-0 pt-3 border-t border-border mt-0">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-xs whitespace-nowrap">Linhas:</span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px] bg-background border-border text-xs focus:ring-0">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30, 40, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="hidden sm:inline-block text-xs font-medium">
                {table.getFilteredSelectedRowModel().rows.length}{" "}
                selecionado(s).
              </span>
            </div>

            <div className="flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center justify-center text-xs font-medium text-muted-foreground">
                Pág {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-border hover:bg-muted transition-colors"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 border-border hover:bg-muted transition-colors"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Próxima</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
