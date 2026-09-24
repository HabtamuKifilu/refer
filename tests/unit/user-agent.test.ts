import { describe, expect, it } from "vitest";
import { getDeviceAndBrowser } from "@/lib/utils/user-agent";

describe("getDeviceAndBrowser", () => {
  it("detects desktop Chrome", () => {
    expect(
      getDeviceAndBrowser(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
      ),
    ).toBe("Desktop · Chrome");
  });

  it("detects desktop Firefox", () => {
    expect(
      getDeviceAndBrowser(
        "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
      ),
    ).toBe("Desktop · Firefox");
  });

  it("detects Edge before Chrome", () => {
    expect(
      getDeviceAndBrowser(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
      ),
    ).toBe("Desktop · Edge");
  });

  it("detects Opera before Chrome", () => {
    expect(
      getDeviceAndBrowser(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/116.0.0.0",
      ),
    ).toBe("Desktop · Opera");
  });

  it("detects mobile Safari", () => {
    expect(
      getDeviceAndBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Mobile · Safari");
  });

  it("detects Android Chrome as mobile", () => {
    expect(
      getDeviceAndBrowser(
        "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
      ),
    ).toBe("Mobile · Chrome");
  });

  it("handles missing user agents", () => {
    expect(getDeviceAndBrowser(null)).toBe(
      "Unknown device · Unknown browser",
    );
  });
});
