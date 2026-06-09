import { Badge } from "@/components/ui/badge";
import { CreditCard, Barcode } from "lucide-react";

const PixIcon = ({ size = 14 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    fill="currentColor"
  >
    {/* O caminho exato (path) copiado lá do site do FontAwesome: */}
    <path d="M242.4 292.5c5.4-5.4 14.7-5.4 20.1 0l77 77c14.2 14.2 33.1 22 53.1 22l15.1 0-97.1 97.1c-30.3 29.5-79.5 29.5-109.8 0l-97.5-97.4 9.3 0c20 0 38.9-7.8 53.1-22l76.7-76.7zm20.1-73.6c-6.4 5.5-14.6 5.6-20.1 0l-76.7-76.7c-14.2-15.1-33.1-22-53.1-22l-9.3 0 97.4-97.4c30.4-30.3 79.6-30.3 109.9 0l97.2 97.1-15.2 0c-20 0-38.9 7.8-53.1 22l-77 77zM112.6 142.7c13.8 0 26.5 5.6 37.1 15.4l76.7 76.7c7.2 6.3 16.6 10.8 26.1 10.8 9.4 0 18.8-4.5 26-10.8l77-77c9.8-9.7 23.3-15.3 37.1-15.3l37.7 0 58.3 58.3c30.3 30.3 30.3 79.5 0 109.8l-58.3 58.3-37.7 0c-13.8 0-27.3-5.6-37.1-15.4l-77-77c-13.9-13.9-38.2-13.9-52.1 .1l-76.7 76.6c-10.6 9.8-23.3 15.4-37.1 15.4l-31.8 0-58-58c-30.3-30.3-30.3-79.5 0-109.8l58-58.1 31.8 0z"/>
  </svg>
);

export function PaymentMethodBadge({ method }: { method: string }) {
  // Normaliza para evitar erros de Case Sensitive
  const m = method.toLowerCase();

  const isPix = m === "pix";
  const isBoleto = m === "boleto";
  const isCard =
    m.includes("card") || m.includes("cartão") || m.includes("cartao");

  // Configuração visual
  const config = {
    pix: {
      label: "Pix",
      className: "border-teal-500/30 text-teal-600 bg-teal-500/10",
      icon: <PixIcon size={10} />,
    },
    boleto: {
      label: "Boleto",
      className: "border-orange-500/30 text-orange-600 bg-orange-500/10",
      icon: <Barcode size={10} />,
    },
    credit_card: {
      label: "Cartão de Crédito",
      className: "border-blue-500/30 text-blue-600 bg-blue-500/10",
      icon: <CreditCard size={14} />,
    },
    default: { label: method, className: "bg-muted", icon: null },
  };

  const style = isPix
    ? config.pix
    : isBoleto
      ? config.boleto
      : isCard
        ? config.credit_card
        : config.default;

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 text-[10px] font-bold h-5 px-1.5 ${style.className}`}
    >
      {style.icon}
      <span>{style.label}</span>
    </Badge>
  );
}
