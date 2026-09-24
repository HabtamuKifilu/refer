export function getDeviceAndBrowser(userAgent: string | null): string {
  if (!userAgent) return "Unknown device · Unknown browser";

  const device =
    /iPhone|iPad|Android.*Mobile|Mobile/i.test(userAgent)
      ? "Mobile"
      : /Android/i.test(userAgent)
        ? "Tablet"
        : "Desktop";

  let browser = "Unknown browser";

  if (/Brave\//i.test(userAgent)) {
    browser = "Brave";
  } else if (/Edg\//i.test(userAgent)) {
    browser = "Edge";
  } else if (/OPR\//i.test(userAgent)) {
    browser = "Opera";
  } else if (/Chrome\//i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Firefox\//i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    browser = "Safari";
  }

  return `${device} · ${browser}`;
}
