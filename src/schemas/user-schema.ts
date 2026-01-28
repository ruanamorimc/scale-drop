import { z } from "zod";

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(4, { message: "O nome deve ter pelo menos 4 caracteres!" })
      .max(50),
    email: z.string().email({ message: "Email inválido" }), // Email agora é obrigatório e validado
    phone: z
      .string()
      .min(10, { message: "Telefone inválido" })
      .optional()
      .or(z.literal("")),

    // 👇 Novos campos de senha
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, { message: "A nova senha deve ter no mínimo 8 caracteres" })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      // Regra: Se digitou nova senha, a senha atual é OBRIGATÓRIA
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Para alterar a senha, digite sua senha atual.",
      path: ["currentPassword"], // O erro vai aparecer no campo currentPassword
    },
  );

export type UpdateUserValues = z.infer<typeof updateUserSchema>;
