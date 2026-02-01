import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { BadgeCheck, Candy, Citrus, Shield } from "lucide-react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import EditUser from "@/components/profile/EditUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getServerSession } from "@/lib/get-session"; // <--- Importação da sessão

const ProfilePage = async () => {
  // 1. Buscando os dados reais da sessão
  const session = await getServerSession();
  const user = session?.user;

  // Lógica simples para pegar as iniciais (ex: "Ruan Amorim" -> "RA" ou "R")
  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "U";
  };

  return (
    <div className="">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/profile">Perfil</BreadcrumbLink>
          </BreadcrumbItem>
          {/* Nome Dinâmico no Breadcrumb 
            <BreadcrumbPage>{user?.name || "Usuário"}</BreadcrumbPage>
            */}
        </BreadcrumbList>
      </Breadcrumb>

      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LADO ESQUERDO */}
        <div className="w-full xl:w-1/3 space-y-6">
          <div className="bg-primary-foreground p-4 rounded-lg">
            {/* USER BADGES CONTAINER */}{" "}
            <h1 className="text-xl font-semibold">Insígnias de usuário</h1>
            <div className="flex gap-4 mt-4">
              <HoverCard>
                <HoverCardTrigger>
                  <BadgeCheck
                    size={36}
                    className="rounded-full bg-blue-500/30 border-2 border-blue-500/50 p-2"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  {" "}
                  <h1 className="font-bold mb-2">Usuário Verificado</h1>
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    Este usuário foi verificado pelo administrador.
                  </p>
                </HoverCardContent>
              </HoverCard>
              <HoverCard>
                <HoverCardTrigger>
                  <Shield
                    size={36}
                    className="rounded-full bg-green-800/30 border-2 border-green-800/50 p-2"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  {" "}
                  <h1 className="font-bold mb-2">Admin</h1>
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    Os usuários administradores têm acesso a todos os recursos e
                    podem gerenciar usuários.
                  </p>
                </HoverCardContent>
              </HoverCard>
              <HoverCard>
                <HoverCardTrigger>
                  <Candy
                    size={36}
                    className="rounded-full bg-yellow-500/30 border-2 border-yellow-500/50 p-2"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  {" "}
                  <h1 className="font-bold mb-2">Premiado</h1>
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    Este usuário foi premiado por suas contribuições.
                  </p>
                </HoverCardContent>
              </HoverCard>
              <HoverCard>
                <HoverCardTrigger>
                  <Citrus
                    size={36}
                    className="rounded-full bg-orange-500/30 border-2 border-orange-500/50 p-2"
                  />
                </HoverCardTrigger>
                <HoverCardContent>
                  {" "}
                  <h1 className="font-bold mb-2">Popular</h1>
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    Este usuário tem sido popular na comunidade.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          <div className="bg-primary-foreground p-4 rounded-lg">
            {/* INFORMATION CONTAINER */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Informações do usuário</h1>
              <EditUser user={user} />
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex flex-col gap-2 mb-8">
                <p className="text-sm text-muted-foreground">
                  Conclusão do perfil
                </p>
                <Progress value={66} />
              </div>

              {/* DADOS REAIS DO USUÁRIO */}
              <div className="flex items-center gap-2">
                <span className="font-bold">Nome:</span>
                <span className="">{user?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Email:</span>
                <span className="">{user?.email}</span>
              </div>

              {/* Nota: Se o seu objeto 'user' tiver telefone, troque abaixo por user.phone */}
              <div className="flex items-center gap-2">
                <span className="font-bold">Número:</span>
                <span className="">+55 82 99603-8920</span>
              </div>

              {/* Nota: O plano geralmente vem do banco de dados, não da sessão pura. Mantive estático */}
              <div className="flex items-center gap-2">
                <span className="font-bold">Plano:</span>
                <Badge>Essential</Badge>
              </div>
            </div>
          </div>

          <div className="bg-primary-foreground p-4 rounded-lg">
            {/* CARD LIST CONTAINER */}
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="w-full xl:w-2/3 space-y-6">
          <div className="bg-primary-foreground p-4 rounded-lg">
            {/* USER CARD CONTAINER COM DADOS REAIS */}
            <div className="flex items-center gap-2">
              <Avatar className="size-12">
                {/* Imagem real do usuário */}
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />

                {/* Fallback com iniciais reais */}
                <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
              </Avatar>

              {/* Nome real no título */}
              <h1 className="text-xl font-semibold">{user?.name}</h1>
            </div>
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg">
            {/* CHART CONTAINER */}
            Chart
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
