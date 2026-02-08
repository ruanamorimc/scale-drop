"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; // Certifique-se que o caminho está certo
import { headers } from "next/headers"; // <--- NECESSÁRIO PARA BETTER AUTH
import { Product } from "@/app/(private)/products/columns";

type PrismaProduct = NonNullable<
  Awaited<ReturnType<typeof prisma.product.findFirst>>
>;
// Helper: Converte os dados do Banco (Decimal) para o Frontend (Number)
function serializeProduct(p: PrismaProduct): Product {
  return {
    id: p.id,
    name: p.name,
    image: p.images[0] || "",
    status: p.isActive ? "active" : "paused",

    // Convertendo Decimal para Number
    stock: p.stockQuantity,
    salePrice: Number(p.salePrice),
    costPrice: Number(p.costPrice),
    taxML: Number(p.platformFee || 0), // Garante que não venha null
    shipping: Number(p.shippingFee || 0),

    category: p.category || "Sem categoria",
    store: p.storeName || p.provider || "Loja",

    sku: p.sku,
    externalId: p.externalId,
    supplierUrl: p.supplierUrl, // Garante que a URL do fornecedor seja passada para o frontend
  };
}

// --- 1. LISTAR PRODUTOS ---
export async function getProducts() {
  // CORREÇÃO BETTER AUTH 👇
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return products.map(serializeProduct);
}

// --- 2. SALVAR (CRIAR OU ATUALIZAR) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveProduct(product: any) {
  // Pode usar 'any' ou importar o tipo Product
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado" };
  }

  try {
    // Se o produto tiver ID, é uma ATUALIZAÇÃO (UPDATE)
    if (product.id && product.id !== "NOVO") {
      await prisma.product.update({
        where: {
          id: product.id,
          userId: session.user.id, // Segurança: garante que o produto é do usuário
        },
        data: {
          name: product.name,
          salePrice: product.salePrice,
          costPrice: product.costPrice,
          stockQuantity: product.stock, // Frontend manda 'stock', Banco usa 'stockQuantity'
          isActive: product.status === "active", // Frontend manda texto, Banco usa Boolean

          supplierUrl: product.supplierUrl,
          storeName: product.store,
          sku: product.sku,
          images: product.image ? [product.image] : [], // Banco espera um Array de Strings
        },
      });
    } else {
      // Se for CRIAÇÃO (CREATE) - Caso você use no futuro
      await prisma.product.create({
        data: {
          userId: session.user.id,
          name: product.name,
          salePrice: product.salePrice,
          costPrice: product.costPrice,
          stockQuantity: product.stock,
          isActive: product.status === "active",
          supplierUrl: product.supplierUrl, // <--- Adicione aqui também
          storeName: product.store || "Manual",
          sku: product.sku,
          images: [product.image || ""],
        },
      });
    }

    revalidatePath("/products");
    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("ERRO COMPLETO DO BANCO:", error);
    return { success: false, error: "Erro ao salvar no banco" };
  }
}

// --- 3. DELETAR ---
export async function deleteProduct(id: string) {
  // CORREÇÃO BETTER AUTH 👇
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) throw new Error("Não autorizado");

  try {
    await prisma.product.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao deletar." };
  }
}

//EXCLUIR DEPOIS

export async function generateTestProducts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { success: false, error: "Não autorizado" };
  }

  const categories = ["Eletrônicos", "Moda", "Casa", "Gamer", "Beleza"];
  const stores = ["Mercado Livre", "Shopee", "Amazon", "Manual"];
  const statuses = ["active", "paused"];

  // Loop para criar 10 produtos
  for (let i = 0; i < 10; i++) {
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const randomStatus = statuses[
      Math.floor(Math.random() * statuses.length)
    ] as "active" | "paused";
    const price = Math.floor(Math.random() * 500) + 50;

    await prisma.product.create({
      data: {
        userId: session.user.id,
        name: `Produto Teste ${Math.floor(Math.random() * 1000)} - ${randomCat}`,

        // O Schema pede um Array de Strings (String[])
        images: [
          `https://placehold.co/400x400/222/FFF?text=${randomCat.substring(0, 3).toUpperCase()}`,
        ],

        salePrice: price,
        costPrice: price * 0.6,
        stockQuantity: Math.floor(Math.random() * 100),
        category: randomCat,
        storeName: randomStore,

        // 👇 CORREÇÃO 1: Mapeando 'status' para 'isActive'
        isActive: randomStatus === "active",

        // 👇 CORREÇÃO 2: Removido 'provider' pois não existe no schema

        sku: `TEST-${Math.floor(Math.random() * 99999)}`,

        // Se 'externalId' der erro, troque por 'sku' ou remova,
        // mas na sua imagem ele parecia aceitar (talvez esteja mais pra cima no schema)
        // Se der erro, comente a linha abaixo:
        // externalId: `test_${Date.now()}_${i}`
      },
    });
  }

  revalidatePath("/products");
  return { success: true };
}
