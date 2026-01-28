"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, LockKeyhole, ArrowLeft } from "lucide-react";

import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/schemas/auth-schema";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Componente interno que usa o useSearchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // 👇 Pega o token da URL

  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      toast.error("Token inválido ou expirado. Solicite uma nova redefinição.");
      return;
    }

    setIsPending(true);

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token: token, // Envia o token capturado para o backend
    });

    setIsPending(false);

    if (error) {
      toast.error(error.message || "Erro ao redefinir a senha.");
    } else {
      toast.success("Senha redefinida com sucesso!");
      router.push("/login"); // Manda pro login
    }
  }

  // Se não tiver token na URL, mostra erro visual
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <LockKeyhole className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Link Inválido</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Não encontramos o token de segurança na URL. <br />
            Por favor, clique no link do seu email novamente.
          </p>
        </div>
        <Button variant="outline" asChild className="mt-2">
          <Link href="/forgot-password">Solicitar novo link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Redefinir Senha</h1>
        <p className="text-muted-foreground text-sm">
          Crie uma nova senha forte para sua conta.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Senha */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo Confirmar Senha */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redefinindo...
              </>
            ) : (
              "Salvar Nova Senha"
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

// O componente principal precisa envolver tudo em Suspense
// porque usamos useSearchParams (requisito do Next.js)
export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="text-center">Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
