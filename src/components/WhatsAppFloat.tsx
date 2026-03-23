"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface WhatsAppFloatProps {
  userEmail?: string;
  phoneNumber?: string;
}

export function WhatsAppFloat({
  userEmail = "usuario@exemplo.com",
  phoneNumber = "558299833829",
}: WhatsAppFloatProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Agora verificamos no sessionStorage (memória da aba/sessão atual)
    // Mudei o nome da chave para garantir que apareça agora para você testar
    const isHidden = sessionStorage.getItem("whatsapp_session_closed");

    if (!isHidden) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVisible(false);
    // Salva apenas na sessão atual. Se fechar o navegador, isso apaga.
    sessionStorage.setItem("whatsapp_session_closed", "true");
  };

  if (!isVisible) return null;

  const message = encodeURIComponent(
    `Olá, preciso de uma ajuda na conta cadastrada com o e-mail: ${userEmail}`,
  );

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end group animate-in slide-in-from-bottom-4 duration-700">
      {/* Botão de Fechar */}
      <button
        onClick={handleClose}
        className="mb-2 mr-1 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
        title="Fechar chat por enquanto"
      >
        <X size={14} />
      </button>

      {/* Botão Principal */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-[0_4px_14px_rgba(37,211,102,0.4)] transition-transform hover:scale-105 active:scale-95"
      >
        <div className="relative h-8 w-8">
          <Image
            src="/logos/whatsapp-logo.png"
            alt="WhatsApp"
            fill
            className="object-contain"
          />
        </div>

        {/* Badge */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm border border-[#09090b]">
          1
        </span>

        {/* Animação */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-20 animate-ping -z-10"></span>
      </a>
    </div>
  );
}
