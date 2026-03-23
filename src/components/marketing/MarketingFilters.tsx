"use client";

import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { PremiumCard } from "../cards/PremiumCard";

function FilterItem({ label, children, tooltip, className }: any) {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className || ""}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {tooltip && <Info size={12} className="text-muted-foreground/50" />}
      </div>
      {children}
    </div>
  );
}

// 🔥 AGORA ELE RECEBE TUDO VIA PROPS!
export function MarketingFilters({
  date,
  setDate,
  conta,
  setConta,
  fonte,
  setFonte,
  plataforma,
  setPlataforma,
  produto,
  setProduto,
  onUpdate,
}: any) {
  return (
    <PremiumCard className="w-full shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border gap-4 bg-muted/20">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Resumo</h3>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            Atualizado agora mesmo
          </span>
          <Button
            size="lg"
            onClick={onUpdate}
            className="text-white bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-[0_0_10px_1px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
          >
            Atualizar
          </Button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
        <FilterItem
          label="Período de Visualização"
          tooltip="Selecione o intervalo"
          className="sm:col-span-2 lg:col-span-1"
        >
          <div className="w-full">
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className="w-full"
            />
          </div>
        </FilterItem>
        <FilterItem label="Conta de Anúncio">
          <Select value={conta} onValueChange={setConta}>
            <SelectTrigger className="h-10 w-full border-border bg-background text-foreground focus:ring-0">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualquer">Qualquer</SelectItem>
              <SelectItem value="fb_01">Facebook Ads 01</SelectItem>
              <SelectItem value="google_01">Google Ads 01</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
        <FilterItem label="Fonte de Tráfego">
          <Select value={fonte} onValueChange={setFonte}>
            <SelectTrigger className="h-10 w-full border-border bg-background text-foreground focus:ring-0">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualquer">Qualquer</SelectItem>
              <SelectItem value="meta">Meta Ads</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="tiktok">TikTok Ads</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
        <FilterItem label="Plataforma">
          <Select value={plataforma} onValueChange={setPlataforma}>
            <SelectTrigger className="h-10 w-full border-border bg-background text-foreground focus:ring-0">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualquer">Qualquer</SelectItem>
              <SelectItem value="shopify">Shopify</SelectItem>
              <SelectItem value="woocomerce">WooCommerce</SelectItem>
              <SelectItem value="yampi">Yampi</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
        <FilterItem label="Produto">
          <Select value={produto} onValueChange={setProduto}>
            <SelectTrigger className="h-10 w-full border-border bg-background text-foreground focus:ring-0">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualquer">Qualquer</SelectItem>
              <SelectItem value="prod_a">Corretor Postural</SelectItem>
              <SelectItem value="prod_b">Fone Bluetooth</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
      </div>
    </PremiumCard>
  );
}
