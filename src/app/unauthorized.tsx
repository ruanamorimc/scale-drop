"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UnauthorizedPage() {
  const pathname = usePathname();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-8">
        {/* Bloco de Texto estilo Next.js Default */}
        <div className="flex items-center">
          <h1 className="border-r border-white/20 pr-6 text-2xl font-medium leading-[49px]">
            401
          </h1>
          <div className="ml-6 flex flex-col">
            <h2 className="text-sm font-normal">Acesso não autorizado.</h2>
            <p className="text-xs text-zinc-500">Faça login para continuar.</p>
          </div>
        </div>

        {/* Seu Botão */}
        <Button
          asChild
          variant="secondary" // O variant secondary (branco/cinza) combina melhor com o fundo preto
          className="h-8 px-6 text-xs"
        >
          <Link href={`/login?redirect=${pathname}`}>Entrar</Link>
        </Button>
      </div>
    </main>
  );
}
