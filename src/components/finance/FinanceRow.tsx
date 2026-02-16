import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FinanceRowProps {
  label: string;
  icon?: LucideIcon;
  value: number; // Valor em dinheiro
  count?: number; // Quantidade (Opcional, ex: "13 | ...")
  isNegative?: boolean;
  isTotal?: boolean;
  className?: string;
  subLabel?: string; // Para casos especiais
}

export function FinanceRow({ label, icon: Icon, value, count, isNegative, isTotal, className, subLabel }: FinanceRowProps) {
  const formattedValue = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  
  return (
    <div className={cn("flex items-center justify-between py-2.5 border-b border-border/50 last:border-0", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-muted-foreground" />}
        <span className={cn("text-sm text-muted-foreground font-medium", isTotal && "text-foreground font-bold text-base")}>
          {label}
        </span>
      </div>
      
      <div className="text-right flex items-center gap-2">
        {/* Se tiver contagem, mostra "13 | " em cinza */}
        {count !== undefined && (
            <span className="text-xs text-muted-foreground/70 font-mono">
                {count} <span className="mx-0.5">|</span>
            </span>
        )}
        
        <div className="flex flex-col items-end">
            <span className={cn(
              "font-medium text-sm", 
              isTotal && "text-base",
              isNegative && "text-red-500 dark:text-red-400", // Valores negativos em vermelho
              isTotal && !isNegative && "text-emerald-500 dark:text-emerald-400" // Lucro verde
            )}>
              {isNegative && "- "}{formattedValue}
            </span>
            {subLabel && <span className="text-[10px] text-muted-foreground">{subLabel}</span>}
        </div>
      </div>
    </div>
  );
}