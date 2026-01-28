"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function activateAccess() {
      try {
        const res = await fetch("/api/subscription/refresh", {
          method: "POST",
        });

        if (!res.ok) {
          // Se não conseguiu ativar, manda de volta pros planos
          router.replace("/plans");
          return;
        }

        // Tudo certo → dashboard
        router.replace("/dashboard");
      } catch (error) {
        console.error("Erro ao ativar assinatura:", error);
        router.replace("/plans");
      }
    }

    activateAccess();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Ativando sua conta, aguarde...</p>
    </div>
  );
}
