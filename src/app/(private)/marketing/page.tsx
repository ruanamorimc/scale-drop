"use client";

import React, { useState, useEffect } from "react";
import { getMarketingMetrics } from "@/actions/marketing-overview";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFilters } from "@/components/marketing/MarketingFilters";
import MetricsSidebar from "@/components/marketing/MetricsSidebar";
import DashboardGrid from "@/components/marketing/DashboardGrid";

import { DEFAULT_LAYOUT, CARD_SIZES } from "@/constants/dashboard-layout";

// 🔥 1. TIPAGENS RIGOROSAS (Adeus "any")
export type LayoutItem = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type DefaultLayoutItem = {
  id?: string;
  i?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
};

type FilterOptionItem = {
  id: string;
  name: string | null;
};

type AdAccountItem = {
  accountId: string;
  name: string | null;
};

const STORAGE_KEY = "scaledrop.dashboard.layout.v2";

export default function MarketingPage() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showValues, setShowValues] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: session, isPending } = authClient.useSession();
  const [gridKey, setGridKey] = useState(0);

  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [draftLayout, setDraftLayout] = useState<LayoutItem[]>([]);

  const [metricsData, setMetricsData] = useState<Record<
    string,
    unknown
  > | null>(null);

  // 🔥 2. ESTADOS DOS FILTROS CORRIGIDOS
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // A conta agora é um Array de strings, perfeito para o Multi-Select!
  const [conta, setConta] = useState<string[]>(["all"]);
  const [fonte, setFonte] = useState("qualquer");
  const [plataforma, setPlataforma] = useState("qualquer");
  const [produto, setProduto] = useState("qualquer");

  // Estado para as listas dinâmicas do banco sem "any"
  const [filterOptions, setFilterOptions] = useState({
    adAccounts: [] as AdAccountItem[],
    sources: [] as FilterOptionItem[],
    products: [] as FilterOptionItem[],
    platforms: [] as FilterOptionItem[],
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const currentUser = {
    name: session?.user?.name || (isPending ? "Carregando..." : "Usuário"),
    email: session?.user?.email || "",
    image: session?.user?.image || "",
  };

  const handleUpdateAPI = async (manual = false) => {
    try {
      const data = await getMarketingMetrics(date?.from, date?.to, {
        account: conta.join(","), // Converte o array em uma única string
        source: fonte,
        platform: plataforma,
        product: produto,
      });

      if (data) {
        setMetricsData(data);
        if (data.filterOptions) {
          setFilterOptions(data.filterOptions);
        }
        setLastUpdated(new Date());
        if (manual) toast.success("Métricas atualizadas com sucesso!");
      } else {
        toast.error("Erro ao buscar dados do servidor.");
      }
    } catch (error) {
      console.error("Erro na API:", error);
      toast.error("Falha de comunicação com o banco de dados.");
    }
  };

  useEffect(() => {
    setMounted(true);
    handleUpdateAPI(false);

    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length > 0) {
          setLayout(parsed);
          setDraftLayout(parsed);
          return;
        }
      } catch (e) {
        console.error("Erro ao ler layout:", e);
      }
    }

    // 🔥 MAP sem "any", usando a tipagem DefaultLayoutItem
    const safeDefaultLayout = DEFAULT_LAYOUT.map((item: DefaultLayoutItem) => {
      const id = item.id || item.i || "";
      const sizeConfig = CARD_SIZES ? CARD_SIZES[id] : null;
      return {
        id,
        x: item.x,
        y: item.y,
        w: item.w ?? sizeConfig?.w ?? 3,
        h: item.h ?? sizeConfig?.h ?? 2,
      };
    });

    setLayout(safeDefaultLayout);
    setDraftLayout(safeDefaultLayout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mounted) {
      handleUpdateAPI(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, conta, fonte, plataforma, produto]);

  useEffect(() => {
    if (isEditing) {
      const state = localStorage.getItem("scaleDrop_sidebarState");
      if (state !== null) {
        setIsSidebarOpen(state === "true");
      }
    }
  }, [isEditing]);

  const handleSave = () => {
    setLayout(draftLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftLayout));
    setIsEditing(false);
    setGridKey((prev) => prev + 1);
    toast.success("Dashboard salvo com sucesso!");
  };

  const handleCancel = () => {
    setDraftLayout([...layout]);
    setIsEditing(false);
    setGridKey((prev) => prev + 1);
  };

  const handleReset = () => {
    const safeDefaultLayout = DEFAULT_LAYOUT.map((item: DefaultLayoutItem) => {
      const id = item.id || item.i || "";
      const sizeConfig = CARD_SIZES ? CARD_SIZES[id] : null;
      return {
        id,
        x: item.x,
        y: item.y,
        w: item.w ?? sizeConfig?.w ?? 3,
        h: item.h ?? sizeConfig?.h ?? 2,
      };
    });

    setLayout(safeDefaultLayout);
    setDraftLayout(safeDefaultLayout);
    localStorage.removeItem(STORAGE_KEY);
    setGridKey((prev) => prev + 1);

    toast.info("Dashboard redefinido para o padrão!");
  };

  if (!mounted) return <div className="h-screen w-full bg-background" />;

  return (
    <div className="flex h-screen w-full overflow-hidden relative transition-colors duration-300">
      {isEditing && (
        <MetricsSidebar activeMetrics={draftLayout.map((l) => l.id)} />
      )}

      <div
        className={cn(
          "flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative transition-all duration-0",
          isEditing && !isSidebarOpen ? "pl-[180px]" : "pl-0",
        )}
      >
        <div className="sticky top-0 z-50 w-full px-6 pt-6">
          <MarketingHeader
            isEditing={isEditing}
            setIsEditing={(val) => {
              if (!val) handleCancel();
              else {
                setDraftLayout([...layout]);
                setIsEditing(true);
              }
            }}
            showValues={showValues}
            setShowValues={setShowValues}
            user={currentUser}
            onSave={handleSave}
            onReset={handleReset}
            currentRevenue={Number(metricsData?.allTimeTrackedRevenue || 0)}
          />
        </div>

        <div className="px-6 pt-6 pb-4">
          <MarketingFilters
            date={date}
            setDate={setDate}
            conta={conta}
            setConta={setConta}
            fonte={fonte}
            setFonte={setFonte}
            plataforma={plataforma}
            setPlataforma={setPlataforma}
            produto={produto}
            setProduto={setProduto}
            onUpdate={() => handleUpdateAPI(true)}
            lastUpdated={lastUpdated}
            filterOptions={filterOptions}
          />
        </div>

        <div className="flex-1 px-6">
          <DashboardGrid
            key={gridKey}
            layout={draftLayout}
            isEditing={isEditing}
            onChangeLayout={(newLayout) => {
              setDraftLayout(newLayout as LayoutItem[]);
            }}
            showValues={showValues}
            data={metricsData}
          />
        </div>
      </div>
    </div>
  );
}
