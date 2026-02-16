import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PremiumCard({ children, className, contentClassName }: PremiumCardProps) {
  return (
    // 1. WRAPPER DA BORDA GRADIENTE (Adaptável)
    // Light: Borda cinza clara que some.
    // Dark: Borda branca translúcida que some.
    <div className={cn(
      "relative group rounded-xl p-[1px] shadow-sm transition-all hover:shadow-md",
      // Gradiente da borda adaptável
      "bg-gradient-to-b from-border/60 via-border/30 to-transparent dark:from-white/20 dark:via-white/10 dark:to-transparent",
      className
    )}>
      
      {/* 2. CONTEÚDO INTERNO (Fundo "Vidro" Adaptável) */}
      <div className={cn(
        "relative h-full w-full rounded-xl overflow-hidden",
        // Fundo Light: Branco com um leve gradiente cinza no canto
        "bg-background bg-gradient-to-br from-gray-50/50 to-transparent",
        // Fundo Dark: Preto profundo com gradiente zinco
        "dark:bg-zinc-950 dark:from-zinc-900/50 dark:to-black",
        contentClassName
      )}>
        
        {/* Brilho superior sutil (opcional, adaptado para ambos os modos) */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-30 dark:via-white/10" />
        
        {children}
      </div>
    </div>
  );
}