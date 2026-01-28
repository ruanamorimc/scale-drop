/**
 * Página de testes para validar workflow de acesso
 * ⚠️ REMOVER EM PRODUÇÃO
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<any>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test/user-status");
      const data = await res.json();
      if (res.ok) {
        setUserStatus(data.user);
        toast.success("Status obtido com sucesso");
      } else {
        toast.error(data.error || "Erro ao obter status");
      }
    } catch (error) {
      toast.error("Erro ao verificar status");
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      provider: formData.get("provider"),
      externalId: formData.get("externalId") || `test-${Date.now()}`,
      status: formData.get("status"),
      startDate: formData.get("startDate") || new Date().toISOString(),
      endDate: formData.get("endDate") || undefined,
      externalPlanId: formData.get("externalPlanId") || undefined,
    };

    try {
      const res = await fetch("/api/test/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Subscription criada com sucesso!");
        await checkStatus();
      } else {
        toast.error(result.error || "Erro ao criar subscription");
      }
    } catch (error) {
      toast.error("Erro ao criar subscription");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      provider: formData.get("provider"),
      subscriptionId: formData.get("subscriptionId"),
      status: formData.get("status"),
      endDate: formData.get("endDate") || undefined,
      canceledAt: formData.get("canceledAt") || undefined,
    };

    try {
      const res = await fetch("/api/test/update-subscription-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Status atualizado com sucesso!");
        await checkStatus();
      } else {
        toast.error(result.error || "Erro ao atualizar status");
      }
    } catch (error) {
      toast.error("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Página de Testes</CardTitle>
            <CardDescription>
              Esta página não está disponível em produção
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Página de Testes - Workflow de Acesso</CardTitle>
          <CardDescription>
            Use esta página para testar manualmente o workflow de validação de
            acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkStatus} disabled={loading}>
            {loading ? "Carregando..." : "Verificar Status Atual"}
          </Button>

          {userStatus && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold">Status do Usuário:</h3>
              <p>
                <strong>Email:</strong> {userStatus.email}
              </p>
              <p>
                <strong>Access Status:</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded ${
                    userStatus.accessStatus === "ACTIVE"
                      ? "bg-green-500 text-white"
                      : userStatus.accessStatus === "PENDING"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                  }`}
                >
                  {userStatus.accessStatus}
                </span>
              </p>
              {userStatus.subscription && (
                <div className="mt-2">
                  <p>
                    <strong>Subscription:</strong>
                  </p>
                  <ul className="ml-4 list-disc">
                    <li>Provider: {userStatus.subscription.provider}</li>
                    <li>Status: {userStatus.subscription.status}</li>
                    <li>
                      Start:{" "}
                      {new Date(
                        userStatus.subscription.startDate,
                      ).toLocaleString()}
                    </li>
                    {userStatus.subscription.endDate && (
                      <li>
                        End:{" "}
                        {new Date(
                          userStatus.subscription.endDate,
                        ).toLocaleString()}
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {userStatus.wallet && (
                <div className="mt-2">
                  <p>
                    <strong>Wallet:</strong>
                  </p>
                  <ul className="ml-4 list-disc">
                    <li>
                      Balance: R$ {Number(userStatus.wallet.balance).toFixed(2)}
                    </li>
                    <li>
                      Blocked: {userStatus.wallet.isBlocked ? "Sim" : "Não"}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Criar Subscription</CardTitle>
          <CardDescription>
            Cria uma subscription manualmente para testar o acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createSubscription} className="space-y-4">
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select name="provider" defaultValue="KIRVANO">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KIRVANO">Kirvano</SelectItem>
                  <SelectItem value="PERFECTPAY">PerfectPay</SelectItem>
                  <SelectItem value="HUBLA">Hubla</SelectItem>
                  <SelectItem value="TICTO">Ticto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="externalId">External ID</Label>
              <Input
                name="externalId"
                placeholder={`test-${Date.now()}`}
                defaultValue={`test-${Date.now()}`}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="ACTIVE">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                  <SelectItem value="CANCELED">CANCELED</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                name="startDate"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date (opcional)</Label>
              <Input name="endDate" type="datetime-local" />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Subscription"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Atualizar Status da Subscription</CardTitle>
          <CardDescription>
            Atualiza o status de uma subscription existente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateStatus} className="space-y-4">
            <div>
              <Label htmlFor="subscriptionId">
                Subscription ID (ou External ID)
              </Label>
              <Input
                name="subscriptionId"
                placeholder="ID da subscription"
                required
              />
            </div>

            <div>
              <Label htmlFor="provider">Provider</Label>
              <Select name="provider" defaultValue="KIRVANO">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KIRVANO">Kirvano</SelectItem>
                  <SelectItem value="PERFECTPAY">PerfectPay</SelectItem>
                  <SelectItem value="HUBLA">Hubla</SelectItem>
                  <SelectItem value="TICTO">Ticto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Novo Status</Label>
              <Select name="status" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                  <SelectItem value="CANCELED">CANCELED</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar Status"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Fluxo de Teste Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Faça login na aplicação</li>
            <li>
              Clique em Verificar Status Atual - deve mostrar{" "}
              <code>BLOCKED</code>
            </li>
            <li>
              Crie uma subscription com status <code>ACTIVE</code>
            </li>
            <li>
              Verifique status novamente - deve mostrar <code>ACTIVE</code>
            </li>
            <li>
              Tente acessar <code>/dashboard</code> - deve funcionar
            </li>
            <li>
              Atualize subscription para <code>CANCELED</code>
            </li>
            <li>
              Verifique status - deve mostrar <code>BLOCKED</code>
            </li>
            <li>
              Tente acessar <code>/dashboard</code> - deve redirecionar para{" "}
              <code>/plans</code>
            </li>
            <li>
              Atualize subscription para <code>ACTIVE</code> novamente
            </li>
            <li>Verifique se o acesso foi restaurado</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
