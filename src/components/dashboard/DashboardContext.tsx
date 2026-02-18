"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface DashboardContextType {
  isValuesVisible: boolean;
  toggleVisibility: () => void;
  selectedProduct: string | null;
  setSelectedProduct: (id: string | null) => void;
  lastUpdated: Date;
  refreshData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // 1. Estado de Visibilidade (Olho) - Persiste no localStorage se quiser
  const [isValuesVisible, setIsValuesVisible] = useState(true);
  
  // 2. Estado do Produto Selecionado
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // 3. Estado de Última Atualização
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const toggleVisibility = () => setIsValuesVisible((prev) => !prev);

  const refreshData = () => {
    setLastUpdated(new Date());
    // Aqui você pode adicionar lógica extra se precisar forçar refetch manual
  };

  return (
    <DashboardContext.Provider
      value={{
        isValuesVisible,
        toggleVisibility,
        selectedProduct,
        setSelectedProduct,
        lastUpdated,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
};