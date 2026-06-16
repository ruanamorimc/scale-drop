"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

// =========================================================
// CONFIGURAÇÃO DOS LINKS DO MENU
// =========================================================
const navItems = [
  {
    label: "A Plataforma",
    href: "#plataforma", // ID que deve estar na seção do BentoGrid
    isExternal: false,
  },
  {
    label: "Funcionalidades",
    href: "#funcionalidades",
    isExternal: false,
  },
  {
    label: "Planos",
    href: "#planos",
    isExternal: false,
  },
  {
    label: "Integrações",
    href: "#integracoes",
    isExternal: false,
  },
  {
    label: "Suporte",
    // Link do WhatsApp com texto pré-pronto
    href: "https://wa.me/558299833829?text=Ol%C3%A1%2C%20estou%20na%20p%C3%A1gina%20do%20Scale%20Drop%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20antes%20de%20assinar!",
    isExternal: true,
  },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-6 px-6 md:px-10 pointer-events-none">
      <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto h-[46px]">
        {/* LOGO ORIGINAL */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -15 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute left-0 flex items-center gap-2 pointer-events-auto"
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-zinc-900 dark:text-white whitespace-nowrap text-lg tracking-tight">
            Scale Drop
          </span>
        </motion.div>

        {/* A PÍLULA CENTRAL */}
        <motion.div
          layout
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="pointer-events-auto flex items-center h-[46px] p-1.5 rounded-full overflow-hidden bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-sm"
        >
          {/* Ícone Miniatura */}
          <AnimatePresence initial={false}>
            {isScrolled && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="flex items-center overflow-hidden whitespace-nowrap"
              >
                <div className="w-6 h-6 bg-indigo-600 rounded-[6px] flex items-center justify-center shrink-0 ml-1">
                  <span className="text-white font-bold text-[10px]">S</span>
                </div>
                <div className="h-4 w-px bg-zinc-200 dark:bg-white/10 mx-3 shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* LINKS CENTRAIS REFATORADOS */}
          <motion.nav layout className="flex items-center gap-1 px-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                // Se for externo (WhatsApp), abre em nova aba. Se não for, usa comportamento normal de âncora.
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className="px-3 py-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>

          {/* Botão Miniatura Sign In */}
          <AnimatePresence initial={false}>
            {isScrolled && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="flex items-center overflow-hidden whitespace-nowrap pl-2"
              >
                <Link
                  href="/login"
                  className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors shadow-sm shrink-0 mr-1"
                >
                  Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* BOTÕES ORIGINAIS (Direita) */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -15 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute right-0 flex items-center gap-6 pointer-events-auto"
        >
          <Link
            href="/login"
            className="text-[14px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="group relative overflow-hidden px-5 py-2 rounded-lg border border-blue-500/50 bg-gradient-to-tr from-blue-600 to-blue-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ease-out hover:border-blue-400 flex items-center justify-center"
          >
            {/* Efeito de Varredura de Luz */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>

            <span className="relative z-10 text-sm font-medium text-white">
              Testar gratuitamente
            </span>
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
