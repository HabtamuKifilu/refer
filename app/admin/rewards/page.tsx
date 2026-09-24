import type { Metadata } from "next";
import { RewardStatus } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/current-user";
import { getAllRewards } from "@/lib/admin/queries";
import { AppNav } from "@/components/ui/app-nav";
import { Card } from "@/components/ui/card";
import { RewardBadge } from "@/components/ui/badge";
import { RewardActions } from "@/components/admin/reward-actions";
import { getRejectionReasonLabel } from "@/lib/rewards/rejection-reasons";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin · Rewards" };

export default async function AdminRewardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const status = Object.values(RewardStatus).includes(
    params.status as RewardStatus,
  )
    ? (params.status as RewardStatus)
    : undefined;
  const rewards = await getAllRewards(status);

  return (
    <>
      <AppNav user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Rewards</h1>
        <p className="text-muted mt-1">
          Approve, reject, and mark rewards as paid.
        </p>

        {rewards.length === 0 ? (
          <Card className="mt-6">
            <p className="text-muted text-sm">No rewards yet.</p>
          </Card>
        ) : (
          <div className="mt-6 space-y-3">
            {rewards.map((reward) => (
              <Card key={reward.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(reward.amount, reward.currency)}
                      </span>
                      <RewardBadge status={reward.status} />
                    </div>
                    <dl className="text-muted mt-2 space-y-0.5 text-sm">
                      <div className="flex gap-1">
                        <dt>Referrer:</dt>
                        <dd className="text-ink font-medium">
                          {reward.user.name}
                        </dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Referred:</dt>
                        <dd className="text-ink font-medium">
                          {reward.referral.referredUser.name}
                        </dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Created:</dt>
                        <dd>{formatDate(reward.createdAt)}</dd>
                      </div>
                    </dl>

                    {reward.rejection ? (
                      <div className="border-danger/20 bg-danger/5 mt-3 rounded-lg border p-3">
                        <p className="text-danger text-xs font-semibold tracking-wide uppercase">
                          Rejection details
                        </p>
                        <dl className="text-muted mt-2 space-y-1 text-sm">
                          {reward.rejection.reasonCode ? (
                            <div className="flex gap-1">
                              <dt>Reason:</dt>
                              <dd className="text-ink font-medium">
                                {getRejectionReasonLabel(
                                  reward.rejection.reasonCode as Parameters<
                                    typeof getRejectionReasonLabel
                                  >[0],
                                )}
                              </dd>
                            </div>
                          ) : null}
                          <div className="flex gap-1">
                            <dt>Rejected:</dt>
                            <dd>{formatDateTime(reward.rejection.rejectedAt)}</dd>
                          </div>
                          {reward.rejection.rejectedByName ? (
                            <div className="flex gap-1">
                              <dt>Rejected by:</dt>
                              <dd className="text-ink font-medium">
                                {reward.rejection.rejectedByName}
                              </dd>
                            </div>
                          ) : null}
                          {reward.rejection.rejectedByEmail ? (
                            <div className="flex gap-1">
                              <dt>Admin email:</dt>
                              <dd>{reward.rejection.rejectedByEmail}</dd>
                            </div>
                          ) : null}
                          {reward.rejection.previousStatus ? (
                            <div className="flex gap-1">
                              <dt>Previous status:</dt>
                              <dd>{reward.rejection.previousStatus}</dd>
                            </div>
                          ) : null}
                          {reward.rejection.note ? (
                            <div className="flex gap-1">
                              <dt>Note:</dt>
                              <dd>{reward.rejection.note}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>
                    ) : null}
                  </div>
                  <RewardActions rewardId={reward.id} status={reward.status} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
