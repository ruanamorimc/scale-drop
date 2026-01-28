/**
 * API Route para onboarding de usuário
 * Cria wallet e recursos iniciais após sign-up
 * 
 * Pode ser chamado após o sign-up do Better Auth
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { onCreateUser } from "@/lib/user-hooks";

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    // Cria recursos iniciais (wallet, etc)
    await onCreateUser(userId);

    return {
      success: true,
      message: "Recursos iniciais criados com sucesso",
    };
  });
}
