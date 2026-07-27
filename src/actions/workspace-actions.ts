"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session"; // Ajuste o caminho conforme o seu projeto

export async function createWorkspaceAction(name: string) {
  try {
    const session = await getServerSession();
    const user = session?.user;

    if (!user) {
      return { success: false, error: "Usuário não autenticado." };
    }

    if (!name || name.trim() === "") {
      return { success: false, error: "O nome do workspace é obrigatório." };
    }

    // 1. Gera um slug amigável e único a partir do nome
    // Ex: "Minha Loja 123" -> "minha-loja-123"
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
      .replace(/[\s_-]+/g, "-") // Troca espaços por hífens
      .replace(/^-+|-+$/g, ""); // Remove hífens sobrando no começo e fim

    if (!baseSlug) baseSlug = "workspace"; // Fallback caso o nome seja muito estranho

    let uniqueSlug = baseSlug;
    let counter = 1;
    let slugExists = true;

    // Garante que o slug é único no banco de dados
    while (slugExists) {
      const existing = await prisma.workspace.findUnique({
        where: { slug: uniqueSlug },
      });
      if (existing) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        slugExists = false;
      }
    }

    // 2. Cria o Workspace no banco de dados
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        userId: user.id,
      },
    });

    // 3. Retorna o slug para o frontend poder redirecionar a URL
    return { success: true, slug: newWorkspace.slug };
  } catch (error) {
    console.error("Erro ao criar workspace:", error);
    return { success: false, error: "Erro interno ao criar o workspace." };
  }
}