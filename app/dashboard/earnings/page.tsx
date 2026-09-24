import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { prisma, RewardStatus } from "@/lib/db";
import { AppNav } from "@/components/ui/app-nav";
import { Card } from "@/components/ui/card";
import { RewardBadge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Total Earned",
};

const PAGE_SIZE = 20;

export default async function TotalEarnedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();

  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const where = {
    userId: user.id,
    status: {
      in: [RewardStatus.APPROVED, RewardStatus.PAID],
    },
  };

  const [totalRewards, totalEarnedResult] = await Promise.all([
    prisma.reward.count({ where }),
    prisma.reward.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalRewards / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const totalEarned = totalEarnedResult._sum.amount ?? 0;

  const rewards = await prisma.reward.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      reason: true,
      createdAt: true,
      approvedAt: true,
      paidAt: true,
      referral: {
        select: {
          referralCode: true,
          referredUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return (
    <>
      <AppNav user={user} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Total Earned
            </h1>
            <p className="text-muted mt-1 text-sm">
              Approved and paid rewards you have earned.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-brand text-sm font-medium"
          >
            ← Back to dashboard
          </Link>
        </div>

        <Card className="mt-6">
          <p className="text-muted text-sm">Total earned</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatCurrency(totalEarned)}
          </p>
        </Card>

        <Card className="mt-4 overflow-hidden p-0">
          {rewards.length === 0 ? (
            <div className="p-5">
              <p className="text-muted text-sm">
                No earned rewards yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted border-border border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Reward</th>
                      <th className="px-4 py-3 font-medium">Referred user</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Referral code</th>
                      <th className="px-4 py-3 font-medium">Reason</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Approved</th>
                      <th className="px-4 py-3 font-medium">Paid</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rewards.map((reward) => (
                      <tr
                        key={reward.id}
                        className="border-border border-b last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {formatCurrency(
                                reward.amount,
                                reward.currency,
                              )}
                            </span>
                            <RewardBadge status={reward.status} />
                          </div>
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {reward.referral.referredUser.name}
                        </td>

                        <td className="px-4 py-3">
                          {reward.referral.referredUser.email}
                        </td>

                        <td className="px-4 py-3">
                          {reward.referral.referralCode}
                        </td>

                        <td className="px-4 py-3">
                          {reward.reason}
                        </td>

                        <td className="text-muted px-4 py-3">
                          {formatDateTime(reward.createdAt)}
                        </td>

                        <td className="text-muted px-4 py-3">
                          {reward.approvedAt
                            ? formatDateTime(reward.approvedAt)
                            : "—"}
                        </td>

                        <td className="text-muted px-4 py-3">
                          {reward.paidAt
                            ? formatDateTime(reward.paidAt)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-border flex items-center justify-between border-t px-4 py-3">
                <span className="text-muted text-sm">
                  Page {currentPage} of {totalPages} · {totalRewards}{" "}
                  earned rewards
                </span>

                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={`/dashboard/earnings?page=${currentPage - 1}`}
                      className="border-border rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted/10"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="border-border text-muted rounded-lg border px-3 py-1.5 text-sm">
                      Previous
                    </span>
                  )}

                  {currentPage < totalPages ? (
                    <Link
                      href={`/dashboard/earnings?page=${currentPage + 1}`}
                      className="border-border rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted/10"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="border-border text-muted rounded-lg border px-3 py-1.5 text-sm">
                      Next
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </main>
    </>
  );
}
