import type { ReactNode } from "react";
import Link from "next/link";

/** Centered authentication layout shared by the login and register pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center text-2xl font-bold tracking-tight"
        >
          REWAR<span className="text-brand">DO</span>
        </Link>

        <div className="border-border bg-surface rounded-2xl border p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-muted mt-2 text-sm">{subtitle}</p>
          </div>

          {children}
        </div>

        <p className="text-muted mt-6 text-center text-sm">{footer}</p>
      </div>
    </main>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>

      <div className="mt-1.5">{children}</div>

      {error ? (
        <p role="alert" className="text-danger mt-1 text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm " +
  "placeholder:text-muted focus:border-brand focus-visible:outline-brand";
