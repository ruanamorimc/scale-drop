import { Separator } from "@/components/ui/separator";
import { IntegrationsList } from "@/components/settings/IntegrationList";

export default function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrações</h3>
        <p className="text-sm text-muted-foreground">
          Conecte suas lojas externas para sincronizar pedidos.
        </p>
      </div>
      <Separator />
      <IntegrationsList />
    </div>
  );
}
