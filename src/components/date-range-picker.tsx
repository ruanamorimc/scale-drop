"use client";

import * as React from "react";
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

// Opções pré-definidas
const PRESETS = [
  {
    label: "Hoje",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Ontem",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: "Últimos 7 dias",
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "Últimos 30 dias",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "Este mês",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: "Mês passado",
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
];

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"presets" | "calendar">("presets");
  const [selectedLabel, setSelectedLabel] = React.useState<string>("Hoje");

  // Resetar a visualização para a lista sempre que abrir o popover
  React.useEffect(() => {
    if (open) {
      setView("presets");
    }
  }, [open]);

  // Função para aplicar um preset
  const handlePresetSelect = (preset: (typeof PRESETS)[number]) => {
    setDate(preset.getValue());
    setSelectedLabel(preset.label);
    setOpen(false);
  };

  // Função para formatar o texto do botão
  const getButtonText = () => {
    if (selectedLabel === "Personalizado" && date?.from) {
      if (date.to) {
        return `${format(date.from, "dd/MM", { locale: ptBR })} - ${format(date.to, "dd/MM", { locale: ptBR })}`;
      }
      return format(date.from, "dd/MM/yyyy", { locale: ptBR });
    }
    return selectedLabel;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-between text-left font-normal h-10 border-border bg-background text-foreground hover:bg-muted/50",
              !date && "text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{getButtonText()}</span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 bg-popover border-border"
          align="start"
        >
          {view === "presets" ? (
            // --- VISUALIZAÇÃO 1: LISTA DE OPÇÕES ---
            <Command className="bg-transparent">
              <CommandList>
                <CommandGroup>
                  {PRESETS.map((preset) => (
                    <CommandItem
                      key={preset.label}
                      onSelect={() => handlePresetSelect(preset)}
                      className="cursor-pointer aria-selected:bg-muted focus:bg-muted data-[disabled]:opacity-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedLabel === preset.label
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {preset.label}
                    </CommandItem>
                  ))}

                  {/* Opção Personalizado -> Leva para o Calendário */}
                  <CommandItem
                    onSelect={() => {
                      setView("calendar");
                      setSelectedLabel("Personalizado");
                    }}
                    className="cursor-pointer aria-selected:bg-muted focus:bg-muted flex justify-between group"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedLabel === "Personalizado"
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      Personalizado
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            // --- VISUALIZAÇÃO 2: CALENDÁRIO ---
            <div className="p-3">
              <div className="flex items-center justify-between mb-4 px-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("presets")}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground -ml-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>
                <span className="text-xs font-semibold text-foreground">
                  Selecionar datas
                </span>
              </div>

              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
                className="rounded-md border border-border bg-background"
              />

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={!date?.from}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
