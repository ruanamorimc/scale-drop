import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function StartPage() {
  // 1. Pega o usuário logado
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) redirect("/login");

  // 2. VERIFICAÇÃO DE SEGURANÇA: 
  // Se o usuário já tiver um workspace, não deixa ele ficar na tela /start, manda direto pro dashboard!
  const existingWorkspace = await prisma.workspace.findFirst({
    where: { userId: user.id },
  });

  if (existingWorkspace) {
    redirect(`/${existingWorkspace.slug}/dashboard`);
  }

  // 3. SERVER ACTION: Função que roda no backend quando o formulário é enviado
  async function createWorkspace(formData: FormData) {
    "use server";
    
    const name = formData.get("workspaceName") as string;
    if (!name || name.trim() === "") return;

    const baseSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]+/g, "-")     
      .replace(/(^-|-$)+/g, "");       
      
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const slug = `${baseSlug}-${uniqueSuffix}`;

    await prisma.workspace.create({
      data: {
        name: name,
        slug: slug,
        userId: user!.id,
      },
    });

    // 🔥 2. A MÁGICA ACONTECE AQUI: Força o Next.js a esquecer o cache do layout e buscar os dados de novo!
    revalidatePath("/", "layout");

    redirect(`/${slug}/dashboard`);
  }

  // 4. INTERFACE DO USUÁRIO
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl">
        <div className="flex flex-col space-y-2 mb-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bem-vindo à Scale Drop!
          </h1>
          <p className="text-sm text-zinc-400">
            Para começarmos, dê um nome para a sua primeira operação.
          </p>
        </div>

        {/* Formulário chamando a Server Action */}
        <form action={createWorkspace} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="workspaceName" className="text-sm font-medium text-zinc-300">
              Nome da Operação
            </label>
            <input
              id="workspaceName"
              name="workspaceName"
              type="text"
              required
              placeholder="Ex: Minha Loja Principal"
              className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            Criar Operação e Entrar
          </button>
        </form>
      </div>
    </div>
  );
}