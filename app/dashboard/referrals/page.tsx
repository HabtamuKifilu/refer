import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { prisma, ReferralStatus } from "@/lib/db";
import { AppNav } from "@/components/ui/app-nav";
import { Card } from "@/components/ui/card";
import { ReferralBadge, RewardBadge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Successful Referrals",
};

const PAGE_SIZE = 20;

export default async function SuccessfulReferralsPage({
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
    referrerId: user.id,
    status: {
      in: [ReferralStatus.QUALIFIED, ReferralStatus.COMPLETED],
    },
  };

  const totalReferrals = await prisma.referral.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalReferrals / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const referrals = await prisma.referral.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      referralCode: true,
      status: true,
      createdAt: true,
      registeredAt: true,
      qualifiedAt: true,
      completedAt: true,
      referredUser: {
        select: {
          name: true,
          email: true,
        },
      },
      reward: {
        select: {
          amount: true,
          currency: true,
          status: true,
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
              Successful Referrals
            </h1>
            <p className="text-muted mt-1 text-sm">
              Referrals that have qualified or completed successfully.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-brand text-sm font-medium"
          >
            ← Back to dashboard
          </Link>
        </div>

        <Card className="mt-6 overflow-hidden p-0">
          {referrals.length === 0 ? (
            <div className="p-5">
              <p className="text-muted text-sm">
                No successful referrals yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted border-border border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Referred user</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">
                        Qualified / completed
                      </th>
                      <th className="px-4 py-3 font-medium">Reward</th>
                    </tr>
                  </thead>

                  <tbody>
                    {referrals.map((referral) => {
                      const milestone =
                        referral.completedAt ?? referral.qualifiedAt;

                      return (
                        <tr
                          key={referral.id}
                          className="border-border border-b last:border-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {referral.referredUser.name}
                          </td>

                          <td className="px-4 py-3">
                            {referral.referredUser.email}
                          </td>

                          <td className="px-4 py-3">
                            <ReferralBadge status={referral.status} />
                          </td>

                          <td className="text-muted px-4 py-3">
                            {milestone
                              ? formatDateTime(milestone)
                              : "—"}
                          </td>

                          <td className="px-4 py-3">
                            {referral.reward ? (
                              <span className="flex items-center gap-2">
                                {formatCurrency(
                                  referral.reward.amount,
                                  referral.reward.currency,
                                )}
                                <RewardBadge
                                  status={referral.reward.status}
                                />
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-border flex items-center justify-between border-t px-4 py-3">
                <span className="text-muted text-sm">
                  Page {currentPage} of {totalPages} · {totalReferrals}{" "}
                  successful referrals
                </span>

                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={`/dashboard/referrals?page=${currentPage - 1}`}
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
                      href={`/dashboard/referrals?page=${currentPage + 1}`}
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
