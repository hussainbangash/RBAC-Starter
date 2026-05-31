import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, clearRateLimitBuckets } from "./rate-limit";

describe("rate limit", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  it("allows requests until the limit is reached", () => {
    expect(checkRateLimit("login:test", 2, 60_000, 0).allowed).toBe(true);
    expect(checkRateLimit("login:test", 2, 60_000, 1).allowed).toBe(true);
    expect(checkRateLimit("login:test", 2, 60_000, 2).allowed).toBe(false);
  });

  it("resets after the window passes", () => {
    expect(checkRateLimit("login:test", 1, 60_000, 0).allowed).toBe(true);
    expect(checkRateLimit("login:test", 1, 60_000, 1).allowed).toBe(false);
    expect(checkRateLimit("login:test", 1, 60_000, 60_001).allowed).toBe(true);
  });
});
