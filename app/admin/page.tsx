import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { getAdminAnalytics } from "@/lib/admin/analytics";
import { ReferralFunnelChart } from "@/components/admin/analytics/ReferralFunnelChart";
import { getAdminStats } from "@/lib/referrals/stats";
import { AppNav } from "@/components/ui/app-nav";
import { Stat } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireAdmin();
  const [stats, analytics] = await Promise.all([getAdminStats(), getAdminAnalytics()]);

  return (
    <>
      <AppNav user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin dashboard
          </h1>
          <div className="flex gap-3 text-sm">
            <Link href="/admin/referrals" className="text-brand font-medium">
              Referrals
            </Link>
            <Link href="/admin/rewards" className="text-brand font-medium">
              Rewards
            </Link>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-muted text-sm font-semibold">Activity</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Link href="/admin/users" className="block">
              <Stat label="Users" value={stats.totalUsers} />
            </Link>
            <Link href="/admin/clicks" className="block">
              <Stat label="Referral clicks" value={stats.totalClicks} />
            </Link>
            <Link href="/admin/referrals" className="block">
              <Stat label="Referrals" value={stats.totalReferrals} />
            </Link>
            <Link href="/admin/referrals?status=QUALIFIED" className="block">
              <Stat label="Qualified" value={stats.qualifiedReferrals} />
            </Link>
            <Link href="/admin/referrals?status=COMPLETED" className="block">
              <Stat label="Completed" value={stats.completedReferrals} />
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-muted text-sm font-semibold">Rewards</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-5">
            <Link href="/admin/rewards?status=PENDING" className="block">
              <Stat
                label="Pending"
                value={formatCurrency(stats.pendingRewardsAmount)}
              />
            </Link>
            <Link href="/admin/rewards?status=APPROVED" className="block">
              <Stat
                label="Approved"
                value={formatCurrency(stats.approvedRewardsAmount)}
              />
            </Link>
            <Link href="/admin/rewards?status=PAID" className="block">
              <Stat
                label="Paid"
                value={formatCurrency(stats.paidRewardsAmount)}
              />
            </Link>
            <Link href="/admin/rewards?status=REJECTED" className="block">
              <Stat
                label="Rejected"
                value={formatCurrency(stats.rejectedRewardsAmount)}
              />
            </Link>
            <Link href="/admin/rewards" className="block">
              <Stat
                label="Total"
                value={formatCurrency(stats.totalRewardAmount)}
              />
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-muted text-sm font-semibold">Referral analytics</h2>
          <div className="mt-3">
            <ReferralFunnelChart data={analytics.funnel} />
          </div>
        </section>
      </main>
    </>
  );
}
