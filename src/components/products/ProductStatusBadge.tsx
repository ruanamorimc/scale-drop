import { 
  Activity, 
  PauseCircle, 
  Archive, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductStatusBadgeProps {
  status: string;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  
  // Normaliza para lowercase para evitar erros
  const safeStatus = (status || "").toLowerCase();

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    active: {
      label: "Ativo",
      icon: <Activity size={14} />,
      // Claro: text-600 | Escuro: text-400
      className: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900"
    },
    paused: {
      label: "Pausado",
      icon: <PauseCircle size={14} />,
      // Claro: text-600 | Escuro: text-400
      className: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900"
    },
    archived: {
      label: "Arquivado",
      icon: <Archive size={14} />,
      // Claro: text-600 | Escuro: text-400
      className: "text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
    }
  };

  // Fallback caso venha um status desconhecido
  const config = statusConfig[safeStatus] || {
    label: status,
    icon: <AlertCircle size={14} />,
    className: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 border-gray-200"
  };

  return (
    <div
      className={cn(
        "flex w-fit items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium transition-colors border",
        config.className
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}