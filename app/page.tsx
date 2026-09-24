import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Connect. Refer. Reward.",
};

const STEPS = [
  {
    title: "Connect with your network",
    body: "Build meaningful connections and introduce people to opportunities through your personal referral network.",
  },
  {
    title: "Share your referral link",
    body: "Every account gets a unique referral code and a trackable link you can share with your network.",
  },
  {
    title: "Earn your reward",
    body: `When your referral completes their profile, a ₹${env.REFERRAL_REWARD_AMOUNT} reward is queued for approval.`,
  },
] as const;

export default function HomePage() {
  return (
    <>
      <header className="border-border bg-surface border-b">
        <nav
          className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4"
          aria-label="Main"
        >
          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
            aria-label="Rewardo home"
          >
            REWAR<span className="text-brand">DO</span>
          </Link>

          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="secondary">
              Log in
            </ButtonLink>
            <ButtonLink href="/register">Get started</ButtonLink>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <section className="py-16 sm:py-24">
          <p className="text-brand text-sm font-semibold">
            Connect. Refer. Reward.
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Turn your connections into rewards
          </h1>

          <p className="text-muted mt-4 max-w-2xl text-lg text-pretty">
            Rewardo makes referrals simple. Connect with your network, share
            your personal referral link, and earn rewards when your referrals
            complete the required steps.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/register" size="lg">
              Create your link
            </ButtonLink>

            <ButtonLink href="/login" variant="secondary" size="lg">
              I already have an account
            </ButtonLink>
          </div>
        </section>

        <section aria-labelledby="how-it-works" className="pb-20">
          <h2 id="how-it-works" className="text-xl font-semibold">
            How Rewardo works
          </h2>

          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="border-border bg-surface rounded-xl border p-5"
              >
                <span className="bg-brand-soft text-brand flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                  {index + 1}
                </span>

                <h3 className="mt-4 font-medium">{step.title}</h3>

                <p className="text-muted mt-1 text-sm text-pretty">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-border bg-surface border-t">
        <div className="text-muted mx-auto max-w-5xl px-4 py-6 text-sm">
          REWARDO — Connect. Refer. Reward. Rewards are paid in{" "}
          {env.REFERRAL_REWARD_CURRENCY}.
        </div>
      </footer>
    </>
  );
}
