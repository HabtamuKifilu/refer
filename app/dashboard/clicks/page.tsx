import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { AppNav } from "@/components/ui/app-nav";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils/format";
import { getDeviceAndBrowser } from "@/lib/utils/user-agent";

export const metadata: Metadata = {
  title: "Referral Clicks",
};

const PAGE_SIZE = 20;

export default async function ReferralClicksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();

  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const totalClicks = await prisma.referralClick.count({
    where: { referrerId: user.id },
  });

  const totalPages = Math.max(1, Math.ceil(totalClicks / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const clicks = await prisma.referralClick.findMany({
    where: { referrerId: user.id },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      referralCode: true,
      landingPage: true,
      userAgent: true,
      createdAt: true,
    },
  });

  return (
    <>
      <AppNav user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Referral Clicks
            </h1>
            <p className="text-muted mt-1 text-sm">
              All clicks on your referral links.
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
          {clicks.length === 0 ? (
            <div className="p-5">
              <p className="text-muted text-sm">
                No referral clicks yet.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted border-border border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Referral code</th>
                      <th className="px-4 py-3 font-medium">Landing page</th>
                      <th className="px-4 py-3 font-medium">
                        Device / Browser
                      </th>
                      <th className="px-4 py-3 font-medium">Date & time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clicks.map((click) => (
                      <tr
                        key={click.id}
                        className="border-border border-b last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          {click.referralCode}
                        </td>

                        <td className="px-4 py-3">
                          {click.landingPage}
                        </td>

                        <td className="text-muted px-4 py-3">
                          {getDeviceAndBrowser(click.userAgent)}
                        </td>

                        <td className="text-muted px-4 py-3">
                          {formatDateTime(click.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-border flex items-center justify-between border-t px-4 py-3">
                <span className="text-muted text-sm">
                  Page {currentPage} of {totalPages} · {totalClicks} clicks
                </span>

                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={`/dashboard/clicks?page=${currentPage - 1}`}
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
                      href={`/dashboard/clicks?page=${currentPage + 1}`}
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
