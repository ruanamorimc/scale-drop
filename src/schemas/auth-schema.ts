import { z } from "zod";
// Ajuste o import do passwordSchema conforme sua estrutura atual
// Se não tiver um genérico, pode definir aqui mesmo: z.string().min(8)
import { passwordSchema } from "@/lib/validation";

// Schema do formulário de cadastro
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(4, { message: "O nome deve ter pelo menos 4 caracteres" }),
    email: z.email({ message: "Por favor, insira um email válido" }),
    // 👇 NOVO CAMPO DE TELEFONE
    phone: z
      .string()
      .min(10, { message: "Telefone inválido (mínimo 10 dígitos)" })
      .max(15, { message: "Telefone muito longo" }),
    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(8, { message: "Por favor, confirme sua senha" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

// Schema do formulário de login
export const loginSchema = z.object({
  email: z.email({ message: "Por favor, insira um email válido" }),
  // Importe passwordSchema de @/lib/validation ou defina z.string().min(1)
  password: z.string().min(1, { message: "Senha é obrigatória" }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Schema do formulário Esqueci minha senha
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "O email é obrigatório." })
    .email({ message: "Por favor, insira um email válido." }),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;


// Schema do formulário de Resetar senha
export const resetPasswordSchema = z
  .object({
    password: passwordSchema, // A nova senha
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;