"use server";

import  prisma  from "@/lib/prisma"; // Ajuste o caminho do seu arquivo prisma

export async function saveDashboardLayout(userId: string, layout: any) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { dashboardLayout: layout },
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar layout:", error);
    return { success: false, error: "Falha ao salvar layout." };
  }
}