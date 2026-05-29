"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
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

// 👇 Importando o Schema separado
import { signUpSchema, type SignUpFormValues } from "@/schemas/auth-schema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "", // 👇 Inicializa vazio
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    setError(null);

    const { data, error } = await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        // 👇 Enviando o telefone (Mapeando 'phone' do form para 'phoneNumber' do Auth)
        phoneNumber: values.phone,
        callbackURL: "/email-verified",
      },
      {
        onRequest: () => {
          // Opcional: mostrar loading global
        },
        onSuccess: () => {
          toast.success("Conta criada com sucesso!");
          router.replace("/dashboard");
        },
        onError: (ctx) => {
          console.log("ERRO AO CRIAR CONTA", ctx);
          setError(ctx.error.message || "Erro ao criar conta");
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
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Preencha o formulário abaixo para criar sua conta
          </p>
        </div>

        {/* CAMPO NOME */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nome Completo</FieldLabel>
              <Input {...field} id={field.name} placeholder="Seu Nome" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* CAMPO EMAIL */}
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="email@example.com"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* 👇 NOVO CAMPO TELEFONE */}
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Telefone</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="(00) 00000-0000"
                type="tel" // Ajuda no mobile a abrir teclado numérico
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* CAMPO SENHA */}
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="••••••••"
                type="password"
              />
              <FieldDescription>
                Deve ter no mínimo 8 caracteres.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* CAMPO CONFIRMAR SENHA */}
        <Controller
          name="passwordConfirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirme sua senha</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="••••••••"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {error && (
          <div role="alert" className="text-sm text-red-600">
            {error}
          </div>
        )}

        <Field>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Criando..." : "Criar conta"}
          </Button>
        </Field>

        {/* ... Resto do botão Google e Link de Login ... */}
        <FieldSeparator>Ou continue com</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleSocialSignIn("google")}
          >
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
            Cadastre-se com Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Já tem uma conta? <Link href="/login">Entrar</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
