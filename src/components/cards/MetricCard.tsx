import { LucideIcon } from "lucide-react";
import { PremiumCard } from "./PremiumCard"; // Importando o wrapper premium

interface MetricCardProps {
  title: string;
  icon: LucideIcon;

  // Rótulo Principal (Ex: "IDEAL")
  mainLabel?: string;
  mainValue: string | number;

  secondaryLabel?: string;
  secondaryValue?: string | number;
  className?: string;
}

export function MetricCard({
  title,
  icon: Icon,
  mainLabel = "Ideal", // Valor padrão se você não passar nada
  mainValue,
  secondaryLabel,
  secondaryValue,
  className,
}: MetricCardProps) {
  return (
    // Envolvendo com o PremiumCard para manter o efeito "Vidro"
    <PremiumCard className={className}>
      <div className="relative h-full w-full font-sans">
        {/* 1. BORDA LATERAL GRADIENTE (AZUL DA MARCA) */}
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-blue-600 to-transparent z-10" />

        <div className="p-5 pl-7 relative z-20">
          {/* CABEÇALHO: Ícone Duplo + Título */}
          <div className="flex items-center gap-3 mb-4">
            {/* O ÍCONE ESTILIZADO (DUPLA CAMADA) */}
            <div className="relative flex items-center justify-center">
              {/* Camada Externa: Adaptada para light/dark */}
              <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
                {/* Camada Interna: Azul da marca */}
                <div className="p-1.5 rounded-full bg-blue-600 text-white shadow-sm flex items-center justify-center">
                  <Icon size={14} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {title}
            </span>
          </div>

          {/* CONTEÚDO */}
          <div className="space-y-2">
            {/* --- AQUI ESTÁ O FIX: VOLTEI COM O LABEL --- */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">
                {mainLabel}
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {mainValue}
              </h3>
            </div>

            {/* Divisor */}
            <div className="w-full h-px bg-border" />

            {secondaryValue && (
              <div className="flex items-center gap-2 text-xs pt-1">
                <span className="text-muted-foreground font-medium">
                  {secondaryLabel}
                </span>
                <span className="font-bold text-blue-600 bg-blue-100 dark:bg-blue-500/10 px-1.5 py-0.5 rounded text-[10px]">
                  {secondaryValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  );
}
