import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FinanceSummaryItemProps {
  label: string;
  icon?: LucideIcon;
  value: string; // Já vem formatado "R$ 1.000,00"
  count?: number; // O número que fica tipo "31 |"
  subValue?: string; // Para porcentagens ou textos pequenos
  isNegative?: boolean;
  accentColor?: "blue" | "green" | "red" | "yellow" | "purple"; // Para os ícones coloridos
  className?: string;
}

export function FinanceSummaryItem({ 
  label, 
  icon: Icon, 
  value, 
  count, 
  subValue,
  isNegative,
  accentColor = "blue",
  className 
}: FinanceSummaryItemProps) {
  
  // Cores baseadas no seu Figma
  const colors = {
    blue: "text-blue-500",
    green: "text-emerald-500",
    red: "text-red-500",
    yellow: "text-yellow-500",
    purple: "text-purple-500",
  };

  // Se vier como número, formata aqui
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) 
    : value;

  return (
    <div className={cn("flex items-center justify-between py-2 border-b border-border/40 last:border-0", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("p-1.5 rounded-md bg-opacity-10", colors[accentColor].replace("text-", "bg-"))}>
             <Icon size={14} className={colors[accentColor]} />
          </div>
        )}
        <span className="text-sm font-medium text-muted-foreground/90">
          {label}
        </span>
      </div>
      
      <div className="text-right flex items-center gap-2">
        {/* O Count estilo Figma "31 |" */}
        {count !== undefined && (
            <span className="text-xs text-muted-foreground/60 font-mono tracking-tighter">
                {count} <span className="mx-1 opacity-30">|</span>
            </span>
        )}
        
        <div className="flex flex-col items-end">
            <span className={cn(
              "font-semibold text-sm tracking-tight text-foreground", 
              isNegative && "text-red-500",
              // Se tiver subValue (ex: ROI), o valor principal fica maior
              subValue && "text-base" 
            )}>
              {value}
            </span>
            {subValue && <span className={cn("text-[10px]", isNegative ? "text-red-400/80" : "text-emerald-400/80")}>{subValue}</span>}
        </div>
      </div>
    </div>
  );
}