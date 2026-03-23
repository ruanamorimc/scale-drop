"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFilters } from "@/components/marketing/MarketingFilters";
import MetricsSidebar from "@/components/marketing/MetricsSidebar";
import DashboardGrid from "@/components/marketing/DashboardGrid";

import { DEFAULT_LAYOUT, CARD_SIZES } from "@/constants/dashboard-layout";

export type LayoutItem = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const STORAGE_KEY = "scaledrop.dashboard.layout.v2";

export default function MarketingPage() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showValues, setShowValues] = useState(true);

  const { data: session, isPending } = authClient.useSession();
  const [gridKey, setGridKey] = useState(0);

  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [draftLayout, setDraftLayout] = useState<LayoutItem[]>([]);

  // ELEVAÇÃO DE ESTADO DOS FILTROS
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [conta, setConta] = useState("qualquer");
  const [fonte, setFonte] = useState("qualquer");
  const [plataforma, setPlataforma] = useState("qualquer");
  const [produto, setProduto] = useState("qualquer");

  const currentUser = {
    name: session?.user?.name || (isPending ? "Carregando..." : "Usuário"),
    email: session?.user?.email || "",
    image: session?.user?.image || "",
  };

  useEffect(() => {
    setMounted(true);
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

    const safeDefaultLayout = DEFAULT_LAYOUT.map((item: any) => {
      const id = item.id || item.i;
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
  }, []);

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
    const safeDefaultLayout = DEFAULT_LAYOUT.map((item: any) => {
      const id = item.id || item.i;
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

  const handleUpdateAPI = () => {
    toast.success("Dados atualizados com sucesso!");
    console.log("🔥 Enviando para API:", {
      date,
      conta,
      fonte,
      plataforma,
      produto,
    });
  };

  if (!mounted) return <div className="h-screen w-full bg-background" />;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative transition-colors duration-300">
      {isEditing && (
        <div className="w-[300px] h-full shrink-0 z-30 animate-in slide-in-from-left-8 fade-in duration-300 flex items-center">
          <MetricsSidebar activeMetrics={draftLayout.map((l) => l.id)} />
        </div>
      )}

      {/* 🔥 CONTAINER COM SCROLL ATIVO DE PONTA A PONTA */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative">
        {/* 🔥 HEADER FIXO COM EFEITO VIDRO FOSCO (GLASSMORPHISM) */}
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
          />
        </div>

        {/* 🔥 FILTROS LIVRES (Vão rolar junto com os cards) */}
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
            onUpdate={handleUpdateAPI}
          />
        </div>

        {/* GRID DE CARDS */}
        <div className="flex-1 px-6 pb-20">
          <DashboardGrid
            key={gridKey}
            layout={draftLayout}
            isEditing={isEditing}
            onChangeLayout={setDraftLayout}
            showValues={showValues}
          />
        </div>
      </div>
    </div>
  );
}
