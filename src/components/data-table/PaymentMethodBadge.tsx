import { Badge } from "@/components/ui/badge";
import { CreditCard, Barcode, Coins } from "lucide-react";

export function PaymentMethodBadge({ method }: { method: string }) {
  // Normaliza para evitar erros de Case Sensitive
  const m = method.toLowerCase();
  
  const isPix = m === "pix";
  const isBoleto = m === "boleto";
  const isCard = m.startsWith("card");

  // Configuração visual
  const config = {
    pix: { label: "PIX", className: "border-teal-500/30 text-teal-600 bg-teal-500/10", icon: <Coins size={10} /> },
    boleto: { label: "BOLETO", className: "border-orange-500/30 text-orange-600 bg-orange-500/10", icon: <Barcode size={10} /> },
    card: { 
      // Formata "card_1x" para "1X" ou "CARTÃO 1X"
      label: m.replace("card_", "").toUpperCase() + (m.includes("x") ? "" : "X"), 
      className: "border-blue-500/30 text-blue-600 bg-blue-500/10", 
      icon: <CreditCard size={10} /> 
    },
    default: { label: method, className: "bg-muted", icon: null }
  };

  const style = isPix ? config.pix : isBoleto ? config.boleto : config.card;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 text-[10px] font-bold h-5 px-1.5 ${style.className}`}>
      {style.icon}
      <span>{style.label}</span>
    </Badge>
  );
}