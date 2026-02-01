"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 👇 Seus imports originais (Mantendo a lógica que já funciona)
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Interface para receber os dados reais da página
interface ProfileFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    image?: string | null;
  } | null;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Configuração do Form usando seu Schema existente
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  // Atualiza o form se o user mudar (Ex: revalidação)
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: UpdateUserValues) {
    startTransition(async () => {
      let hasError = false;

      // 1. Lógica de Alterar Email (Preservada do seu código original)
      if (values.email !== user?.email) {
        const { error } = await authClient.changeEmail({
          newEmail: values.email,
          callbackURL: "/email-verified", // Ajuste para sua rota de verificação
        });

        if (error) {
          toast.error("Erro ao alterar email: " + error.message);
          hasError = true;
        } else {
          toast.info("Verifique seu email novo para confirmar a alteração!");
        }
      }

      if (hasError) return;

      // 2. Atualiza Dados Básicos via Server Action
      const result = await updateUserAction(values);

      if (result.success) {
        toast.success("Perfil atualizado com sucesso!");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar dados.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* SEÇÃO DO AVATAR (Visual Shaboard) */}
        <div className="flex items-center gap-x-8">
            <Avatar className="h-24 w-24">
                <AvatarImage src={user?.image || "/avatar-placeholder.png"} />
                <AvatarFallback className="text-xl">
                    {user?.name?.slice(0,2).toUpperCase() || "US"}
                </AvatarFallback>
            </Avatar>
            <div className="flex gap-4">
                <Button variant="outline" type="button" disabled>Alterar Foto</Button>
                {/* Botão Remover opcional */}
            </div>
        </div>

        <Separator />

        {/* GRID DE CAMPOS (Organizado em 2 colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
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
                    <Input placeholder="+55 (00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormDescription>
                Se você alterar o email, precisará verificar o novo endereço.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botão de Salvar */}
        <div className="flex justify-start">
            <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Atualizar Perfil"}
            </Button>
        </div>
      </form>
    </Form>
  );
}