"use client";

import * as React from "react";
import { format, isSameDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({ date, setDate, className }: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Função para decidir o que escrever no botão
  const getButtonLabel = () => {
    if (!date?.from) return "Selecione um período";

    const today = new Date();
    const from = date.from;
    const to = date.to || date.from;

    // Lógica para os nomes amigáveis
    if (isSameDay(from, today) && isSameDay(to, today)) return "Hoje";
    
    if (isSameDay(from, subDays(today, 1)) && isSameDay(to, subDays(today, 1))) return "Ontem";
    
    if (isSameDay(from, subDays(today, 7)) && isSameDay(to, today)) return "Últimos 7 dias";
    
    if (isSameDay(from, subDays(today, 30)) && isSameDay(to, today)) return "Últimos 30 dias";
    
    if (isSameDay(from, startOfMonth(today)) && isSameDay(to, endOfMonth(today))) return "Este Mês";
    
    if (isSameDay(from, startOfMonth(subMonths(today, 1))) && isSameDay(to, endOfMonth(subMonths(today, 1)))) return "Mês Passado";

    // Se não for nenhum preset, mostra a data formatada
    return `${format(from, "dd/MM/y")} - ${format(to, "dd/MM/y")}`;
  };

  const handlePreset = (preset: string) => {
    const today = new Date();
    switch (preset) {
      case "Hoje": setDate({ from: today, to: today }); break;
      case "Ontem": setDate({ from: subDays(today, 1), to: subDays(today, 1) }); break;
      case "Últimos 7 dias": setDate({ from: subDays(today, 7), to: today }); break;
      case "Últimos 30 dias": setDate({ from: subDays(today, 30), to: today }); break;
      case "Este Mês": setDate({ from: startOfMonth(today), to: endOfMonth(today) }); break;
      case "Mês Passado": setDate({ from: startOfMonth(subMonths(today, 1)), to: endOfMonth(subMonths(today, 1)) }); break;
    }
    setIsOpen(false); // Fecha ao selecionar preset
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-auto justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getButtonLabel()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            <div className="border-r p-2 space-y-1 w-[140px]">
               <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Período</p>
               {["Hoje", "Ontem", "Últimos 7 dias", "Últimos 30 dias", "Este Mês", "Mês Passado"].map((label) => (
                 <Button key={label} variant="ghost" size="sm" className="w-full justify-start text-xs font-normal"
                    onClick={() => handlePreset(label)}
                 >
                    {label}
                 </Button>
               ))}
            </div>
            <div className="p-0">
                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} locale={ptBR} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}