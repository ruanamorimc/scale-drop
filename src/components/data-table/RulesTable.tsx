"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter } from "lucide-react";

interface RulesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function RulesTable<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
}: RulesTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (updater) => {
      const nextState =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(nextState);

      if (onRowSelectionChange) {
        const selectedIndices = Object.keys(nextState).filter(
          (key) => nextState[key],
        );
        const selectedData = selectedIndices.map((idx) => data[Number(idx)]);
        onRowSelectionChange(selectedData);
      }
    },
    state: {
      rowSelection,
    },
  });

  return (
    <div className="flex-1 overflow-auto bg-transparent relative w-full custom-scrollbar">
      <Table className="w-full text-left text-xs text-muted-foreground">
        <TableHeader className="bg-transparent sticky top-0 z-10 text-[11px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/40 backdrop-blur-md">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent border-b border-border/40"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-10 px-4 py-3 text-muted-foreground font-bold"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-y divide-border/20">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-muted/20 transition-colors group"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground/50 gap-2 p-10">
                  <Filter size={32} strokeWidth={1} />
                  <p className="text-sm font-medium">
                    Nenhuma regra encontrada.
                  </p>
                  <p className="text-xs max-w-xs">
                    Crie sua primeira regra personalizada clicando em &quot;Criar
                    regra&quot; acima.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
