/**
 * API Route para criar wallet após sign-up
 * 
 * Pode ser chamado no cliente após sign-up bem-sucedido:
 * 
 * ```typescript
 * const { data } = await authClient.signUp.email({ ... });
 * if (data?.user) {
 *   await fetch('/api/users/create-wallet', { method: 'POST' });
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { getOrCreateWallet } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const wallet = await getOrCreateWallet(userId);

    return {
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance.toString(),
      },
    };
  });
}
