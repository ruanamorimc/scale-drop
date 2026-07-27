"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Percent,
  Barcode,
  Target,
  MousePointerClick,
  Activity, // Importei Activity para o ícone da taxa
} from "lucide-react";
import { MetricCard } from "@/components/cards/MetricCard";
import { PremiumCard } from "@/components/cards/PremiumCard";
import { MarkupModal } from "@/components/modals/MarkupModal";
import { cn } from "@/lib/utils";

const useCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export default function CalculatorPage() {
  // --- INPUTS ---
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [conversionRate, setConversionRate] = useState<number | "">(1.5); // NOVO: Taxa de Conversão

  // Taxas
  const [taxRate, setTaxRate] = useState<number | "">(10);
  const [gatewayRate, setGatewayRate] = useState<number | "">(5.99);
  const [gatewayFixed, setGatewayFixed] = useState<number | "">(1.0);
  const [checkoutFee, setCheckoutFee] = useState<number | "">(2.5);
  const [iofRate, setIofRate] = useState<number | "">(0.38);
  const [discount, setDiscount] = useState<number | "">("");

  // --- CÁLCULOS ---
  const val = (v: number | "") => (v === "" ? 0 : v);
  const sale = val(salePrice);
  const cost = val(costPrice);
  const cvr = val(conversionRate); // Valor da taxa

  // Conversões (Mantidas fixas para funil, mas CPC usa a taxa do input)
  const icToSaleRate = 0.25;
  const atcToIcRate = 0.33;
  const icPerSale = 1 / icToSaleRate;
  const atcPerIc = 1 / atcToIcRate;

  const taxValue = sale * (val(taxRate) / 100);
  const gatewayValue = sale * (val(gatewayRate) / 100) + val(gatewayFixed);
  const checkoutValue = sale * (val(checkoutFee) / 100);
  const iofValue = cost * (val(iofRate) / 100);

  const totalFixedCosts =
    taxValue + gatewayValue + checkoutValue + iofValue + val(discount);

  // Lucro Bruto
  const grossProfit = sale - cost - totalFixedCosts;

  // Métricas (Com Math.max para evitar negativos)
  // ===== CPA =====
  const cpaBreakEven = Math.max(0, grossProfit); // Teto
  const cpaIdeal = Math.max(0, cpaBreakEven * 0.7); // Meta 70%

  // ===== CPC (NOVO CÁLCULO) =====
  // CPC = CPA * (Taxa / 100)
  const cpcMax = cpaBreakEven * (cvr / 100);
  const cpcIdeal = cpaIdeal * (cvr / 100);

  // ===== ROAS =====
  const roasBreakEven = cpaBreakEven > 0 ? sale / cpaBreakEven : 0;
  const roasIdeal = cpaIdeal > 0 ? sale / cpaIdeal : 0;

  // ===== IC =====
  const icMax = cpaBreakEven / icPerSale;
  const icIdeal = cpaIdeal / icPerSale;

  // ===== ADD TO CART =====
  const atcMax = icMax / atcPerIc;
  const atcIdeal = icIdeal / atcPerIc;

  // Cenários
  const dailyScenarios = [1, 3, 5, 10, 15, 25, 35, 100];
  const monthlyScenarios = [30, 90, 150, 300, 450, 750, 1050, 3000];

  const inputStyle =
    "pl-8 md:pl-10 bg-background/50 dark:bg-black/20 border-border/50 dark:border-white/5 h-9 md:h-10 text-sm md:text-base transition-colors focus-visible:bg-background";

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Calculadora de Precificação
          </h2>
          <p className="text-muted-foreground">
            Simule a viabilidade do produto e defina suas metas de tráfego.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* === ESQUERDA: INPUTS === */}
        <div className="lg:col-span-1 sticky top-6">
          <PremiumCard>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border/40 dark:border-white/5">
                <div className="relative flex items-center justify-center">
                  <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800/50">
                    <div className="p-1.5 rounded-full bg-blue-600 text-white shadow-sm flex items-center justify-center">
                      <Calculator size={18} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Dados do Produto</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-emerald-600 dark:text-emerald-500 font-bold">
                    Preço de Venda
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                      R$
                    </span>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={salePrice}
                      onChange={(e) =>
                        setSalePrice(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className={cn(
                        inputStyle,
                        "text-lg font-bold border-emerald-500/30 focus-visible:ring-emerald-500/50 pl-10",
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Custo do Produto</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                      R$
                    </span>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={costPrice}
                      onChange={(e) =>
                        setCostPrice(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className={cn(inputStyle, "pl-10")}
                    />
                  </div>
                </div>

                <Separator className="bg-border/40 dark:bg-white/5" />

                {/* NOVO INPUT: TAXA DE CONVERSÃO */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-blue-500 font-bold">
                      Taxa de Conversão (Loja)
                    </Label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Média: 1.5%
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.5"
                      value={conversionRate}
                      onChange={(e) =>
                        setConversionRate(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className={cn(
                        inputStyle,
                        "pl-10 border-blue-500/30 focus-visible:ring-blue-500/50",
                      )}
                    />
                    <Activity
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/40 dark:bg-white/5" />

              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Taxas & Impostos
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Imposto",
                      val: taxRate,
                      set: setTaxRate,
                      icon: Percent,
                    },
                    {
                      label: "Gateway (%)",
                      val: gatewayRate,
                      set: setGatewayRate,
                      icon: CreditCard,
                    },
                    {
                      label: "Gateway (R$)",
                      val: gatewayFixed,
                      set: setGatewayFixed,
                      icon: DollarSign,
                    },
                    {
                      label: "Checkout (%)",
                      val: checkoutFee,
                      set: setCheckoutFee,
                      icon: ShoppingCart,
                    },
                    {
                      label: "IOF (%)",
                      val: iofRate,
                      set: setIofRate,
                      icon: TrendingUp,
                    },
                    {
                      label: "Descontos",
                      val: discount,
                      set: setDiscount,
                      icon: Barcode,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        {item.label}
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder="0"
                          className={inputStyle}
                          type="number"
                          value={item.val}
                          onChange={(e) =>
                            item.set(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                        <item.icon
                          size={12}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/30 dark:bg-white/[0.02] border border-border/50 dark:border-white/5 rounded-lg p-4 space-y-3 text-sm transition-colors">
                <div className="flex justify-between text-muted-foreground">
                  <span>Custos Variáveis:</span>{" "}
                  <span className="text-red-500 font-medium">
                    - {useCurrency(totalFixedCosts)}
                  </span>
                </div>
                <Separator className="bg-border/50 dark:bg-white/5" />
                <div className="flex justify-between font-bold text-base items-center">
                  <span>Lucro Bruto (Pré-Ads):</span>
                  <span
                    className={cn(
                      "text-lg",
                      grossProfit > 0
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-500",
                    )}
                  >
                    {useCurrency(grossProfit)}
                  </span>
                </div>
              </div>

              <MarkupModal
                costPrice={val(costPrice)}
                taxRate={val(taxRate)}
                gatewayRate={val(gatewayRate)}
                gatewayFixed={val(gatewayFixed)}
                checkoutFee={val(checkoutFee)}
                iofRate={val(iofRate)}
                discount={val(discount)}
              />
            </div>
          </PremiumCard>
        </div>

        {/* === DIREITA: RESULTADOS === */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grid ajustado para 5 cards para caber o CPC */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <MetricCard
              title="ROAS"
              icon={TrendingUp}
              mainValue={roasIdeal.toFixed(2)}
              secondaryLabel="Break-Even"
              secondaryValue={roasBreakEven.toFixed(2)}
            />
            <MetricCard
              title="CPA"
              icon={Target}
              mainValue={useCurrency(cpaIdeal)}
              secondaryLabel="CPA Máximo"
              secondaryValue={useCurrency(cpaBreakEven)}
            />

            {/* NOVO CARD: CPC */}
            <MetricCard
              title="CPC"
              icon={MousePointerClick}
              mainValue={useCurrency(cpcIdeal)}
              secondaryLabel={`Teto (${cvr}%)`} // Mostra a taxa usada no cálculo
              secondaryValue={useCurrency(cpcMax)}
            />

            <MetricCard
              title="Init. Checkout (IC)"
              icon={CreditCard}
              mainValue={useCurrency(icIdeal)}
              secondaryLabel="Máximo"
              secondaryValue={useCurrency(icMax)}
            />
            <MetricCard
              title="Add to Cart (ATC)"
              icon={ShoppingCart}
              mainValue={useCurrency(atcIdeal)}
              secondaryLabel="Máximo"
              secondaryValue={useCurrency(atcMax)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* PROJEÇÃO DIÁRIA (Mantida detalhada como solicitado) */}
            <PremiumCard>
              <div className="p-0">
                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider">
                      Projeção Diária
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Projeção diária da operação com base na sua estrutura
                      atual de custos e tráfego.
                    </p>
                  </div>
                  <span className="text-[10px] text-foreground bg-white/5 px-2 py-1 rounded">
                    O dia-a-dia da operação
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="w-[50px] text-center text-xs text-muted-foreground">
                          Qtd. Vendas
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-muted-foreground">
                          Faturamento
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-muted-foreground">
                          Produto (CMV)
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-muted-foreground">
                          Taxas Var.
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-muted-foreground">
                          Ads
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-500/5">
                          Lucro Líq.
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium  text-muted-foreground">
                          Margem
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyScenarios.map((qty) => {
                        const rev = qty * sale;
                        const adCost = qty * cpaIdeal;
                        const fees = qty * totalFixedCosts;
                        const prodCost = qty * cost;
                        const profit = rev - adCost - prodCost - fees;
                        const margin = rev > 0 ? (profit / rev) * 100 : 0;
                        return (
                          <TableRow
                            key={qty}
                            className="hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                          >
                            <TableCell className="text-center font-medium text-xs">
                              {qty}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-muted-foreground">
                              {useCurrency(rev)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-red-600 dark:text-red-400">
                              - {useCurrency(prodCost)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-red-600 dark:text-red-400">
                              - {useCurrency(fees)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-blue-600 dark:text-blue-400">
                              {useCurrency(adCost)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-500/5">
                              {useCurrency(profit)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-muted-foreground ">
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

            {/* PROJEÇÃO MENSAL (Mantida detalhada como solicitado) */}
            <PremiumCard>
              <div className="p-0">
                <div className="p-5 border-b border-border/40 dark:border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-2">
                  <div>
                    <h4 className="font-bold text-sm uppercase tracking-wider">
                      Projeção Mensal Detalhada
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Entenda para onde vai o dinheiro em cada nível de escala.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded w-fit">
                    Baseado no CPA Ideal
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/20 dark:bg-white/[0.02]">
                      <TableRow className="hover:bg-transparent border-border/40 dark:border-white/5 text-[10px] md:text-xs tracking-wider">
                        <TableHead className="w-[50px] text-center font-bold text-muted-foreground">
                          Qtd. Vendas
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground font-bold text-xs">
                          Faturamento
                        </TableHead>

                        {/* COLUNAS NOVAS PARA EXPLICAR A CONTA */}
                        <TableHead className="text-right text-muted-foreground">
                          Produto (CMV)
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Taxas Var.
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Ads
                        </TableHead>

                        <TableHead className="text-right font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/5">
                          Lucro Líq.
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Margem
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyScenarios.map((qty) => {
                        const rev = qty * sale;
                        const adCost = qty * cpaIdeal;
                        const fees = qty * totalFixedCosts;
                        const prodCost = qty * cost;
                        const profit = rev - adCost - prodCost - fees;
                        const margin = rev > 0 ? (profit / rev) * 100 : 0;

                        return (
                          <TableRow
                            key={qty}
                            className="hover:bg-muted/30 dark:hover:bg-white/5 border-b border-border/40 dark:border-white/5 last:border-0 transition-colors text-xs md:text-sm"
                          >
                            <TableCell className="text-center text-xs font-medium bg-muted/10">
                              {qty}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-muted-foreground">
                              {useCurrency(rev)}
                            </TableCell>

                            {/* COLUNAS DE CUSTO */}
                            <TableCell className="text-right text-xs font-medium text-muted-foreground text-red-600 dark:text-red-400">
                              - {useCurrency(prodCost)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-muted-foreground text-red-600 dark:text-red-400">
                              - {useCurrency(fees)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-muted-foreground text-blue-600 dark:text-blue-400">
                              {useCurrency(adCost)}
                            </TableCell>

                            <TableCell className="text-right text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-500/5 ">
                              {useCurrency(profit)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-muted-foreground">
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
          </div>
        </div>
      </div>
    </div>
  );
}
