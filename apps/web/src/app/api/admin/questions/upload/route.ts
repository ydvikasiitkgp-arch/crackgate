/** POST /api/admin/questions/upload
 *
 *  Admin-only. Appends questions to a per-subject JSON file under
 *  apps/web/src/data/questions/practice/<slug>.json, auto-assigning
 *  unique ids, then re-runs the mock generator (skips locked mocks).
 *
 *  Dev-only by design — writes to the source tree on disk.
 */
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";

const execFileP = promisify(execFile);
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MCQ = z.object({
  topic: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.literal("MCQ"),
  stem: z.string().min(5),
  options: z.array(z.string().min(1)).min(2).max(6),
  answer: z.number().int().nonnegative(),
  solution: z.string().min(2),
});
const MSQ = z.object({
  topic: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.literal("MSQ"),
  stem: z.string().min(5),
  options: z.array(z.string().min(1)).min(2).max(6),
  answer: z.array(z.number().int().nonnegative()).min(1),
  solution: z.string().min(2),
});
const NAT = z.object({
  topic: z.string().min(2),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.literal("NAT"),
  stem: z.string().min(5),
  answer: z.number(),
  tolerance: z.number().nonnegative().default(0.01),
  solution: z.string().min(2),
});
const Question = z.discriminatedUnion("type", [MCQ, MSQ, NAT]);

const SUBJECT_SLUGS = [
  "engineering-mathematics", "general-aptitude", "mine-ventilation",
  "rock-mechanics", "surface-mining", "underground-mining",
  "drilling-blasting", "mineral-processing", "mine-surveying",
  "mine-environment",
] as const;

const Body = z.object({
  subjectSlug: z.enum(SUBJECT_SLUGS),
  questions: z.array(Question).min(1).max(500),
  rebuildMocks: z.boolean().optional().default(true),
});

// dev:web runs with cwd=apps/web; build_mocks needs the repo root.
function findRepoRoot(): string {
  const cwd = process.cwd();
  return cwd.endsWith("apps/web") ? resolve(cwd, "../..") : cwd;
}

export async function POST(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_RUNTIME_QUESTION_UPLOAD !== "1") {
    return NextResponse.json({
      error: "disabled_in_production",
      message: "Runtime uploads are off in prod. Edit the JSON files locally, commit, and redeploy.",
    }, { status: 400 });
  }

  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid_json";
    return NextResponse.json({ error: "invalid_body", message: msg }, { status: 400 });
  }

  const repoRoot = findRepoRoot();
  const subjectFile = resolve(repoRoot, "apps/web/src/data/questions/practice", `${parsed.subjectSlug}.json`);

  let payload: { slug: string; name: string; questions: Array<Record<string, unknown>> };
  try {
    payload = JSON.parse(await fs.readFile(subjectFile, "utf8"));
  } catch (err) {
    return NextResponse.json({
      error: "subject_file_not_found",
      path: subjectFile,
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }

  // Find the highest existing per-difficulty sequence so new ids are unique.
  const usedNums: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  const idRe = new RegExp(`^${parsed.subjectSlug}-(easy|medium|hard)-(\\d+)$`);
  for (const q of payload.questions) {
    const m = String(q.id ?? "").match(idRe);
    if (m) {
      const n = parseInt(m[2], 10);
      if (n > usedNums[m[1]]) usedNums[m[1]] = n;
    }
  }

  const newRows = parsed.questions.map((q) => {
    usedNums[q.difficulty]++;
    const seq = String(usedNums[q.difficulty]).padStart(4, "0");
    const id = `${parsed.subjectSlug}-${q.difficulty}-${seq}`;
    const row: Record<string, unknown> = {
      subject: payload.name,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      stem: q.stem,
      answer: q.answer,
      solution: q.solution,
      id,
    };
    if (q.type === "MCQ" || q.type === "MSQ") row.options = (q as { options: string[] }).options;
    if (q.type === "NAT") row.tolerance = (q as { tolerance?: number }).tolerance ?? 0.01;
    return row;
  });

  payload.questions.push(...newRows);
  await fs.writeFile(subjectFile, JSON.stringify(payload, null, 2) + "\n", "utf8");

  let rebuiltMocks = false;
  let rebuildOutput = "";
  if (parsed.rebuildMocks) {
    try {
      const { stdout } = await execFileP("npx", ["tsx", "scripts/build_mocks.ts"], {
        cwd: repoRoot,
        timeout: 120_000,
        maxBuffer: 10 * 1024 * 1024,
      });
      rebuildOutput = stdout;
      rebuiltMocks = true;
    } catch (err) {
      rebuildOutput = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ok: true,
    appended: newRows.length,
    subjectSlug: parsed.subjectSlug,
    subjectFile: subjectFile.replace(repoRoot + "/", ""),
    newIds: newRows.map((r) => r.id),
    rebuiltMocks,
    rebuildOutput: rebuildOutput.slice(0, 2000),
    nextSteps: process.env.NODE_ENV === "production"
      ? ["Restart the app for new questions to load."]
      : [
          "Hot-reload should pick up the new JSON.",
          "Locked mocks (`\"locked\": true`) are not regenerated — unlock or run with --force.",
          "Commit the diff under apps/web/src/data/questions/ when ready.",
        ],
  });
}
