/**
 * API Route exemplo: Listar transações do wallet
 */

import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api-helpers";
import { getTransactionHistory } from "@/lib/wallet";

export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type") as "CREDIT" | "DEBIT" | null;

    const result = await getTransactionHistory(userId, {
      limit,
      offset,
      type: type || undefined,
    });

    return {
      transactions: result.transactions.map((t) => ({
        ...t,
        amount: t.amount.toString(),
        balanceAfter: t.balanceAfter.toString(),
      })),
      total: result.total,
      hasMore: result.hasMore,
    };
  });
}
