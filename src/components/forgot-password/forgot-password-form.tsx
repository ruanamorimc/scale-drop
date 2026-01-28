"use client"

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react"; // Ícones opcionais

// 👇 Importando Schema e AuthClient
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth-schema";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [isPending, setIsPending] = useState(false);
  // Estado para mostrar uma mensagem de sucesso estática após o envio
  const [isSuccess, setIsSuccess] = useState(false); 

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setIsPending(true);

    const { data, error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password", // A página para onde o usuário vai ao clicar no link do email
    });

    setIsPending(false);

    if (error) {
      toast.error(error.message || "Erro ao enviar email de recuperação.");
    } else {
      setIsSuccess(true);
      toast.success("Email de recuperação enviado!");
    }
  }

  const loading = form.formState.isSubmitting

  // Se já enviou com sucesso, mostra apenas a mensagem de confirmação
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Verifique seu email</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Enviamos um link de recuperação para <strong>{form.getValues("email")}</strong>.
          </p>
        </div>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/login">Voltar para o Login</Link>
        </Button>
      </div>
    );
  }

  // Formulário Padrão
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Esqueceu a senha?</h1>
        <p className="text-muted-foreground text-sm">
          Digite seu email e enviaremos um link para resetar sua senha.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="nome@exemplo.com" 
                    type="email" 
                    autoComplete="email"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Link de Recuperação"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button variant="link" asChild className="text-muted-foreground">
          <Link href="/login" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar para o Login
          </Link>
        </Button>
      </div>
    </div>
  );
}
