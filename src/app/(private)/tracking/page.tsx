import { redirect } from "next/navigation";
import { getOrdersForTracking } from "@/actions/order-actions";
import RastreioClient from "./RastreioClient";

export default async function TrackingRoute() {
  // 🔥 ATENÇÃO: Substitua essa linha pela forma real que você usa para pegar o usuário logado
  // Exemplo se você usa Supabase, Clerk ou NextAuth:
  const userId = "id_do_usuario_logado"; 
  
  if (!userId) {
    redirect("/login");
  }

  // A "Cozinha" indo no banco de dados buscar os pedidos reais
  const { data: orders } = await getOrdersForTracking(userId);

  // Entregando a bandeja (orders) para o "Salão" (RastreioClient)
  return <RastreioClient initialOrders={orders || []} />;
}