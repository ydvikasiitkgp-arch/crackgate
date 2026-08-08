import { describe, expect, it } from "vitest";
import { canonicalMockId, resolveMock } from "@/lib/mock-registry";

describe("canonicalMockId", () => {
  it("strips a trailing version suffix", () => {
    expect(canonicalMockId("diploma-ncl-sirdar-mock-02-v3")).toBe(
      "diploma-ncl-sirdar-mock-02",
    );
    expect(canonicalMockId("diploma-ncl-sirdar-mock-02-v2")).toBe(
      "diploma-ncl-sirdar-mock-02",
    );
  });

  it("leaves unversioned ids untouched", () => {
    expect(canonicalMockId("diploma-ncl-sirdar-mock-02")).toBe(
      "diploma-ncl-sirdar-mock-02",
    );
    expect(canonicalMockId("mock-01")).toBe("mock-01");
  });
});

describe("resolveMock legacy fallback", () => {
  it("resolves the current bank for a versioned id", () => {
    const current = resolveMock("diploma-ncl-sirdar-mock-02-v3");
    expect(current?.id).toBe("diploma-ncl-sirdar-mock-02-v3");
  });

  it("resolves an older versioned refId to the current bank", () => {
    const legacy = resolveMock("diploma-ncl-sirdar-mock-02-v2");
    expect(legacy).not.toBeNull();
    expect(legacy?.id).toBe("diploma-ncl-sirdar-mock-02-v3");
  });

  it("still returns null for unknown ids", () => {
    expect(resolveMock("diploma-ncl-sirdar-mock-99")).toBeNull();
  });
});
