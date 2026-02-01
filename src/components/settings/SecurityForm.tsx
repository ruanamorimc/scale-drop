"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client"; // Seu cliente de auth
import { Session } from "@/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Importe o Badge se quiser destacar a atual
import { UAParser } from "ua-parser-js"; // 👇 Importe o parser
import { Laptop, Smartphone, Globe } from "lucide-react"; // Ícones legais

// 👇 Defina o tipo da prop que vai chegar
interface SecurityFormProps {
  sessions: Session[]; // Ou use o tipo Session do Prisma se tiver exportado
  currentSessionToken: string;
}

// --- SCHEMA DA SENHA ---
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "A senha atual é obrigatória"),
    newPassword: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "A confirmação deve ter no mínimo 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export function SecurityForm({
  sessions = [],
  currentSessionToken,
}: SecurityFormProps) {
  // 👇 Função auxiliar para escolher o ícone baseada no dispositivo
  const getDeviceIcon = (type: string | undefined) => {
    if (type === "mobile" || type === "tablet")
      return <Smartphone className="h-4 w-4" />;
    return <Laptop className="h-4 w-4" />;
  };

  const [isLoading, setIsLoading] = useState(false);

  // 1. Configuração do Form de Senha
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // 2. Função de Trocar Senha (Reaproveitada do seu EditUserForm)
  async function onSubmitPassword(values: PasswordValues) {
    setIsLoading(true);
    const { error } = await authClient.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
      revokeOtherSessions: true, // Opcional: Desloga de outros lugares
    });

    if (error) {
      toast.error(error.message || "Erro ao atualizar senha");
    } else {
      toast.success("Senha atualizada com sucesso!");
      form.reset();
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* --- SEÇÃO 1: TROCAR SENHA --- */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-medium">Alterar Senha</h3>
          <p className="text-sm text-muted-foreground">
            Atualize sua senha para manter sua conta segura. Escolha uma senha
            forte e única.
          </p>
        </div>

        <Card className="bg-transparent border-neutral-800">
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Salvando..." : "Definir nova senha"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

      {/* --- SEÇÃO 2: PREFERÊNCIAS DE SEGURANÇA (VISUAL) --- */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-medium">Preferências de Segurança</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie recursos extras de segurança para sua conta.
          </p>
        </div>

        <Card className="bg-transparent border-neutral-800">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox id="2fa" disabled />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="2fa"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ativar Autenticação de 2 Fatores
                </label>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança usando seu telefone.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0">
              <Checkbox id="alerts" defaultChecked />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="alerts"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Alertas de Login
                </label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações sobre atividades de login suspeitas.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="secondary" disabled>
                Salvar Preferências
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* --- SEÇÃO 3: LOGS RECENTES (TABELA VISUAL) --- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Sessões Ativas</h3>
            <p className="text-sm text-muted-foreground">
              Dispositivos conectados à sua conta atualmente.
            </p>
          </div>
        </div>

        <Card className="bg-transparent border-neutral-800">
          <div className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b [&_tr]:border-neutral-800">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Dispositivo
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Localização (IP)
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                      Última Atividade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => {
                    // AQUI ACONTECE A MÁGICA DO PARSER 🪄
                    const parser = new UAParser(session.userAgent || "");
                    const result = parser.getResult();

                    const browser =
                      result.browser.name || "Navegador Desconhecido";
                    const os = result.os.name || "OS Desconhecido";
                    const deviceType = result.device.type; // mobile, tablet, etc

                    const isCurrent = session.token === currentSessionToken;

                    return (
                      <tr
                        key={session.id}
                        className="border-b border-neutral-800 transition-colors hover:bg-neutral-900/50"
                      >
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-muted-foreground">
                              {getDeviceIcon(deviceType)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-white flex items-center gap-2">
                                {browser} no {os}
                                {isCurrent && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] h-5 px-1.5"
                                  >
                                    Atual
                                  </Badge>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {session.userAgent?.substring(0, 40)}...
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            {/* Nota: Para ter "São Paulo", precisaria de uma API externa. O padrão é mostrar o IP. */}
                            <span>{session.ipAddress || "IP Oculto"}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
