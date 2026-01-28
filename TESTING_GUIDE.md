# Guia de Testes - Workflow de Validação de Acesso

Este guia explica como testar manualmente todo o workflow de validação de acesso sem precisar integrar o checkout externo.

## 🎯 Objetivo

Testar o fluxo completo de:
1. ✅ Criação de usuário
2. ✅ Criação automática de wallet
3. ✅ Criação de subscription
4. ✅ Atualização de accessStatus
5. ✅ Bloqueio/desbloqueio de acesso
6. ✅ Redirecionamento baseado em acesso

## 🚀 Como Testar

### Passo 1: Acessar Página de Testes

1. Faça login na aplicação
2. Acesse: `http://localhost:3000/test`
3. Você verá uma interface com 3 seções principais

### Passo 2: Verificar Status Inicial

1. Clique em **"Verificar Status Atual"**
2. Você deve ver:
   - `accessStatus: BLOCKED` (sem subscription)
   - `wallet: null` ou wallet com saldo 0
   - `subscription: null`

### Passo 3: Criar Subscription Ativa

1. Na seção **"1. Criar Subscription"**:
   - Provider: Selecione qualquer um (ex: KIRVANO)
   - External ID: Deixe o padrão ou crie um único
   - Status: Selecione **ACTIVE**
   - Start Date: Deixe o padrão (hoje)
   - End Date: Deixe vazio (sem expiração)
2. Clique em **"Criar Subscription"**
3. Verifique o status novamente:
   - `accessStatus` deve mudar para **ACTIVE**
   - `subscription.status` deve ser **ACTIVE**

### Passo 4: Testar Acesso ao Dashboard

1. Tente acessar: `http://localhost:3000/dashboard`
2. ✅ **Deve funcionar!** Você deve ver o dashboard
3. O `AccessGuard` permite o acesso porque `accessStatus === "ACTIVE"`

### Passo 5: Cancelar Subscription

1. Volte para `/test`
2. Na seção **"2. Atualizar Status da Subscription"**:
   - Subscription ID: Use o `externalId` que você criou (ou o ID da subscription)
   - Provider: Mesmo provider usado na criação
   - Novo Status: Selecione **CANCELED**
3. Clique em **"Atualizar Status"**
4. Verifique o status:
   - `accessStatus` deve mudar para **BLOCKED**
   - `subscription.status` deve ser **CANCELED**

### Passo 6: Testar Bloqueio de Acesso

1. Tente acessar: `http://localhost:3000/dashboard`
2. ✅ **Deve redirecionar para `/plans`!**
3. O `AccessGuard` bloqueia o acesso porque `accessStatus === "BLOCKED"`

### Passo 7: Reativar Subscription

1. Volte para `/test`
2. Atualize a subscription para **ACTIVE** novamente
3. Verifique o status - deve voltar para **ACTIVE**
4. Tente acessar `/dashboard` novamente - deve funcionar!

## 📋 Cenários de Teste Completos

### Cenário 1: Novo Usuário
```
1. Criar conta → accessStatus: PENDING
2. Criar subscription ACTIVE → accessStatus: ACTIVE
3. Acessar dashboard → ✅ Permitido
```

### Cenário 2: Subscription Expira
```
1. Criar subscription ACTIVE com endDate no futuro
2. Atualizar endDate para o passado
3. Atualizar status para EXPIRED → accessStatus: BLOCKED
4. Acessar dashboard → ❌ Bloqueado (redireciona para /plans)
```

### Cenário 3: Subscription Suspensa
```
1. Criar subscription ACTIVE
2. Atualizar para SUSPENDED → accessStatus: BLOCKED
3. Acessar dashboard → ❌ Bloqueado
4. Reativar para ACTIVE → accessStatus: ACTIVE
5. Acessar dashboard → ✅ Permitido
```

### Cenário 4: Wallet Bloqueado
```
1. Criar subscription ACTIVE
2. Wallet é criado automaticamente
3. Quando subscription expira, wallet pode ser bloqueado
4. Verificar wallet.isBlocked
```

## 🔧 APIs de Teste Disponíveis

### 1. GET `/api/test/user-status`
Retorna status completo do usuário logado.

**Resposta:**
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "accessStatus": "ACTIVE",
    "subscription": { ... },
    "wallet": { ... },
    "counts": { ... }
  }
}
```

### 2. POST `/api/test/create-subscription`
Cria uma subscription manualmente.

**Body:**
```json
{
  "provider": "KIRVANO",
  "externalId": "test-123",
  "status": "ACTIVE",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": null
}
```

### 3. POST `/api/test/update-subscription-status`
Atualiza status de uma subscription.

**Body:**
```json
{
  "provider": "KIRVANO",
  "subscriptionId": "test-123",
  "status": "CANCELED"
}
```

## 🧪 Testando via cURL (Alternativa)

Se preferir testar via terminal:

```bash
# 1. Obter status (precisa estar autenticado)
curl http://localhost:3000/api/test/user-status \
  -H "Cookie: better-auth.session_token=SEU_TOKEN"

# 2. Criar subscription
curl -X POST http://localhost:3000/api/test/create-subscription \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=SEU_TOKEN" \
  -d '{
    "provider": "KIRVANO",
    "externalId": "test-123",
    "status": "ACTIVE"
  }'

# 3. Atualizar status
curl -X POST http://localhost:3000/api/test/update-subscription-status \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=SEU_TOKEN" \
  -d '{
    "provider": "KIRVANO",
    "subscriptionId": "test-123",
    "status": "CANCELED"
  }'
```

## ⚠️ Importante

1. **Estas rotas de teste só funcionam em desenvolvimento** (`NODE_ENV !== "production"`)
2. **Em produção, remova ou proteja essas rotas** com autenticação de admin
3. **Use apenas para testes locais**

## 🎯 Checklist de Validação

- [ ] Usuário sem subscription tem `accessStatus: BLOCKED`
- [ ] Criar subscription ACTIVE muda `accessStatus` para `ACTIVE`
- [ ] Dashboard é acessível quando `accessStatus: ACTIVE`
- [ ] Dashboard redireciona para `/plans` quando `accessStatus: BLOCKED`
- [ ] Cancelar subscription bloqueia acesso
- [ ] Reativar subscription restaura acesso
- [ ] Wallet é criado automaticamente
- [ ] Wallet pode ser bloqueado quando subscription expira

## 🐛 Troubleshooting

### Erro: "Esta rota não está disponível em produção"
- Certifique-se de que `NODE_ENV !== "production"`

### Erro: "Não autenticado"
- Faça login primeiro
- Verifique se o cookie de sessão está sendo enviado

### Status não atualiza
- Verifique se o `subscriptionId` ou `externalId` está correto
- Verifique os logs do servidor para erros

### Dashboard não redireciona
- Verifique se o `AccessGuard` está sendo usado na página
- Verifique se o middleware está configurado corretamente
