import { Resend } from "resend";

// Inicializa a instância do Resend
export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailValues {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  react?: React.ReactNode; // Permite passar um template do React Email
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  react,
}: SendEmailValues) {
  return await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject,
    text: text || "",
    html,
    react,
  });
}
