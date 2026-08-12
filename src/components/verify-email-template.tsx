import * as React from "react";

interface VerifyEmailTemplateProps {
  userName: string;
  url: string;
}

export const VerifyEmailTemplate: React.FC<Readonly<VerifyEmailTemplateProps>> = ({
  userName,
  url,
}) => (
  <div style={{ fontFamily: "sans-serif", backgroundColor: "#f4f4f5", padding: "20px" }}>
    <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ backgroundColor: "#09090b", padding: "30px", textAlign: "center" }}>
        <h2 style={{ color: "#3b82f6", margin: "0 0 10px 0" }}>SCALE DROP</h2>
        <h1 style={{ color: "#ffffff", margin: 0, fontSize: "24px" }}>
          Confirme seu e-mail para ativar sua conta
        </h1>
      </div>
      
      <div style={{ padding: "30px" }}>
        <p style={{ color: "#3f3f46", fontSize: "16px" }}>
          Olá, <strong>{userName || "membro"}</strong>!
        </p>
        <p style={{ color: "#52525b", fontSize: "15px", lineHeight: "1.5" }}>
          Sua conta no Scale Drop está quase pronta. Clique no botão abaixo para verificar seu e-mail e desbloquear o acesso à plataforma.
        </p>

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            Verificar meu e-mail
          </a>
        </div>
      </div>
    </div>
  </div>
);