import z from "zod";

export const passwordSchema = z
  .string()
  .min(1, { message: "É necessário usar uma senha." })
  .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
  .regex(/[^A-Za-z0-9]/, {
    message: "A senha deve conter pelo menos um caractere especial.",
  });
