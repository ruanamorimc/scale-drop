import {
  CheckCircle,
  Truck,
  Clock,
  Package,
  XCircle,
  AlertCircle,
  Wrench,
  Users,
  Server,
  Megaphone,
  Tag,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definimos os status possíveis (Baseado no seu Enum)
type StatusType =
  | "pending"
  | "processing"
  | "delivered"
  | "failed"
  | "in_transit"
  | "shipped";

interface StatusBadgeProps {
  status: string; // Vem como string do banco/enum
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Mapa de Configuração: Ícone e Texto para cada status
  const statusConfig: Record<
    string,
    { label: string; icon: React.ReactNode; className?: string }
  > = {
    pending: {
      label: "Pendente",
      icon: <Clock size={14} />,
      className:
        "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    processing: {
      label: "Processando",
      icon: <Package size={14} />,
      className:
        "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    shipped: {
      label: "Enviado",
      icon: <Truck size={14} />,
      className:
        "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    },
    in_transit: {
      label: "Em Trânsito",
      icon: <Truck size={14} />,
      className:
        "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400",
    },
    delivered: {
      label: "Entregue",
      icon: <CheckCircle size={14} />,
      // Estilo da Imagem 2 (Branco/Preto clean)
      className:
        "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    },
    failed: {
      label: "Falhou",
      icon: <XCircle size={14} />,
      className: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    },
    // --- NOVAS CATEGORIAS DE DESPESA ---
    ferramentas: {
      label: "Ferramentas",
      icon: <Wrench size={14} />,
      className:
        "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    equipe: {
      label: "Equipe",
      icon: <Users size={14} />,
      className:
        "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    },
    infra: {
      label: "Infraestrutura",
      icon: <Server size={14} />,
      className:
        "text-slate-600 bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400",
    },
    marketing: {
      label: "Marketing",
      icon: <Megaphone size={14} />,
      className:
        "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400",
    },
    impostos: {
      label: "Impostos",
      icon: <Tag size={14} />,
      className:
        "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    },
    outros: {
      label: "Outros",
      icon: <HelpCircle size={14} />,
      className:
        "text-gray-600 bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400",
    },
  };

  // Pega a config ou usa um default
  const config = statusConfig[status.toLowerCase()] || {
    label: status,
    icon: <AlertCircle size={14} />,
    className: "text-gray-500 bg-gray-100",
  };

  return (
    <div
      className={cn(
        "flex w-fit items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        // Estilo base do Badge (Pode ajustar para ficar igual a foto: bg-white text-black)
        // Aqui estou usando cores suaves semânticas, mas se quiser IGUAL a foto (tudo branco):
        // "bg-white text-neutral-950 border border-neutral-200"
        config.className,
      )}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
