export const REJECTION_REASONS = [
  {
    code: "INVALID_REFERRAL",
    label: "Invalid referral",
  },
  {
    code: "DUPLICATE_REFERRAL",
    label: "Duplicate referral",
  },
  {
    code: "NOT_ELIGIBLE",
    label: "Eligibility requirement not met",
  },
  {
    code: "INVALID_INFORMATION",
    label: "Invalid or incomplete information",
  },
  {
    code: "SUSPICIOUS_ACTIVITY",
    label: "Suspicious activity",
  },
  {
    code: "OTHER",
    label: "Other",
  },
] as const;

export type RejectionReasonCode =
  (typeof REJECTION_REASONS)[number]["code"];

export function getRejectionReasonLabel(
  code: RejectionReasonCode,
): string {
  return (
    REJECTION_REASONS.find((reason) => reason.code === code)?.label ?? code
  );
}
