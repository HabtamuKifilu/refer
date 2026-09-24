import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/current-user";
import { getAllUsers } from "@/lib/admin/queries";
import { AppNav } from "@/components/ui/app-nav";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Admin · Users",
};

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAdmin();

  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const firstResult = await getAllUsers(
    (page - 1) * PAGE_SIZE,
    PAGE_SIZE,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(firstResult.totalUsers / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);

  const result =
    currentPage === page
      ? firstResult
      : await getAllUsers(
          (currentPage - 1) * PAGE_SIZE,
          PAGE_SIZE,
        );

  return (
    <>
      <AppNav user={user} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
            <p className="text-muted mt-1 text-sm">
              All registered users in the program.
            </p>
          </div>

          <Link
            href="/admin"
            className="text-brand text-sm font-medium"
          >
            ← Back to admin
          </Link>
        </div>

        <Card className="mt-6 overflow-hidden p-0">
          {result.users.length === 0 ? (
            <div className="p-5">
              <p className="text-muted text-sm">No users yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted border-border border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">
                        Referral code
                      </th>
                      <th className="px-4 py-3 font-medium">Profile</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-border border-b last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-muted text-xs">
                            {user.email}
                          </div>
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {user.role}
                        </td>

                        <td className="px-4 py-3 font-mono text-sm">
                          {user.referralCode}
                        </td>

                        <td className="px-4 py-3">
                          {user.profileComplete ? (
                            <span className="text-brand font-medium">
                              Complete
                            </span>
                          ) : (
                            <span className="text-muted">Incomplete</span>
                          )}
                        </td>

                        <td className="text-muted px-4 py-3">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-border flex items-center justify-between border-t px-4 py-3">
                <span className="text-muted text-sm">
                  Page {currentPage} of {totalPages} · {result.totalUsers} users
                </span>

                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={`/admin/users?page=${currentPage - 1}`}
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
                      href={`/admin/users?page=${currentPage + 1}`}
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
