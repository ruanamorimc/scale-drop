import { Separator } from "@/components/ui/separator";
import { BillingSettings } from "@/components/settings/BillingForm";

export default function SettingsBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Planos e Cobrança</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie sua assinatura, veja seu consumo e faça upgrades.
        </p>
      </div>
      <Separator />

      {/* Componente Principal */}
      <BillingSettings />
    </div>
  );
}
