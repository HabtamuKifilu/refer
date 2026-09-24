import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/api";
import { rejectReward } from "@/lib/rewards/service";
import { rejectRewardSchema } from "@/lib/validation/schemas";

/** POST /api/admin/rewards/[id]/reject -- admin only. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = rejectRewardSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid rejection data" },
      { status: 400 },
    );
  }

  const result = await rejectReward(id, {
    ...parsed.data,
    adminId: auth.user.id,
    adminName: auth.user.name,
    adminEmail: auth.user.email,
  });

  if (!result.ok) {
    if (result.reason === "not_found") {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    if (result.reason === "invalid_reason") {
      return NextResponse.json(
        { error: "Invalid rejection reason" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "That action is not allowed for the reward's current status" },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
