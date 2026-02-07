import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MoreHorizontal, 
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definimos os status possíveis para Pagamento
type PaymentStatusType = "paid" | "pending" | "cancelled" | "refunded";

interface PaymentStatusBadgeProps {
  status?: string; // Vem como string do banco
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const safeStatus = status || "pending";
  
  // Mapa de Configuração: Icone, Texto e Cores para cada status
  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    paid: {
      label: "Pago",
      icon: <CheckCircle2 size={14} />,
      className: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900"
    },
    pending: {
      label: "Pendente",
      icon: <Clock size={14} />,
      className: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900"
    },
    cancelled: {
      label: "Cancelado",
      icon: <XCircle size={14} />,
      className: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900"
    },
    refunded: {
      label: "Reembolsado",
      icon: <MoreHorizontal size={14} />,
      className: "text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
    }
  };

  // Pega a config ou usa um default (safety fallback)
  const config = statusConfig[safeStatus.toLowerCase()] || {
    label: safeStatus,
    icon: <AlertCircle size={14} />,
    className: "text-gray-500 bg-gray-100 border-gray-200"
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