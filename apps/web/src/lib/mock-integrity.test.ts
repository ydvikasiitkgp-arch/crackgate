import { describe, expect, it } from "vitest";
import { allMockIds, resolveMock } from "@/lib/mock-registry";

// Structural integrity for every resolvable mock: every registered id resolves
// to a non-empty question set, and each question has a valid shape (stem,
// subject, options, and in-range answer indexes) so a bad edit anywhere in the
// data files breaks CI instead of shipping a broken paper.
describe("mock registry integrity", () => {
  const ids = allMockIds();

  it("resolves every registered mock id", () => {
    for (const id of ids) {
      const m = resolveMock(id);
      expect(m, `resolveMock(${id}) returned null`).not.toBeNull();
      expect(m!.questions.length, `${id} has no questions`).toBeGreaterThan(0);
    }
  });

  it("has structurally valid questions in every mock", () => {
    for (const id of ids) {
      const seenIds = new Set<string>();
      for (const q of resolveMock(id)!.questions) {
        const where = `${id} q:${String((q as { id?: unknown }).id ?? "")} "${String(q.subject).slice(0, 40)}"`;

        expect(typeof q.subject, `${where} missing subject`).toBe("string");
        expect(q.subject.length, `${where} empty subject`).toBeGreaterThan(0);

        const idProp = (q as { id?: unknown }).id;
        if (idProp !== undefined) {
          const key = typeof idProp === "number" ? String(idProp) : `${typeof idProp}:${idProp}`;
          expect(seenIds.has(key), `${where} duplicate id ${key}`).toBe(false);
          seenIds.add(key);
        }

        const type = String(q.type).toLowerCase();
        expect(["mcq", "msq", "nat"].includes(type), `${where} unknown type ${q.type}`).toBe(true);

        if (type === "mcq" || type === "msq") {
          const options = (q as { options?: string[] }).options ?? [];
          expect(options.length, `${where} needs >= 4 options`).toBeGreaterThanOrEqual(4);
          expect(options.length, `${where} has > 6 options`).toBeLessThanOrEqual(6);
          expect(options.every((o) => typeof o === "string" && o.length > 0), `${where} blank option`).toBe(true);
          expect(new Set(options).size, `${where} duplicate options`).toBe(options.length);

          const answers = Array.isArray(q.answer) ? (q.answer as number[]) : [q.answer as number];
          for (const a of answers) {
            expect(Number.isInteger(a), `${where} non-integer answer`).toBe(true);
            expect(a, `${where} answer out of range`).toBeGreaterThanOrEqual(0);
            expect(a, `${where} answer out of range`).toBeLessThan(options.length);
          }
        }

        if (type === "nat") {
          expect(typeof q.answer, `${where} NAT answer must be numeric`).toBe("number");
        }
      }
    }
  });
});
