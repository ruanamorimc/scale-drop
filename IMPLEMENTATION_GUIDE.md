# Guia de Implementação - Passos 2 a 4

Este documento descreve o que foi implementado e como usar.

## ✅ Passo 2: Lógica de Negócio

### 2.1 Middleware de Acesso

**Arquivo**: `src/middleware.ts`

O middleware foi atualizado para:
- ✅ Verificar `accessStatus` diretamente do banco de dados
- ✅ Redirecionar usuários sem acesso para `/plans`
- ✅ Adicionar headers `x-user-id` e `x-access-status` em requisições de API
- ✅ Funcionar com rotas de API e páginas

### 2.2 Webhook Handlers

**Arquivo**: `src/app/api/webhooks/checkout/route.ts`

O webhook handler foi melhorado para:
- ✅ Suportar múltiplos providers (Kirvano, PerfectPay, Hubla, Ticto)
- ✅ Validar signatures de webhook (estrutura pronta, implementar validação específica)
- ✅ Processar diferentes eventos (created, activated, canceled, expired, suspended, updated)
- ✅ Atualizar automaticamente `Subscription` e `accessStatus` do usuário

**Uso**: Configure o webhook no seu checkout externo apontando para:
```
POST /api/webhooks/checkout
Headers:
  x-provider: KIRVANO (ou PERFECTPAY, HUBLA, TICTO)
  x-signature: <signature-do-webhook>
```

### 2.3 Sistema de Wallet

**Arquivo**: `src/lib/wallet.ts`

Funcionalidades implementadas:
- ✅ `getOrCreateWallet()`: Cria wallet automaticamente
- ✅ `addCredit()`: Adiciona crédito com transação
- ✅ `addDebit()`: Remove débito com validação de saldo
- ✅ `paySupplier()`: Paga fornecedor usando wallet
- ✅ `blockWallet()` / `unblockWallet()`: Controle de bloqueio
- ✅ `getTransactionHistory()`: Histórico completo de transações

**Exemplo de uso**:
```typescript
import { addCredit, paySupplier } from "@/lib/wallet";

// Adicionar crédito
await addCredit(userId, 100.50, "Depósito inicial", undefined, "DEPOSIT");

// Pagar fornecedor
await paySupplier(userId, orderPaymentId, 50.00);
```

### 2.4 Sincronização de Pedidos

**Arquivo**: `src/lib/sync.ts`

Estrutura pronta para:
- ✅ `syncOrder()`: Sincroniza um pedido de loja externa
- ✅ `syncAllOrders()`: Sincroniza todos os pedidos
- ✅ `mapOrderStatus()`: Mapeia status entre plataformas (Shopify, ML, Shopee)

**Próximo passo**: Implementar chamadas reais às APIs das lojas.

## ✅ Passo 3: Segurança

### 3.1 Criptografia de Tokens

**Arquivo**: `src/lib/security.ts`

Implementado:
- ✅ `encryptToken()` / `decryptToken()`: Estrutura básica (usar crypto-js em produção)
- ✅ `validateWebhookSignature()`: Estrutura para validação por provider
- ✅ `generateRateLimitKey()`: Helper para rate limiting

**⚠️ IMPORTANTE**: A criptografia atual usa apenas base64 (não seguro). Em produção:
1. Instale `crypto-js`: `npm install crypto-js @types/crypto-js`
2. Implemente criptografia AES real
3. Use variáveis de ambiente para chaves

### 3.2 Validação de Permissões

**Arquivo**: `src/lib/permissions.ts`

Funcionalidades:
- ✅ `hasAccess()`: Verifica se usuário tem acesso ativo
- ✅ `validateResourceOwnership()`: Valida propriedade de recurso
- ✅ `getResourceForUser()`: Obtém recurso garantindo propriedade
- ✅ `requireAccess()`: Helper para APIs

**Uso em API routes**:
```typescript
import { withAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    // userId já validado e com acesso ativo
    // Todos os recursos são automaticamente filtrados por userId
  });
}
```

### 3.3 Queries Seguras

Todas as queries garantem:
- ✅ Filtro automático por `userId` (multi-tenancy)
- ✅ Validação de acesso antes de operações
- ✅ Prevenção de acesso a recursos de outros usuários

## ✅ Passo 4: Observações e Hooks

### 4.1 Atualização Automática de AccessStatus

**Arquivo**: `src/lib/subscription.ts`

Implementado:
- ✅ `updateUserAccessStatus()`: Atualiza automaticamente quando subscription muda
- ✅ Integrado em `upsertSubscription()` e `processSubscriptionWebhook()`
- ✅ Hook `onSubscriptionChange()` para ações adicionais

**Fluxo**:
1. Webhook recebe evento de subscription
2. `processSubscriptionWebhook()` atualiza subscription
3. `updateUserAccessStatus()` atualiza `User.accessStatus`
4. `onSubscriptionChange()` executa ações adicionais (ex: bloquear wallet)

### 4.2 Criação Automática de Wallet

**Arquivo**: `src/lib/user-hooks.ts`

Implementado:
- ✅ `onCreateUser()`: Cria wallet automaticamente
- ✅ Pode ser estendido para outras ações iniciais

**Como usar**:

**Opção 1**: Chamar após sign-up no cliente
```typescript
// Após sign-up bem-sucedido
await fetch('/api/users/create-wallet', { method: 'POST' });
```

**Opção 2**: Criar API route que chama após sign-up
```typescript
// Em uma API route de sign-up customizada
import { onCreateUser } from "@/lib/user-hooks";
await onCreateUser(userId);
```

**Opção 3**: Usar o endpoint de onboarding
```typescript
// POST /api/users/onboard
// Cria wallet e outros recursos iniciais
```

### 4.3 Preservação de Dados

Configurado no schema:
- ✅ `onDelete: Restrict` em relacionamentos críticos
- ✅ Dados não são deletados ao cancelar assinatura
- ✅ Apenas `accessStatus` é alterado para `BLOCKED`

## 📁 Estrutura de Arquivos Criados

```
src/
├── lib/
│   ├── security.ts          # Criptografia e validação
│   ├── wallet.ts            # Gerenciamento de wallet
│   ├── subscription.ts      # Gerenciamento de subscriptions
│   ├── permissions.ts       # Validação de permissões
│   ├── sync.ts              # Sincronização de pedidos
│   ├── user-hooks.ts        # Hooks de usuário
│   ├── api-helpers.ts       # Helpers para API routes
│   └── README.md            # Documentação dos serviços
├── app/
│   └── api/
│       ├── webhooks/
│       │   └── checkout/
│       │       └── route.ts  # Webhook handler melhorado
│       ├── wallet/
│       │   ├── balance/
│       │   │   └── route.ts  # Exemplo: obter saldo
│       │   └── transactions/
│       │       └── route.ts  # Exemplo: listar transações
│       └── users/
│           ├── onboard/
│           │   └── route.ts  # Onboarding de usuário
│           └── create-wallet/
│               └── route.ts  # Criar wallet
└── middleware.ts            # Middleware atualizado
```

## 🚀 Próximos Passos Recomendados

1. **Criptografia Real**: Implementar criptografia AES em `security.ts`
2. **Validação de Webhooks**: Implementar validação específica por provider
3. **Cron Job**: Configurar cron para `checkExpiredSubscriptions()`
4. **Integrações Reais**: Implementar chamadas às APIs das lojas em `sync.ts`
5. **Rate Limiting**: Implementar rate limiting usando Redis ou similar
6. **Testes**: Criar testes unitários para os serviços
7. **Logging**: Adicionar logging estruturado
8. **Monitoramento**: Configurar monitoramento de erros (Sentry, etc)

## 📝 Variáveis de Ambiente Necessárias

Crie um arquivo `.env` baseado em `.env.example`:

```env
DATABASE_URL="postgresql://..."
ENCRYPTION_KEY="sua-chave-forte-aqui"
KIRVANO_WEBHOOK_SECRET="..."
PERFECTPAY_WEBHOOK_SECRET="..."
HUBLA_WEBHOOK_SECRET="..."
TICTO_WEBHOOK_SECRET="..."
```

## 🔒 Segurança em Produção

1. **Nunca** commite `.env` no git
2. Use chaves fortes para `ENCRYPTION_KEY`
3. Implemente criptografia real (não apenas base64)
4. Valide todos os webhooks com signatures
5. Use HTTPS em produção
6. Implemente rate limiting
7. Monitore tentativas de acesso não autorizado

## 📚 Documentação Adicional

Consulte `src/lib/README.md` para documentação detalhada de cada serviço.
