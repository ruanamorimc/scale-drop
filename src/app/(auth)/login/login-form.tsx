"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginFormValues } from "@/schemas/auth-schema"; // 👇 Importando do schema


import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"; // Verifique se o import está correto para o shadcn

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);

    // O authClient já lida com o estado de loading interno, mas podemos usar o do form
    const { error } = await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackURL: "/dashboard",
      },
      {
        onSuccess: () => {
          toast.success("Login realizado com sucesso!");
          router.replace("/dashboard");
        },
        onError: (ctx) => {
          console.log("ERRO AO LOGAR", ctx);
          setError(ctx.error.message || "Email ou senha incorretos.");
        },
      },
    );
  }

  async function handleSocialSignIn(provider: "google") {
    setError(null);

    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Algo deu errado");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Faça Login na sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Digite suas credenciais para acessar sua conta.
          </p>
        </div>

        {/* CAMPO EMAIL */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="email@example.com"
                autoComplete="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* CAMPO SENHA */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                <Link
                  href="/forgot-password" // Ajuste a rota se necessário
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input
                {...field}
                id={field.name}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* CHECKBOX REMEMBER ME */}
        <Controller
          name="rememberMe"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Manter conectado
              </Label>
            </div>
          )}
        />

        {error && (
          <div role="alert" className="text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Entrando..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Ou continue com</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleSocialSignIn("google")}
          >
            {/* Ícone do Google omitido */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2 size-4"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Login com Google
          </Button>
          <FieldDescription className="text-center">
            Não tem uma conta?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Criar uma conta
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
