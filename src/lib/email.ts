import { Resend } from "resend"

//const resend = new Resend(process.env.RESEND.APY.KEY)

interface SendEmailValues {
    to: string;
    subject: string;
    text: string;
    html?: string // Opcional: Se quiser mandar email bonitão com HTML
}

export async function sendEmail({to, subject, text, html}: SendEmailValues) {
    await resend.emails.send({
        from: "process.env.EMAIL_FROM || 'onboarding@resend.dev'",
        to: to,
        subject: subject,
        text: text, // Versão texto puro (obrigatório para antispam)
        html: html || `<p>${text}</p>`, // Versão HTML básica
    })
}