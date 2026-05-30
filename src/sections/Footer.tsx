"use client";

import Link from "next/link";
import { Instagram, Youtube, Box } from "lucide-react";

// =========================================================
// DADOS DOS LINKS DO FOOTER
// =========================================================
const footerLinks = {
  produto: [
    { name: "Funcionalidades", href: "#funcionalidades" },
    { name: "Integrações", href: "#integracoes" },
    { name: "Planos", href: "#planos" },
  //  { name: "Changelog", href: "#" },
  ],
  empresa: [
    { name: "Sobre nós", href: "/sobre" },
  //  { name: "Embaixadores", href: "#" },
  //  { name: "Blog", href: "#" },
  ],
  /* recursos: [
    { name: "Suporte", href: "#" },
    { name: "Documentação API", href: "#" },
    { name: "Comunidade", href: "#" },
    { name: "Tutoriais", href: "#" },
  ], 
  */
  legal: [
    { name: "Termos de Serviço", href: "/termos" },
    { name: "Política de Privacidade", href: "/privacidade" },
    // Cookies será embutido na Política de Privacidade
  ],
};

export function Footer() {
  return (
    <footer className="relative w-full border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-[#050505] pt-16 pb-8 z-50">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
          {/* COLUNA 1: LOGO, DESCRIÇÃO E REDES SOCIAIS */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-start">
            <Link
              href="/"
              className="flex items-center gap-2 mb-6 outline-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
                <Box size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                Scale Drop
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mb-8">
              A infraestrutura definitiva para escalar o seu e-commerce com
              máxima precisão, controle e lucro real.
            </p>

            {/* REDES SOCIAIS */}
            <div className="flex items-center gap-5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/558299833829?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20ScaleDrop%20!"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-[#25D366] transition-colors outline-none"
              >
                <span className="sr-only">WhatsApp</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-[#E1306C] transition-colors outline-none"
              >
                <span className="sr-only">Instagram</span>
                <Instagram size={20} strokeWidth={2} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-[#FF0000] transition-colors outline-none"
              >
                <span className="sr-only">YouTube</span>
                <Youtube size={22} strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* COLUNAS DE LINKS */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
              Produto
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.produto.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
              Empresa
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BASE DO FOOTER */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-200 dark:border-white/10 gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            © {new Date().getFullYear()} Scale Drop. Todos os direitos
            reservados.
          </p>

          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group outline-none"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-300 transition-colors">
              Todos os sistemas operacionais
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
