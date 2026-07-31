"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { getActiveMetaAccounts } from "@/actions/meta-actions";
import { getActiveProducts } from "@/actions/products";

export type FilterOption = {
  id: string;
  name: string;
  sku?: string | null;
};

// 1. TIPAGENS (Fim dos 'anys')
interface MetaAccountResponse {
  accountId: string;
  name: string;
}

interface ProductResponse {
  id: string;
  name: string;
  sku: string | null;
}

export function useWorkspaceFilters() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const [accounts, setAccounts] = useState<FilterOption[]>([]);
  const [products, setProducts] = useState<FilterOption[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  useEffect(() => {
    // Se não tiver usuário, não faz nada
    if (!userId) return;

    // 2. Recebendo 'uid' estritamente como string
    async function fetchFilters(uid: string) {
      setIsLoadingFilters(true);
      try {
        const [activeAccounts, activeProducts] = await Promise.all([
          getActiveMetaAccounts(uid),
          getActiveProducts(uid),
        ]);

        // 3. Afirmando o tipo esperado e mapeando sem 'any'
        setAccounts(
          (activeAccounts as MetaAccountResponse[]).map((acc) => ({
            id: acc.accountId,
            name: acc.name,
          })),
        );

        setProducts(
          (activeProducts as ProductResponse[]).map((prod) => ({
            id: prod.id,
            name: prod.name,
            sku: prod.sku,
          })),
        );
      } catch (error) {
        console.error("Erro ao buscar filtros globais:", error);
      } finally {
        setIsLoadingFilters(false);
      }
    }

    // Passa o userId garantido pelo 'if' ali de cima
    fetchFilters(userId);
  }, [userId]);

  return { accounts, products, isLoadingFilters };
}
