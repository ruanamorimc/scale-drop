"use client"

import * as React from "react"
import { 
  format, 
  subDays, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear 
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Estado temporário para segurar a data enquanto o usuário não clica em "Aplicar"
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date)

  // Sincroniza o estado temporário quando a prop date ou o popover mudam
  React.useEffect(() => {
    if (isOpen) {
      setTempDate(date)
    }
  }, [isOpen, date])

  // Filtros rápidos estilo Kirvano
  const presets = [
    { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: "Ontem", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: "Últimos 7 dias", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "Últimos 30 dias", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "Últimos 3 meses", getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
    { label: "Últimos 12 meses", getValue: () => ({ from: subMonths(new Date(), 12), to: new Date() }) },
    { label: "Este mês", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: "Este ano", getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  ]

  const handleApply = () => {
    setDate(tempDate)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempDate(date)
    setIsOpen(false)
  }

  // Formatação para o rodapé do popover (ex: 9 de maio - 8 de junho de 2026)
  const formatFooterDate = (range: DateRange | undefined) => {
    if (!range?.from) return "Selecione uma data"
    if (!range.to) return format(range.from, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    return `${format(range.from, "d 'de' MMMM 'de' yyyy", { locale: ptBR })} - ${format(range.to, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
  }

  return (
    <div className={cn("grid gap-2 w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-background border-input hover:bg-accent/50 transition-colors h-10 px-3",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-2xl rounded-xl border-border overflow-hidden" align="start">
          <div className="flex flex-col sm:flex-row">
            {/* Sidebar de Atalhos (Kirvano Style) */}
            <div className="flex flex-col gap-1 border-r border-border p-3 sm:w-44 w-full bg-muted/10 h-full overflow-y-auto">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className="justify-start text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-3 py-2 h-auto"
                  onClick={() => setTempDate(preset.getValue())}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            {/* Calendário Duplo */}
            <div className="p-3 bg-background flex flex-col">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={tempDate?.from}
                selected={tempDate}
                onSelect={setTempDate}
                numberOfMonths={2}
                locale={ptBR}
              />
              
              {/* Rodapé do Calendário */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground hidden sm:inline-block pl-2">
                  {formatFooterDate(tempDate)}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}