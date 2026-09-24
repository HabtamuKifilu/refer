"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RewardStatus } from "@/lib/db/enums";
import { REJECTION_REASONS } from "@/lib/rewards/rejection-reasons";

/**
 * Approve / reject / mark-paid buttons for a single reward. Which buttons show
 * depends on the current status -- but the real authorization and transition
 * validation happen server-side; this only reflects it.
 */
export function RewardActions({
  rewardId,
  status,
}: {
  rewardId: string;
  status: RewardStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reasonCode, setReasonCode] = useState("");
  const [note, setNote] = useState("");

  async function act(action: "approve" | "pay") {
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/admin/rewards/${rewardId}/${action}`, {
      method: "POST",
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Action failed");
      setBusy(false);
      return;
    }

    router.refresh();
    setBusy(false);
  }

  async function reject() {
    if (!reasonCode) {
      setError("Please select a rejection reason.");
      return;
    }

    setBusy(true);
    setError(null);

    const res = await fetch(`/api/admin/rewards/${rewardId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reasonCode,
        note: note.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "Rejection failed");
      setBusy(false);
      return;
    }

    setShowRejectForm(false);
    setReasonCode("");
    setNote("");
    router.refresh();
    setBusy(false);
  }

  const btn =
    "rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-60";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        {status === RewardStatus.PENDING ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => act("approve")}
              className={`${btn} bg-brand hover:bg-brand-hover text-white`}
            >
              Approve
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setError(null);
                setShowRejectForm((current) => !current);
              }}
              className={`${btn} text-danger border-danger/30 border`}
            >
              Reject
            </button>
          </>
        ) : null}

        {status === RewardStatus.APPROVED ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => act("pay")}
            className={`${btn} bg-success text-white hover:opacity-90`}
          >
            Mark as paid
          </button>
        ) : null}

        {status === RewardStatus.PAID ? (
          <span className="text-success text-sm font-medium">Paid ✓</span>
        ) : null}

        {status === RewardStatus.REJECTED ? (
          <span className="text-muted text-sm">Rejected</span>
        ) : null}
      </div>

      {showRejectForm ? (
        <div className="w-72 rounded-lg border p-3 text-left">
          <label className="text-sm font-medium" htmlFor={`reason-${rewardId}`}>
            Rejection reason
          </label>

          <select
            id={`reason-${rewardId}`}
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
            disabled={busy}
            className="mt-1 w-full rounded-md border bg-transparent px-2 py-2 text-sm"
          >
            <option value="">Select a reason</option>
            {REJECTION_REASONS.map((reason) => (
              <option key={reason.code} value={reason.code}>
                {reason.label}
              </option>
            ))}
          </select>

          <label
            className="mt-3 block text-sm font-medium"
            htmlFor={`note-${rewardId}`}
          >
            Note <span className="text-muted font-normal">(optional)</span>
          </label>

          <textarea
            id={`note-${rewardId}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            disabled={busy}
            maxLength={500}
            rows={3}
            placeholder="Add context for the rejection..."
            className="mt-1 w-full rounded-md border bg-transparent px-2 py-2 text-sm"
          />

          <p className="text-muted mt-1 text-right text-xs">
            {note.length}/500
          </p>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowRejectForm(false);
                setReasonCode("");
                setNote("");
                setError(null);
              }}
              className={`${btn} border`}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={reject}
              className={`${btn} bg-danger text-white`}
            >
              {busy ? "Rejecting..." : "Confirm rejection"}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
