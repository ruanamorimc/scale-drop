import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PremiumCard } from "./PremiumCard";
import { Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkupSimulatorProps {
  costPrice: number;
  taxRate: number;
  gatewayRate: number;
  gatewayFixed: number;
  checkoutFee: number;
  iofRate: number;
  discount: number;
}

const useCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export function MarkupSimulator({
  costPrice,
  taxRate,
  gatewayRate,
  gatewayFixed,
  checkoutFee,
  iofRate,
  discount,
}: MarkupSimulatorProps) {
  
  // Cenários de Markup para simular
  const scenarios = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0];

  return (
    <PremiumCard>
      <div className="p-0">
        {/* Header da Tabela */}
        <div className="p-5 border-b border-border/40 dark:border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Target size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider">
                Simulador de Cenários
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Descubra qual Markup paga o seu tráfego.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-1 rounded w-fit">
            Estratégia de Preço
          </span>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/20 dark:bg-white/[0.02]">
              <TableRow className="hover:bg-transparent border-border/40 dark:border-white/5 text-[10px] md:text-xs uppercase tracking-wider">
                <TableHead className="text-center font-bold w-[80px]">Markup</TableHead>
                <TableHead className="text-right font-bold text-foreground">Preço Sugerido</TableHead>
                <TableHead className="text-right text-muted-foreground">Custos + Taxas</TableHead>
                <TableHead className="text-right font-bold text-emerald-600 dark:text-emerald-500">Lucro Líq.</TableHead>
                <TableHead className="text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5">CPA Teto (Ads)</TableHead>
                <TableHead className="text-right text-muted-foreground">Margem %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((markup) => {
                // Lógica de Cálculo para cada linha
                const suggestedPrice = costPrice * markup;
                
                // Soma das porcentagens de taxas (Imposto + Gateway + Checkout)
                const taxPercent = (taxRate + gatewayRate + checkoutFee) / 100;
                
                // Cálculo dos valores
                const taxValue = suggestedPrice * taxPercent;
                const iofValue = costPrice * (iofRate / 100);
                const totalFees = taxValue + gatewayFixed + iofValue + discount; // Taxas Variáveis + Fixas
                
                // Lucro Bruto = Preço - Custo Produto - Taxas Totais
                const grossProfit = suggestedPrice - costPrice - totalFees;
                
                // O CPA Máximo (Break-even) é exatamente o Lucro Bruto. 
                // Se gastar isso em ads, zera o lucro.
                const maxCPA = grossProfit; 
                
                const margin = suggestedPrice > 0 ? (grossProfit / suggestedPrice) * 100 : 0;

                return (
                  <TableRow
                    key={markup}
                    className="hover:bg-muted/30 dark:hover:bg-white/5 border-b border-border/40 dark:border-white/5 last:border-0 transition-colors text-xs md:text-sm"
                  >
                    {/* Coluna Markup */}
                    <TableCell className="text-center font-bold bg-muted/10">
                      {markup.toFixed(1)}x
                    </TableCell>

                    {/* Preço de Venda */}
                    <TableCell className="text-right font-medium text-foreground">
                      {useCurrency(suggestedPrice)}
                    </TableCell>

                    {/* Custos (Produto + Taxas) */}
                    <TableCell className="text-right text-muted-foreground">
                      - {useCurrency(totalFees + costPrice)}
                    </TableCell>

                    {/* Lucro (Sem Ads) */}
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-500">
                      {useCurrency(grossProfit)}
                    </TableCell>

                    {/* CPA MÁXIMO (A coluna estrela ⭐) */}
                    <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5">
                      {useCurrency(maxCPA)}
                    </TableCell>

                    {/* Margem */}
                    <TableCell className="text-right text-[10px] text-muted-foreground">
                      {margin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </PremiumCard>
  );
}