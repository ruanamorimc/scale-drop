"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { updateUserSchema, type UpdateUserValues } from "@/schemas/user-schema";
import { updateUserAction } from "@/actions/user-actions";
import { authClient } from "@/lib/auth-client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// 👇 Interface atualizada
interface EditUserFormProps {
  user?: {
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
  onSuccess: () => void; // Função que será chamada para fechar o modal
}

export const EditUserForm = ({ user, onSuccess }: EditUserFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: user?.name || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.name || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: UpdateUserValues) {
    startTransition(async () => {
      let hasError = false;

      // 1. Lógica de Senha (mantém igual)
      if (values.newPassword && values.currentPassword) {
        const { error } = await authClient.changePassword({
          newPassword: values.newPassword,
          currentPassword: values.currentPassword,
          revokeOtherSessions: true,
        });
        if (error) {
          toast.error("Erro na senha: " + error.message);
          hasError = true;
        }
      }

      // 2. 👇 NOVA LÓGICA DE EMAIL
      // Verificamos se o email do formulário é diferente do email atual do usuário
      if (values.email !== user?.email) {
        const { error } = await authClient.changeEmail({
          newEmail: values.email,
          callbackURL: "/email-verified", // Para onde ele vai após clicar no email
        });

        if (error) {
          toast.error("Erro ao alterar email: " + error.message);
          hasError = true;
        } else {
          toast.info("Verifique seu email novo para confirmar a alteração!");
        }
      }

      if (hasError) return;

      // 3. Atualiza o resto (Nome e Telefone) via Server Action
      // Note que o email vai junto no 'values', mas a Action agora ignora ele
      const result = await updateUserAction(values);

      if (result.success) {
        // Só mostramos sucesso geral se não houve erro crítico antes
        if (!hasError) {
          toast.success("Perfil atualizado!");
          router.refresh();
          onSuccess();
        }
      } else {
        toast.error(result.error || "Erro ao atualizar dados.");
      }
    });
  }

  // 👇 Retorna APENAS o formulário, sem Sheet ou Trigger
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ... (TODOS OS SEUS INPUTS AQUI: username, email, phone) ... */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Adicione os outros inputs de email e phone aqui... */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          {/* ... (INPUTS DE SENHA AQUI) ... */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Atual</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
};
