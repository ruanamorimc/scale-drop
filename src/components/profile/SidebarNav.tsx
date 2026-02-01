"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            // Se a rota for exatamente a atual, deixamos com fundo (ativo)
            pathname === item.href
              ? "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200"
              : "hover:bg-transparent hover:underline",
            "justify-start" // Garante que o texto fique alinhado à esquerda
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}