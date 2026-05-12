--
-- PostgreSQL database dump
--

\restrict 85PK6OIG5L6ngdypvDHj8lzHMSr7L2cjfE5EF1lIWZ71drwbo80B0DepYcZsK1b

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AccessStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AccessStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'BLOCKED'
);


ALTER TYPE public."AccessStatus" OWNER TO postgres;

--
-- Name: IntegrationProvider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IntegrationProvider" AS ENUM (
    'SHOPIFY',
    'MERCADO_LIVRE',
    'NUVEMSHOP',
    'YAMPI',
    'CARTPANDA',
    'KIWIFY',
    'HOTMART',
    'KIRVANO',
    'APPMAX',
    'MERCADO_PAGO',
    'STRIPE',
    'FACEBOOK_ADS',
    'GOOGLE_ADS',
    'TIKTOK_ADS',
    'MELHOR_ENVIO'
);


ALTER TYPE public."IntegrationProvider" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'CONFIRMED',
    'PREPARING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'PARTIAL',
    'REFUNDED',
    'FAILED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: SubscriptionProvider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionProvider" AS ENUM (
    'KIRVANO',
    'PERFECTPAY',
    'HUBLA',
    'TICTO'
);


ALTER TYPE public."SubscriptionProvider" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'EXPIRED',
    'CANCELED',
    'SUSPENDED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionType" AS ENUM (
    'CREDIT',
    'DEBIT'
);


ALTER TYPE public."TransactionType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Fee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Fee" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    value numeric(10,2) NOT NULL,
    "paymentMethod" text[],
    "isDefault" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "calculationRule" text
);


ALTER TABLE public."Fee" OWNER TO postgres;

--
-- Name: FixedExpense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FixedExpense" (
    id text NOT NULL,
    "userId" text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FixedExpense" OWNER TO postgres;

--
-- Name: Tax; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tax" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    rate numeric(10,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type text DEFAULT 'GOVERNMENT'::text,
    "calculationRule" text DEFAULT 'faturamento'::text,
    "isSystem" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Tax" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp(3) without time zone,
    "refreshTokenExpiresAt" timestamp(3) without time zone,
    scope text,
    password text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: meta_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meta_account (
    id text NOT NULL,
    "userId" text NOT NULL,
    "accountId" text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.meta_account OWNER TO postgres;

--
-- Name: meta_pixel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meta_pixel (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'meta'::text NOT NULL,
    "pixelIds" text[],
    status text DEFAULT 'Ativo'::text NOT NULL,
    rules jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.meta_pixel OWNER TO postgres;

--
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "storeIntegrationId" text NOT NULL,
    "externalOrderId" text NOT NULL,
    "orderNumber" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "customerName" text NOT NULL,
    "customerEmail" text,
    "customerPhone" text,
    "customerDocument" text,
    "shippingAddress" text NOT NULL,
    "shippingCity" text,
    "shippingState" text,
    "shippingZipCode" text,
    "shippingCountry" text DEFAULT 'BR'::text,
    subtotal numeric(10,2) NOT NULL,
    "shippingCost" numeric(10,2) DEFAULT 0 NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    "paymentMethod" text,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "shippingMethod" text,
    "trackingNumber" text,
    "shippedAt" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text,
    name text NOT NULL,
    sku text,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    "supplierId" text,
    "supplierSku" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- Name: order_payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_payment (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "supplierId" text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "paymentMethod" text,
    "paymentDate" timestamp(3) without time zone,
    "transactionId" text,
    notes text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_payment OWNER TO postgres;

--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    id text NOT NULL,
    "userId" text NOT NULL,
    "supplierId" text,
    name text NOT NULL,
    sku text,
    barcode text,
    "costPrice" numeric(10,2),
    "salePrice" numeric(10,2),
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    "minStock" integer,
    description text,
    images text[],
    category text,
    tags text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "supplierSku" text,
    "supplierUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "externalId" text,
    "externalLink" text,
    "platformFee" numeric(10,2) DEFAULT 0 NOT NULL,
    provider text DEFAULT 'MANUAL'::text NOT NULL,
    "shippingFee" numeric(10,2) DEFAULT 0 NOT NULL,
    "storeName" text
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: store_integration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_integration (
    id text NOT NULL,
    "userId" text NOT NULL,
    "storeName" text NOT NULL,
    "storeId" text,
    "storeUrl" text,
    "accessToken" text NOT NULL,
    "refreshToken" text,
    "tokenExpiresAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "isConnected" boolean DEFAULT false NOT NULL,
    "lastSyncAt" timestamp(3) without time zone,
    "autoSync" boolean DEFAULT true NOT NULL,
    "syncInterval" integer,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    platform public."IntegrationProvider" NOT NULL
);


ALTER TABLE public.store_integration OWNER TO postgres;

--
-- Name: subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription (
    id text NOT NULL,
    "userId" text NOT NULL,
    provider public."SubscriptionProvider" NOT NULL,
    "externalId" text NOT NULL,
    "externalPlanId" text,
    status public."SubscriptionStatus" DEFAULT 'PENDING'::public."SubscriptionStatus" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone,
    "canceledAt" timestamp(3) without time zone,
    "lastWebhookEvent" text,
    "lastWebhookAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    plan text NOT NULL
);


ALTER TABLE public.subscription OWNER TO postgres;

--
-- Name: subscription_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_history (
    id text NOT NULL,
    "userId" text NOT NULL,
    event text NOT NULL,
    plan text NOT NULL,
    status text NOT NULL,
    amount double precision,
    currency text DEFAULT 'BRL'::text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.subscription_history OWNER TO postgres;

--
-- Name: supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    document text,
    address text,
    city text,
    state text,
    "zipCode" text,
    country text DEFAULT 'BR'::text,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.supplier OWNER TO postgres;

--
-- Name: tracking_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracking_events (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status text NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tracking_events OWNER TO postgres;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    "balanceAfter" numeric(12,2) NOT NULL,
    description text NOT NULL,
    "referenceId" text,
    "referenceType" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.transaction OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    role text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "accessStatus" public."AccessStatus" DEFAULT 'PENDING'::public."AccessStatus" NOT NULL,
    "phoneNumber" text,
    plan text DEFAULT 'FREE'::text NOT NULL,
    "dashboardLayout" jsonb,
    preferences jsonb DEFAULT '{}'::jsonb,
    "metaAccessToken" text
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.verification OWNER TO postgres;

--
-- Name: wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet (
    id text NOT NULL,
    "userId" text NOT NULL,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "blockedReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wallet OWNER TO postgres;

--
-- Data for Name: Fee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Fee" (id, "userId", name, type, value, "paymentMethod", "isDefault", "createdAt", "calculationRule") FROM stdin;
cmlfwhpqy00028wwesq30x3p9	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Taxa - Saque	FIXED	2.50	{pix}	t	2026-02-10 01:06:46.042	\N
cmlfsopmm0000wwweb2dcx9s5	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Taxa - Kirvano	PERCENTAGE	7.49	{pix,card_1x,card_2x,card_3x,card_4x,card_5x,card_6x,card_7x,card_8x,card_9x,card_10x,card_11x,card_12x}	t	2026-02-09 23:20:14.014	faturamento
\.


--
-- Data for Name: FixedExpense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FixedExpense" (id, "userId", description, category, amount, date, "createdAt") FROM stdin;
\.


--
-- Data for Name: Tax; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tax" (id, "userId", name, rate, "isActive", "createdAt", type, "calculationRule", "isSystem") FROM stdin;
cmlftg0r300008wwep5cklzvx	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Imposto do An├║ncio (Meta)	12.00	t	2026-02-09 23:41:28.143	GOVERNMENT	gasto_anuncio	t
cmlfuismt00018wwee145s9ps	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Simples Nacional	10.00	t	2026-02-10 00:11:37.205	GOVERNMENT	faturamento	f
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a31ef004-5463-4e7e-926e-a7690fe76598	9aed39c24e598983e6ac4f0cc4c15be0856a98147bd2b0e9645cfd321b432aeb	2026-01-23 07:24:11.947785-03	20260123102411_init	\N	\N	2026-01-23 07:24:11.929132-03	1
ca27eff0-065b-4f11-a505-352c55891b11	bcfd8292f07205aa371d0245f7912a7cf2ccd24e06705030c78c152e6ff4b8e9	2026-01-23 15:19:23.020527-03	20260123181922_add_subscriptions_wallet_and_orders	\N	\N	2026-01-23 15:19:22.943151-03	1
5bcba2f6-dbb5-4343-a02e-6d9fab638ec0	e10d4bc4996b36d7f319c582193156593af2674bc1867dc7056c729df4881524	2026-01-26 16:54:14.900972-03	20260126195414_add_phone_number	\N	\N	2026-01-26 16:54:14.897418-03	1
3511e9a8-3e40-4574-be3d-c4605568e35c	781c8c36c76e151a132e081d094eb5953681b7b0a3718d529e63720c7a3e5722	2026-01-28 03:49:29.74925-03	20260128064929_fix_subscription_schema	\N	\N	2026-01-28 03:49:29.717668-03	1
9b9a911e-1ef9-487b-b888-f51f958af8f6	9aa100457c2fd30d5aace682ee7da542bd7da611f4a37d7665711c7805188894	2026-02-07 20:17:02.51359-03	20260207231702_fix_product_schema	\N	\N	2026-02-07 20:17:02.461281-03	1
0578ac79-0994-49c5-9c38-8d6a61aa065a	c203a3432891d563d7a345044eaf71118e5507198d3c0d5f29a387e6db7241a6	2026-02-08 13:12:03.009597-03	20260208161202_add_fee_and_tax_schema	\N	\N	2026-02-08 13:12:02.941831-03	1
a8d3d4c1-d282-4cd5-8dc8-3f47c55e24d0	6d8b1220a8c6ad8156db3feaca86b0f8125e5d26589073e3d441f6d5eeeaffed	2026-02-09 20:14:53.665261-03	20260209231453_add_calculation_rule_and_meta_tax	\N	\N	2026-02-09 20:14:53.632155-03	1
c57a1679-cb09-46d3-a11d-7d009031375a	4497594d523355fb07742285877b70511e4b18e12343ee05c727a65dfa0c8df8	2026-02-09 20:37:10.750519-03	20260209233710_add_tax_system_fields	\N	\N	2026-02-09 20:37:10.740609-03	1
c60ec6b6-97d8-4a84-a042-b11795a2d170	aa932104ca5ceb96c65df16a28d7aa77df2eaaa856fa021029b46fa843fd22fa	2026-02-09 20:38:27.125259-03	20260209233827_add_tax_system_fields	\N	\N	2026-02-09 20:38:27.121741-03	1
797b8f34-3193-4f62-90d1-b610f97834ff	204d152f52e55b75fe25d52d6ad45cb511dfa7455c0e317eeb084c20bdc6cb4f	2026-02-10 22:41:34.954663-03	20260211014134_add_fixed_expenses	\N	\N	2026-02-10 22:41:34.880258-03	1
34931af3-bd5f-4e42-a816-0f077544e979	ac2585a2b6be644da68ea60df9b25abad788c65f4b802455140ccc11569a3695	2026-02-21 15:51:57.040181-03	20260221185157_save_dashboard_layout	\N	\N	2026-02-21 15:51:57.02505-03	1
8b54afd7-f057-4a53-8d95-85c6010a8c18	fc0f42917c1df98aacbcfbbf5bf927a156e199e7fa3995da2c2248b9d1ed262c	2026-03-22 21:03:42.208278-03	20260323000342_add_user_preferences	\N	\N	2026-03-22 21:03:42.170913-03	1
21421646-c696-4c60-a164-7bef9c63185e	f598edb0f13e1cdd3c11ef5a283c720882f51fc64942f176498f2fe9911d8185	2026-04-07 18:24:42.792411-03	20260407212442_add_meta_ads_models	\N	\N	2026-04-07 18:24:42.682661-03	1
\.


--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt") FROM stdin;
Z1RrrIkK0F1p0hqXQQ8XKIKf91DACXNu	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	credential	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	\N	\N	\N	\N	\N	3131c7104f9eeeda8159f9bdda7ff8af:3b063ddda773c152afa63500e84b62f118fac32b7d7259bbbea37c59cb2639f7588024f34a8fa04f9b8fa42cb659719957eb2b4b1b682fe824cc2929047415c2	2026-01-26 20:54:00.546	2026-01-26 20:54:00.546
uI9Jt7gagIs4aoaVlU0dKuUV5oKxnUPE	73PnSzkplwo1E6Vv8XlvZn1S1vIcjfXZ	credential	73PnSzkplwo1E6Vv8XlvZn1S1vIcjfXZ	\N	\N	\N	\N	\N	\N	6d13e34509ccb4e19fdd75d1a068173e:13e36dd8079f5314d95ee80869203b64ad29a14b2278365b9a6a58800999e65dd98ce8b71027e3825e8512be2c513a3dacffdd0a3863b3c7788731b185436e2d	2026-02-01 21:33:41.501	2026-02-01 21:33:41.501
\.


--
-- Data for Name: meta_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meta_account (id, "userId", "accountId", name, "isActive", "createdAt", "updatedAt") FROM stdin;
cmnp7b1yr0005lkweggglq0op	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	1689544078597909	CA 02 - BM 04	f	2026-04-07 22:38:51.314	2026-04-07 23:00:10.307
cmnp7b1yw0008lkweq1dfiv91	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	956225146509479	CA 01 - BM 05	f	2026-04-07 22:38:51.32	2026-04-07 23:00:10.66
cmnp7b1yc0000lkwe2sj3ghzn	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	578244113051880	Ruan Amorim	f	2026-04-07 22:38:51.3	2026-04-07 23:00:11.14
cmnp7b1yo0004lkweakplcp0s	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	1019666143631352	CA 01	f	2026-04-07 22:38:51.312	2026-04-08 04:43:45.037
cmnp7b1yt0006lkwev7zffm6n	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	687188284282069	CA 01 - BM 04	f	2026-04-07 22:38:51.317	2026-04-08 04:43:46.952
cmnp7b1yu0007lkwerpbdczw1	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	1834545730610540	CA 01 - AG	f	2026-04-07 22:38:51.318	2026-04-08 04:43:47.406
cmnp7b1yk0002lkwe7ysjkosb	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	414401491603593	CA 01	f	2026-04-07 22:38:51.308	2026-04-08 04:43:47.904
cmnp7b1yi0001lkwetjeisnl3	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	1606788273137267	BM ZN Imports	f	2026-04-07 22:38:51.306	2026-04-08 04:43:48.535
cmnp7b1ym0003lkwet4o24jpr	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	8902336953214043	001	f	2026-04-07 22:38:51.31	2026-04-08 04:43:48.879
\.


--
-- Data for Name: meta_pixel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meta_pixel (id, "userId", name, type, "pixelIds", status, rules, "createdAt", "updatedAt") FROM stdin;
cmnqfblns0000l8wevh2xxkgq	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Pixel - Loja	Meta (Facebook)	{1287299435750893}	Ativo	{"lead": {"enabled": "Desabilitado"}, "ipConfig": "Enviar IPv6 se houver. Enviar IPv4 se n├úo houver IPv6", "purchase": {"value": "Valor da venda", "config": "Vendas pendentes e aprovadas", "product": "Qualquer"}, "addToCart": {"enabled": "Desabilitado"}, "initiateCheckout": {"enabled": "Habilitado", "detection": "Cont├®m texto"}}	2026-04-08 19:10:59.944	2026-04-08 19:10:59.944
\.


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, "userId", "storeIntegrationId", "externalOrderId", "orderNumber", status, "customerName", "customerEmail", "customerPhone", "customerDocument", "shippingAddress", "shippingCity", "shippingState", "shippingZipCode", "shippingCountry", subtotal, "shippingCost", discount, total, "paymentMethod", "paymentStatus", "shippingMethod", "trackingNumber", "shippedAt", "deliveredAt", metadata, "createdAt", "updatedAt") FROM stdin;
cmogk7ce600053wwepoa4ybln	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1001	APP-1001	CONFIRMED	Jo├úo da Silva	joao@email.com	11999999999	11122233344	N├úo informado				BR	297.90	0.00	0.00	297.90	pix	PAID	\N	\N	\N	\N	\N	2026-04-27 02:09:39.966	2026-04-27 02:09:39.966
cmogkounq00063wwepc91fwx4	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1002	APP-1002	CANCELLED	Maria Oliveira	maria@email.com		00000000000	N├úo informado				BR	594.00	0.00	0.00	594.00	credit_card	FAILED	\N	\N	\N	\N	\N	2026-04-27 02:23:16.79	2026-04-27 02:23:16.79
cmogltkbs00073wwekn90qy2r	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1003	APP-1003	PENDING	Carlos Eduardo	carlos@email.com		00000000000	N├úo informado				BR	149.90	0.00	0.00	149.90	boleto	PENDING	\N	\N	\N	\N	\N	2026-04-27 02:54:56.295	2026-04-27 02:54:56.295
cmom2ebtv00083wwe79ndifqp	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1004	APP-1004	CONFIRMED	Ana Souza	ana.souza@email.com	11988887777	44455566677	N├úo informado				BR	450.00	0.00	0.00	450.00	credit_card	PAID	\N	\N	\N	\N	\N	2026-04-30 22:37:49.795	2026-04-30 22:37:49.795
cmom2ezq200093wwekuot1eq2	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1005	APP-1005	CANCELLED	Marcos Silva	marcos.silva@email.com	11977776666	88899900011	N├úo informado				BR	120.50	0.00	0.00	120.50	pix	FAILED	\N	\N	\N	\N	\N	2026-04-30 22:38:20.762	2026-04-30 22:38:20.762
cmom2fum8000a3wwef95m4a2c	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1006	APP-1006	CONFIRMED	Fernanda Lima	fernanda.lima@email.com	11955554444	22233344455	N├úo informado				BR	89.90	0.00	0.00	89.90	boleto	PAID	\N	\N	\N	\N	\N	2026-04-30 22:39:00.8	2026-04-30 22:39:00.8
cmom397j9000b3wwegp9yl7ub	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1007	APP-1007	PENDING	Felipe Pendente	felipe@teste.com		00000000000	N├úo informado				BR	120.00	0.00	0.00	120.00	pix	PENDING	\N	\N	\N	\N	\N	2026-04-30 23:01:50.565	2026-04-30 23:01:50.565
cmom39f00000c3wwecyo7gnm5	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1008	APP-1008	PENDING	Julia Analise	julia@teste.com		00000000000	N├úo informado				BR	350.00	0.00	0.00	350.00	credit_card	PENDING	\N	\N	\N	\N	\N	2026-04-30 23:02:00.24	2026-04-30 23:02:00.24
cmom39h61000d3wwepx2ytha8	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	cmogiu4vr00043wwe65zsnxqm	APP-1009	APP-1009	CANCELLED	Marcos Vencido	marcos@teste.com		00000000000	N├úo informado				BR	89.90	0.00	0.00	89.90	boleto	FAILED	\N	\N	\N	\N	\N	2026-04-30 23:02:03.049	2026-04-30 23:10:49.282
\.


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item (id, "orderId", "productId", name, sku, quantity, "unitPrice", "totalPrice", "supplierId", "supplierSku", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_payment (id, "orderId", "supplierId", amount, status, "paymentMethod", "paymentDate", "transactionId", notes, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (id, "userId", "supplierId", name, sku, barcode, "costPrice", "salePrice", "stockQuantity", "minStock", description, images, category, tags, "isActive", "isPublished", "supplierSku", "supplierUrl", "createdAt", "updatedAt", "externalId", "externalLink", "platformFee", provider, "shippingFee", "storeName") FROM stdin;
cmld35iu90000s0wep1jbffoj	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 864 - Casa	TEST-59666	\N	230.40	384.00	42	\N	\N	{https://placehold.co/400x400/222/FFF?text=CAS}	Casa	\N	f	f	\N	\N	2026-02-08 01:49:56.001	2026-02-08 01:49:56.001	\N	\N	0.00	MANUAL	0.00	Amazon
cmld35iui0001s0wed2njib5x	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 236 - Eletr├┤nicos	TEST-98177	\N	90.60	151.00	49	\N	\N	{https://placehold.co/400x400/222/FFF?text=ELE}	Eletr├┤nicos	\N	f	f	\N	\N	2026-02-08 01:49:56.01	2026-02-08 01:49:56.01	\N	\N	0.00	MANUAL	0.00	Manual
cmld35iul0002s0wegoj0is48	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 840 - Casa	TEST-14644	\N	271.80	453.00	12	\N	\N	{https://placehold.co/400x400/222/FFF?text=CAS}	Casa	\N	f	f	\N	\N	2026-02-08 01:49:56.013	2026-02-08 01:49:56.013	\N	\N	0.00	MANUAL	0.00	Amazon
cmld35iuo0003s0wevesycxjk	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 733 - Beleza	TEST-42144	\N	285.00	475.00	68	\N	\N	{https://placehold.co/400x400/222/FFF?text=BEL}	Beleza	\N	f	f	\N	\N	2026-02-08 01:49:56.016	2026-02-08 01:49:56.016	\N	\N	0.00	MANUAL	0.00	Manual
cmld35iur0004s0wefhbu2u89	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 423 - Beleza	TEST-95379	\N	328.20	547.00	31	\N	\N	{https://placehold.co/400x400/222/FFF?text=BEL}	Beleza	\N	t	f	\N	\N	2026-02-08 01:49:56.019	2026-02-08 01:49:56.019	\N	\N	0.00	MANUAL	0.00	Shopee
cmld35iuu0005s0weae9xbe8y	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 285 - Casa	TEST-48240	\N	66.60	111.00	61	\N	\N	{https://placehold.co/400x400/222/FFF?text=CAS}	Casa	\N	f	f	\N	\N	2026-02-08 01:49:56.022	2026-02-08 01:49:56.022	\N	\N	0.00	MANUAL	0.00	Mercado Livre
cmld35iuw0006s0we3yvjg19n	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 291 - Eletr├┤nicos	TEST-15349	\N	267.60	446.00	68	\N	\N	{https://placehold.co/400x400/222/FFF?text=ELE}	Eletr├┤nicos	\N	t	f	\N	\N	2026-02-08 01:49:56.024	2026-02-08 01:49:56.024	\N	\N	0.00	MANUAL	0.00	Amazon
cmld35iuy0007s0we625fb4a6	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 779 - Eletr├┤nicos	TEST-26921	\N	160.20	267.00	58	\N	\N	{https://placehold.co/400x400/222/FFF?text=ELE}	Eletr├┤nicos	\N	f	f	\N	\N	2026-02-08 01:49:56.026	2026-02-08 01:49:56.026	\N	\N	0.00	MANUAL	0.00	Amazon
cmld35iv00008s0werbp5jymz	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 741 - Moda	TEST-51219	\N	216.60	361.00	31	\N	\N	{https://placehold.co/400x400/222/FFF?text=MOD}	Moda	\N	f	f	\N	\N	2026-02-08 01:49:56.028	2026-02-08 01:49:56.028	\N	\N	0.00	MANUAL	0.00	Manual
cmld35iv20009s0wey3ff9287	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	\N	Produto Teste 440 - Moda	TEST-91320	\N	220.20	367.00	8	\N	\N	{https://placehold.co/400x400/222/FFF?text=MOD}	Moda	\N	t	f	\N	https://pt.aliexpress.com/item/1005007099240050.html?pvid=70a52e4c-601c-4dac-84a5-b832c7fd6057&pdp_ext_f=%7B%22ship_from%22:%22CN%22,%22sku_id%22:%2212000040222864717%22%7D&scm=1007.28480.422277.0&scm-url=1007.28480.422277.0&scm_id=1007.28480.422277.0&pdp_npi=6%40dis%21BRL%21R%24%20582%2C10%21R%24%20249%2C59%21%21%21710.23%21304.53%21%402103868817705172923986760e1db4%2112000040222864717%21gdf%21BR%21%21X%211%210%21n_tag%3A-29910%3Bd%3Add00cd40%3Bm03_new_user%3A-29895%3BpisId%3A5000000198050282&spm=a2g0o.tm1000029706.4162782170.dundefined&aecmd=true	2026-02-08 01:49:56.03	2026-02-08 03:10:51.81	\N	\N	0.00	MANUAL	0.00	Amazon
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (id, "expiresAt", token, "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") FROM stdin;
fYWR9WJfYBXY9FKwuSBllj8w8WPdbpOE	2026-01-28 06:28:39.37	yDJ6wmgQkqZMEqdw30gwN5zT3YWUz0fk	2026-01-27 06:28:39.37	2026-01-27 06:28:39.37	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
qziPKtjyTOWY1LZMvGYuZITzkFXUCUqO	2026-02-02 21:11:49.695	0jnuGeRS8M80dSXRLcr7jsQnlvOPBIyA	2026-02-01 21:11:49.695	2026-02-01 21:11:49.695	45.185.84.19	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
5Qy6lK6xYr1jmEanlVIFDGN6ZLnVdy2p	2026-02-08 21:33:41.614	Sev3GP0b35ypE3TklYDHcAVnL7ZYD7oK	2026-02-01 21:33:41.614	2026-02-01 21:33:41.614	143.255.252.104	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	73PnSzkplwo1E6Vv8XlvZn1S1vIcjfXZ
wu52oE7AIUIGRVxl1G5YePdk2XxttL0W	2026-02-02 21:44:31.595	yfMU7zQMQ0uRUyOPx2JVlI9DIxE0pFzc	2026-02-01 21:44:31.596	2026-02-01 21:44:31.596	45.185.84.19	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
1jeMr0OKQmfZKM2sNueb5XTcB4z5DL4L	2026-02-10 23:34:50.85	DhAPXAPXtYjtAgWpAgl2hzVblfwvUOCD	2026-02-03 23:34:50.851	2026-02-03 23:34:50.851	45.185.84.19	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
XqEfTCnSPRyq3lK0f22SbcS5bgf4GAe4	2026-02-14 17:22:00.068	rFUzcNfLzJ3mIRjuVuMvUaLPzmMc6luO	2026-02-07 17:22:00.068	2026-02-07 17:22:00.068	45.185.84.19	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
VZeQK2586Y2wRMxMW5m4NiBwsrSfkFJ2	2026-02-08 20:32:51.545	zF0fCd8BXf6rAMRg2q5dVwNLASyTNNwI	2026-02-07 20:32:51.546	2026-02-07 20:32:51.546	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
YOKozOMEqwjLsbbPdQloYeZshNRNBIEt	2026-02-12 00:27:39.339	Js8VGo2fpbbKUBu9yTHBZAjuvkSSgfwf	2026-02-11 00:27:39.34	2026-02-11 00:27:39.34	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
igCM0cqUh42ufdIv4ymks32nPMBixhF2	2026-02-19 00:21:30.839	44cH1w5PGtsJiDO5ILIAyXgzy9HLvjiv	2026-02-12 00:21:30.839	2026-02-12 00:21:30.839	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
rV0O2uieTolPkRYE9bkpYc8wJKEXwYBH	2026-02-13 21:02:35.741	8A7j8l4l2HjgWEUEorvITkbpNjxiGIYi	2026-02-12 21:02:35.741	2026-02-12 21:02:35.741	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
4G2uRJxqsT6WC46as9ghwRFwy74K9s0F	2026-03-01 16:35:20.298	WXm9T7W69uj2t8gX1D0ce1EFh7WggGtK	2026-02-22 16:35:20.298	2026-02-22 16:35:20.298	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
n53UqORULPkaJAk3ZiyH5w0uPr94pEdi	2026-02-28 23:06:49.022	rKYGFAFRYxJbW8KqjGtOgOlLLUMmfDI5	2026-02-27 23:06:49.023	2026-02-27 23:06:49.023	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
6n0bxLsJDcZ9HsLIBP7njohI2pQqPk22	2026-03-01 00:42:33.3	NigcINmMEHS7QSNcfHWRfQyeLD8xFgzD	2026-02-28 00:42:33.3	2026-02-28 00:42:33.3	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
3KeEut3cefJR0y5uktJB2ppPmcMFOkIL	2026-03-09 15:15:04.819	DHSD40khpsUoYPHpwvHuQ5Y45vEqQH2o	2026-03-08 15:15:04.819	2026-03-08 15:15:04.819	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
iReGIyqT7llmsUc7sj3KiTlndymie9J4	2026-03-29 23:29:31.481	K6GRygenUySHu92p6QjVCOolVmCKy0nU	2026-03-20 15:44:58.473	2026-03-22 23:29:31.481	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
LOYcXZncxftYM2SA9Loefh81RFmO4ZRR	2026-03-31 16:25:37.55	aQ9oF4uLVkRxFodMOs0ZTz4DaA3G3jI3	2026-03-30 16:25:37.55	2026-03-30 16:25:37.55	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
Zsn1vBWfjCEiz5DNFqCnNH8QimK4C6u3	2026-04-04 23:12:55.325	CxD9zOU4E4DJNTBwJmdvSFyO8wzQmBHv	2026-04-03 23:12:55.326	2026-04-03 23:12:55.326	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
u9MTSZwvoSTPWl5g1k0CekPcBdXv4zw3	2026-04-11 12:21:00.938	KQnlTXzh3B2IduCW0GjYCZ5PrjZ64Sgl	2026-04-10 12:21:00.938	2026-04-10 12:21:00.938	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
2kZI6KHze44CFsCOC6wKir9dbBdxuzaG	2026-04-14 13:41:52.825	Sikvvxn3WVhpotgCSsUFjiSckcL5m9vk	2026-04-13 13:41:52.826	2026-04-13 13:41:52.826	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
WeVn4rcWv3DR4LeF3TVgl15ZpBcTQsCx	2026-04-23 19:08:07.079	0LvtHXtFHNXrLKPXEykMeKot6PbnQnsL	2026-04-22 19:08:07.079	2026-04-22 19:08:07.079	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
DAtZNRn4fYgwzTzQx9zjWsp3CFXSXm9q	2026-05-04 00:08:27.165	khszcOjPQ8ChCjPzoWkW5mNcmcuQGZqH	2026-04-27 00:08:27.165	2026-04-27 00:08:27.165	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
xjk4rvAlYRhHfTl17Q30UlmXvGW7IWbX	2026-05-06 17:13:44.702	RITXGg5YorggOfM6SSXUg7mzUyzHi6b6	2026-05-05 17:13:44.702	2026-05-05 17:13:44.702	0000:0000:0000:0000:0000:0000:0000:0000	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre
\.


--
-- Data for Name: store_integration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_integration (id, "userId", "storeName", "storeId", "storeUrl", "accessToken", "refreshToken", "tokenExpiresAt", "isActive", "isConnected", "lastSyncAt", "autoSync", "syncInterval", metadata, "createdAt", "updatedAt", platform) FROM stdin;
cmo7q94vm0003ccwezqrqbkw9	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Cartpanda	\N	\N		\N	\N	t	t	\N	t	\N	\N	2026-04-20 21:49:05.65	2026-04-20 21:49:05.65	CARTPANDA
cmogidr0x00013wweyieqsmbt	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Minha Loja Yampi	\N	\N	wh_j7CYKIb9JfHdYfuphc8gM1gTWuSVXpMnk99Dw	\N	\N	t	t	\N	t	\N	\N	2026-04-27 01:18:39.633	2026-04-27 01:18:39.633	YAMPI
cmogiu4vr00043wwe65zsnxqm	zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Appmax	\N	\N	webhook_inbound_only	\N	\N	t	f	\N	t	\N	\N	2026-04-27 01:31:24.087	2026-04-27 01:31:24.087	APPMAX
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription (id, "userId", provider, "externalId", "externalPlanId", status, "startDate", "endDate", "canceledAt", "lastWebhookEvent", "lastWebhookAt", metadata, "createdAt", "updatedAt", plan) FROM stdin;
\.


--
-- Data for Name: subscription_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_history (id, "userId", event, plan, status, amount, currency, "createdAt") FROM stdin;
\.


--
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier (id, "userId", name, email, phone, document, address, city, state, "zipCode", country, "isActive", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: tracking_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tracking_events (id, "orderId", status, description, date, "createdAt") FROM stdin;
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction (id, "userId", type, amount, "balanceAfter", description, "referenceId", "referenceType", metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, "emailVerified", image, role, "createdAt", "updatedAt", "accessStatus", "phoneNumber", plan, "dashboardLayout", preferences, "metaAccessToken") FROM stdin;
73PnSzkplwo1E6Vv8XlvZn1S1vIcjfXZ	DANIEL 	suportefitnes@gmail.com	f	\N	user	2026-02-01 21:33:41.497	2026-02-01 21:33:41.497	BLOCKED	31993138254	FREE	\N	{}	\N
zLrbasCKTowEB8YwqhJVjvfWWZ2SkMre	Ruan Amorim	ruan@test.com	t	\N	user	2026-01-26 20:54:00.531	2026-04-07 22:38:51.285	ACTIVE	+55 65 8157-3574	SCALE	\N	{}	EAARxrgo6dosBRGJT7H6dyTZAa81QnQLYzfFXdoIlRInM6ZBnwIqy2qD5DnZAD8SiYUtvi4dXUgwWS80XIYcBWPn3UT0HaYLIZBV2rHsHzvii7Ie3ZAYxsxbZByd2h96i3f1XMneRf55nRN0OZBKiqcZCrAs3PYpsg0GTvPT9ZB57ZBHMDhMLNthhpwIeRBsGYVJqZBRJR2mpCihpGDB25h4Oe0dWrCeDO5drLO5fQPzCTab7sWij2g2AMGyFUrB2LHFj38YvlJWrHVZBZCrj6AFd3m2WAe4j9bV9iBopOwgEsWLHOD6Jc34Eu7gZDZD
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
ySn9jRuBsHoeLDnONlbbYWHGu1pdIHx5	YpiuGG6sJ9lHSvlhXO_fQZD-62RhIc8I	{"callbackURL":"/dashboard","codeVerifier":"h1fuFCaOa9n3O3ZkiR312vtBLZBuIJbgx8Fsv3wnABJ5Zx4UbwLnxHn1v92tqUXo8rn5XD8oKP5ETBQ3-n5j4Bjbt1DuV2eCNttMDZ6I_4VWGm7WlOl6Ea-9UR0ENfaz","expiresAt":1769495649320,"state":"YpiuGG6sJ9lHSvlhXO_fQZD-62RhIc8I"}	2026-01-27 06:34:09.33	2026-01-27 06:24:09.33	2026-01-27 06:24:09.33
mmSJQ3FBU7ikCaM5C7DYN05tx43i9b6z	VSh9r3kBr_1y03MmY3IOvIe1yxYJRtkh	{"callbackURL":"/dashboard","codeVerifier":"qbpOK-nGtpjDC6tvfJ4SYccZYJ4THLa1L9rnrT83LEWM5NBa0i-w8U5HXYrklfCqmwRZYZ-U84fLEkibNBXOrPI2tO3nIeuKJaXWEuZ07ObDvjxZ8_OSEXRo_izlasiw","expiresAt":1769495655799,"state":"VSh9r3kBr_1y03MmY3IOvIe1yxYJRtkh"}	2026-01-27 06:34:15.799	2026-01-27 06:24:15.799	2026-01-27 06:24:15.799
4ttHpkijxraldJdYwIbbG0sgFSTEt2Rr	DK3MaUg5ZIT4yfq8xYZBLam5Npnzm8ID	{"callbackURL":"/dashboard","codeVerifier":"2kqNSRCckJGHcEJwXTS4NR7c8z1WM_L5ky8_Qpqugnx4GupQabOPl04RM5ceUCdS54EUiBWG3HBdzQXxJX2w36Guo7WjALS-qiZnsVHG8wN70IYRqyXYDAm52ssu76UM","expiresAt":1769495660370,"state":"DK3MaUg5ZIT4yfq8xYZBLam5Npnzm8ID"}	2026-01-27 06:34:20.371	2026-01-27 06:24:20.371	2026-01-27 06:24:20.371
yHf6pg0vwsQa8ZrbXKodzdMXZCU0kf9p	7fNgdhu5IJLYJQeXLqoulwlw_MaJcPT9	{"callbackURL":"/dashboard","codeVerifier":"xBtxDHgFcGqRJ-RnPScyxSViRuYkyoUicF-lRObWg3Bp4jktZqTUIez_p_Lo28lRUmCOaiDukGiGrrnbyorplLBo4WtDIjoSvoUUaci1cke75NUtRxS26ZiO1zRAJM93","expiresAt":1769495706982,"state":"7fNgdhu5IJLYJQeXLqoulwlw_MaJcPT9"}	2026-01-27 06:35:06.983	2026-01-27 06:25:06.983	2026-01-27 06:25:06.983
8cIPOtDLcmxcq1aY0YH4fOXUO5NzEo78	6YmcfcSjiNByzzRYZixA0IQsar92bJdX	{"callbackURL":"/dashboard","codeVerifier":"j0VKGWC4QgkPUphJokBULQUBU68rBfHsyaj_SJkvyFvt2_ZFKVZ23VTCZyTNWTDfMK4pF_WqELKwqRWa-Z80EnteUWeVdcNeeJ7kvEpj5CP_xasLdrqHqSCkRCAEe1W2","expiresAt":1769982174608,"state":"6YmcfcSjiNByzzRYZixA0IQsar92bJdX"}	2026-02-01 21:42:54.609	2026-02-01 21:32:54.609	2026-02-01 21:32:54.609
do17fTm2oHAlo8fHnfJycKJZ3O54de8c	TPcjsTCaddhZUEl-DnWFnyF0nMb0O8Jc	{"callbackURL":"/dashboard","codeVerifier":"_zV8Y4f-Mb1FteY9j-7BOH_yKKRV8XdmIe7-wFhre0_ooTDSLzhxbgJ8YlwPeLKDesRC4I-NRJc09kE_D_GKOmYldqqzRxF8ieJAF1_BClheqojJNeBSIQpUHqXSnfZE","expiresAt":1769982175344,"state":"TPcjsTCaddhZUEl-DnWFnyF0nMb0O8Jc"}	2026-02-01 21:42:55.344	2026-02-01 21:32:55.344	2026-02-01 21:32:55.344
\.


--
-- Data for Name: wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet (id, "userId", balance, "isBlocked", "blockedReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: Fee Fee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fee"
    ADD CONSTRAINT "Fee_pkey" PRIMARY KEY (id);


--
-- Name: FixedExpense FixedExpense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FixedExpense"
    ADD CONSTRAINT "FixedExpense_pkey" PRIMARY KEY (id);


--
-- Name: Tax Tax_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tax"
    ADD CONSTRAINT "Tax_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: meta_account meta_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_account
    ADD CONSTRAINT meta_account_pkey PRIMARY KEY (id);


--
-- Name: meta_pixel meta_pixel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_pixel
    ADD CONSTRAINT meta_pixel_pkey PRIMARY KEY (id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: order_payment order_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_payment
    ADD CONSTRAINT order_payment_pkey PRIMARY KEY (id);


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: store_integration store_integration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_integration
    ADD CONSTRAINT store_integration_pkey PRIMARY KEY (id);


--
-- Name: subscription_history subscription_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT subscription_history_pkey PRIMARY KEY (id);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: tracking_events tracking_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_events
    ADD CONSTRAINT tracking_events_pkey PRIMARY KEY (id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: wallet wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet
    ADD CONSTRAINT wallet_pkey PRIMARY KEY (id);


--
-- Name: account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "account_userId_idx" ON public.account USING btree ("userId");


--
-- Name: meta_account_userId_accountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "meta_account_userId_accountId_key" ON public.meta_account USING btree ("userId", "accountId");


--
-- Name: meta_account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "meta_account_userId_idx" ON public.meta_account USING btree ("userId");


--
-- Name: meta_pixel_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "meta_pixel_userId_idx" ON public.meta_pixel USING btree ("userId");


--
-- Name: order_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_createdAt_idx" ON public."order" USING btree ("createdAt");


--
-- Name: order_externalOrderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_externalOrderId_idx" ON public."order" USING btree ("externalOrderId");


--
-- Name: order_item_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_item_orderId_idx" ON public.order_item USING btree ("orderId");


--
-- Name: order_item_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_item_productId_idx" ON public.order_item USING btree ("productId");


--
-- Name: order_paymentStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_paymentStatus_idx" ON public."order" USING btree ("paymentStatus");


--
-- Name: order_payment_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_payment_orderId_idx" ON public.order_payment USING btree ("orderId");


--
-- Name: order_payment_paymentDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_payment_paymentDate_idx" ON public.order_payment USING btree ("paymentDate");


--
-- Name: order_payment_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_payment_status_idx ON public.order_payment USING btree (status);


--
-- Name: order_payment_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_payment_supplierId_idx" ON public.order_payment USING btree ("supplierId");


--
-- Name: order_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_status_idx ON public."order" USING btree (status);


--
-- Name: order_storeIntegrationId_externalOrderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "order_storeIntegrationId_externalOrderId_key" ON public."order" USING btree ("storeIntegrationId", "externalOrderId");


--
-- Name: order_storeIntegrationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_storeIntegrationId_idx" ON public."order" USING btree ("storeIntegrationId");


--
-- Name: order_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_userId_idx" ON public."order" USING btree ("userId");


--
-- Name: product_externalId_provider_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "product_externalId_provider_userId_key" ON public.product USING btree ("externalId", provider, "userId");


--
-- Name: product_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_isActive_idx" ON public.product USING btree ("isActive");


--
-- Name: product_isPublished_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_isPublished_idx" ON public.product USING btree ("isPublished");


--
-- Name: product_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_sku_idx ON public.product USING btree (sku);


--
-- Name: product_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_supplierId_idx" ON public.product USING btree ("supplierId");


--
-- Name: product_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_userId_idx" ON public.product USING btree ("userId");


--
-- Name: session_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX session_token_key ON public.session USING btree (token);


--
-- Name: session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "session_userId_idx" ON public.session USING btree ("userId");


--
-- Name: store_integration_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "store_integration_isActive_idx" ON public.store_integration USING btree ("isActive");


--
-- Name: store_integration_platform_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX store_integration_platform_idx ON public.store_integration USING btree (platform);


--
-- Name: store_integration_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "store_integration_userId_idx" ON public.store_integration USING btree ("userId");


--
-- Name: store_integration_userId_platform_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "store_integration_userId_platform_key" ON public.store_integration USING btree ("userId", platform);


--
-- Name: subscription_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscription_endDate_idx" ON public.subscription USING btree ("endDate");


--
-- Name: subscription_externalId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscription_externalId_idx" ON public.subscription USING btree ("externalId");


--
-- Name: subscription_history_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscription_history_userId_idx" ON public.subscription_history USING btree ("userId");


--
-- Name: subscription_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subscription_status_idx ON public.subscription USING btree (status);


--
-- Name: subscription_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "subscription_userId_idx" ON public.subscription USING btree ("userId");


--
-- Name: subscription_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "subscription_userId_key" ON public.subscription USING btree ("userId");


--
-- Name: supplier_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "supplier_isActive_idx" ON public.supplier USING btree ("isActive");


--
-- Name: supplier_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "supplier_userId_idx" ON public.supplier USING btree ("userId");


--
-- Name: tracking_events_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tracking_events_orderId_idx" ON public.tracking_events USING btree ("orderId");


--
-- Name: transaction_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transaction_createdAt_idx" ON public.transaction USING btree ("createdAt");


--
-- Name: transaction_referenceId_referenceType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transaction_referenceId_referenceType_idx" ON public.transaction USING btree ("referenceId", "referenceType");


--
-- Name: transaction_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transaction_type_idx ON public.transaction USING btree (type);


--
-- Name: transaction_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transaction_userId_idx" ON public.transaction USING btree ("userId");


--
-- Name: user_accessStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_accessStatus_idx" ON public."user" USING btree ("accessStatus");


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: verification_identifier_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX verification_identifier_idx ON public.verification USING btree (identifier);


--
-- Name: wallet_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "wallet_userId_idx" ON public.wallet USING btree ("userId");


--
-- Name: wallet_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wallet_userId_key" ON public.wallet USING btree ("userId");


--
-- Name: Fee Fee_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Fee"
    ADD CONSTRAINT "Fee_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FixedExpense FixedExpense_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FixedExpense"
    ADD CONSTRAINT "FixedExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Tax Tax_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tax"
    ADD CONSTRAINT "Tax_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meta_account meta_account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_account
    ADD CONSTRAINT "meta_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meta_pixel meta_pixel_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_pixel
    ADD CONSTRAINT "meta_pixel_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.product(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_payment order_payment_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_payment
    ADD CONSTRAINT "order_payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_payment order_payment_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_payment
    ADD CONSTRAINT "order_payment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.supplier(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order order_storeIntegrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_storeIntegrationId_fkey" FOREIGN KEY ("storeIntegrationId") REFERENCES public.store_integration(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product product_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.supplier(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product product_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT "product_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_integration store_integration_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_integration
    ADD CONSTRAINT "store_integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subscription_history subscription_history_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_history
    ADD CONSTRAINT "subscription_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subscription subscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: supplier supplier_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT "supplier_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tracking_events tracking_events_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_events
    ADD CONSTRAINT "tracking_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transaction transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wallet wallet_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet
    ADD CONSTRAINT "wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 85PK6OIG5L6ngdypvDHj8lzHMSr7L2cjfE5EF1lIWZ71drwbo80B0DepYcZsK1b

