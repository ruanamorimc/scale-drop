import React from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import prisma from "@/lib/prisma";
import { passwordSchema } from "./validation";
import { sendEmail } from "./email";
import { VerifyEmailTemplate } from "@/components/verify-email-template";

// 👇 1. ADICIONE ESSA FUNÇÃO AQUI NO TOPO
// Isso simula o envio de email imprimindo no terminal preto do VS Code
/* const sendEmail = async ({ to, subject, text }: { to: string, subject: string, text: string }) => {
  console.log(`
    📨 ========================================
    PARA: ${to}
    ASSUNTO: ${subject}
    CONTEÚDO: ${text}
    ===========================================
  `);
}; */

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://uncruel-tonda-theoretically.ngrok-free.dev", // Seu link do Ngrok
    "https://scale-drop.vercel.app",
    "https://*.vercel.app", // Libera todas as URLs de preview da Vercel
  ],
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Resete sua senha - Scale Drop",
        text: `Clique no link para resetar sua senha: ${url}`,
        // Dica: Aqui você pode injetar um template HTML bonito depois
        html: `
          <h1>Recuperação de Senha</h1>
          <p>Olá, ${user.name}</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <a href="${url}" style="padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Resetar Senha</a>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Verifique seu Email - Scale Drop",
        text: `Confirme seu e-mail acessando o link: ${url}`,
        react: React.createElement(VerifyEmailTemplate, {
          userName: user.name,
          url: url,
        }),
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      async sendChangeEmailVerification({ user, newEmail, url }) {
        await sendEmail({
          to: user.email, // Manda para o email ANTIGO avisando, ou para o NOVO confirmando
          // O Better Auth recomenda mandar para o novo para confirmar que ele existe
          subject: "Confirme seu novo endereço de email - Scale Drop",
          text: `Você solicitou a troca para ${newEmail}. Clique aqui para confirmar: ${url}`,
        });
      },
    },
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      accessStatus: {
        type: "string",
        required: false,
        defaultValue: "PENDING", // Ou o valor padrão do seu banco
        input: false, // O usuário não pode editar isso no cadastro
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body.password || ctx.body.newPassword;
        const { error } = passwordSchema.safeParse(password);
        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: "Senha não é forte o suficiente",
          });
        }
      }
    }),
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
