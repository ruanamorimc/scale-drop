**Contexto do Projeto: Scale Drop (SaaS B2B)**

**Visão Geral:** 
Estamos desenvolvendo o "Scale Drop", uma plataforma B2B de infraestrutura e controle operacional para e-commerce e produtos digitais no mercado brasileiro. O sistema foca em gestão de pedidos, cálculo de lucratividade bruta e gestão de integrações.

**Tech Stack:** 
- Next.js (App Router, Tailwind CSS, Framer Motion, Lucide React)
- Prisma ORM + PostgreSQL
- Git (padrão Conventional Commits)

**O que já está pronto:**
- Estrutura base do Dashboard privado (ajustes de layout e flexbox resolvidos).
- Landing Page pública completa (rotas em português: Hero, Pricing, Footer, Termos, Sobre).
- Componente de Preços (`Pricing.tsx`) refatorado com a prop `hideHeader` para ser reaproveitado.
- Tela de bloqueio interna (`/planos`) perfeita e centralizada para usuários sem assinatura ativa, travando o acesso ao dashboard.
- Estrutura base de integrações definida (modelo usando Modais/Sheets no front-end, Server Actions para a lógica e rotas de API para Webhooks/Callbacks), testada primeiramente com a Pagar.me V5.

**Foco Atual e Próximo Passo:**
- Nosso foco agora é 100% no "Caminho do Dinheiro" e no motor da operação.
- Vamos iniciar a integração com a **Nuvemshop (OAuth 2.0)** para puxar dados reais de pedidos.
- O que precisamos construir: Variáveis no `.env` (`CLIENT_ID`, `CLIENT_SECRET`), Modal visual (`NuvemshopSheet.tsx`), Server Actions (`nuvemshop-actions.ts`) e as rotas de API (Callback e Webhooks).
- Integrações pendentes para o futuro (congeladas no momento): Mercado Pago, Google Ads e TikTok Ads. Ocultamos as telas de Ads temporariamente para priorizar o fluxo principal.