#!/usr/bin/env python3
"""CrackGate — GATE Life Sciences (XL) full mock builder.

Bridges the plain-Python XL generator (scripts/gate_gen/) into the app's mock
JSON schema. Each mock follows the official GATE XL paper:

  Section A · General Aptitude        — 5 × 1m + 5 × 2m   (15 marks)
  Section B · XL-P Chemistry          — 5 × 1m + 10 × 2m  (25 marks, compulsory)
  Section C · Elective 1 (XL-Q/R/S/T/U) — 10 × 1m + 10 × 2m (30 marks)
  Section D · Elective 2 (XL-Q/R/S/T/U) — 10 × 1m + 10 × 2m (30 marks)
  Total: 65 Q · 100 marks · 180 min; negative -1/3 (1m MCQ), -2/3 (2m MCQ), 0 NAT/MSQ.

Writes apps/web/src/data/questions/mocks/xl-mock-NN.json.

Usage:
  python3 scripts/build_xl_mocks.py                     # build all unlocked
  python3 scripts/build_xl_mocks.py --force             # regen ALL
  python3 scripts/build_xl_mocks.py --only=xl-mock-01
  python3 scripts/build_xl_mocks.py --electives XL-Q,XL-S --seed 7 --out /tmp/xl-mock-01.json
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from gate_gen.core import AgentMemory, build_graph, generate
from gate_gen.xl import XL_INSTRUCTIONAL_REGISTRY

LLM_MODE = False
LLM_MODEL = "qwen2.5:7b"

MOCKS_DIR = ROOT / "apps/web/src/data/questions/mocks"
PRACTICE_DIR = ROOT / "apps/web/src/data/questions/practice"
GA_BANK_FILE = PRACTICE_DIR / "general-aptitude.json"

# (code, 1-mark questions, 2-mark questions) per paper section.
# The two electives come from the spec; XL-P (Chemistry) is always compulsory.
def paper_sections(electives):
    return [("XL-P", 5, 10)] + [(e, 10, 10) for e in electives]


DIFF_BIAS = {
    "balanced": {"easy": 0.25, "medium": 0.50, "hard": 0.25},
    "harder": {"easy": 0.15, "medium": 0.45, "hard": 0.40},
    "hardest": {"easy": 0.10, "medium": 0.35, "hard": 0.55},
}

MOCK_SPECS = [
    {"id": "xl-mock-01", "title": "XL Mock 01 — Full Syllabus (Free)",          "tier": "free",    "electives": ("XL-Q", "XL-S"), "diffBias": "balanced"},
    {"id": "xl-mock-02", "title": "XL Mock 02 — Biochemistry & Botany",         "tier": "subject", "electives": ("XL-Q", "XL-R"), "diffBias": "harder"},
    {"id": "xl-mock-03", "title": "XL Mock 03 — Botany & Microbiology",         "tier": "subject", "electives": ("XL-R", "XL-S"), "diffBias": "harder"},
    {"id": "xl-mock-04", "title": "XL Mock 04 — Microbiology & Zoology",        "tier": "subject", "electives": ("XL-S", "XL-T"), "diffBias": "harder"},
    {"id": "xl-mock-05", "title": "XL Mock 05 — Zoology & Food Technology",     "tier": "subject", "electives": ("XL-T", "XL-U"), "diffBias": "harder"},
    {"id": "xl-mock-06", "title": "XL Mock 06 — Biochemistry & Food Technology","tier": "subject", "electives": ("XL-Q", "XL-U"), "diffBias": "harder"},
    {"id": "xl-mock-07", "title": "XL Mock 07 — Botany & Food Technology",      "tier": "subject", "electives": ("XL-R", "XL-U"), "diffBias": "harder"},
    {"id": "xl-mock-08", "title": "XL Mock 08 — Microbiology & Food Technology", "tier": "subject", "electives": ("XL-S", "XL-U"), "diffBias": "harder"},
    {"id": "xl-mock-09", "title": "XL Mock 09 — Full Syllabus High Difficulty", "tier": "subject", "electives": ("XL-Q", "XL-T"), "diffBias": "hardest"},
    {"id": "xl-mock-10", "title": "XL Mock 10 — Grand Test (Premium)",          "tier": "premium", "electives": ("XL-R", "XL-T"), "diffBias": "hardest"},
    {"id": "xl-mock-11", "title": "XL Mock 11 — Full Syllabus (Premium)",       "tier": "premium", "electives": ("XL-Q", "XL-S"), "diffBias": "harder"},
    {"id": "xl-mock-12", "title": "XL Mock 12 — Biochemistry & Botany",         "tier": "subject", "electives": ("XL-Q", "XL-R"), "diffBias": "harder"},
    {"id": "xl-mock-13", "title": "XL Mock 13 — Biochemistry & Zoology",        "tier": "subject", "electives": ("XL-Q", "XL-T"), "diffBias": "harder"},
    {"id": "xl-mock-14", "title": "XL Mock 14 — Microbiology & Food Technology", "tier": "subject", "electives": ("XL-S", "XL-U"), "diffBias": "harder"},
    {"id": "xl-mock-15", "title": "XL Mock 15 — Botany & Food Technology",      "tier": "subject", "electives": ("XL-R", "XL-U"), "diffBias": "harder"},
    {"id": "xl-mock-16", "title": "XL Mock 16 — Botany & Microbiology",         "tier": "subject", "electives": ("XL-R", "XL-S"), "diffBias": "harder"},
    {"id": "xl-mock-17", "title": "XL Mock 17 — Microbiology & Zoology",        "tier": "subject", "electives": ("XL-S", "XL-T"), "diffBias": "harder"},
    {"id": "xl-mock-18", "title": "XL Mock 18 — Zoology & Food Technology",     "tier": "subject", "electives": ("XL-T", "XL-U"), "diffBias": "harder"},
    {"id": "xl-mock-19", "title": "XL Mock 19 — Full Syllabus High Difficulty", "tier": "subject", "electives": ("XL-Q", "XL-U"), "diffBias": "hardest"},
    {"id": "xl-mock-20", "title": "XL Mock 20 — Grand Test Finale (Premium)",   "tier": "premium", "electives": ("XL-R", "XL-S"), "diffBias": "hardest"},
]

SECTION_NAMES = {"XL-P": "Chemistry (compulsory)", "XL-Q": "Biochemistry",
                 "XL-R": "Botany", "XL-S": "Microbiology", "XL-T": "Zoology",
                 "XL-U": "Food Technology"}


def fnv(s: str) -> int:
    h = 2166136261
    for ch in s.encode():
        h ^= ch
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def difficulty(score: float) -> str:
    return "easy" if score < 70 else ("medium" if score < 90 else "hard")


def to_mock_question(q, idx: int, section: str) -> dict:
    subject = SECTION_NAMES.get(q.section, q.section)
    stem = q.question_text
    base = {
        "id": idx,
        "subject": subject,
        "topic": q.topic_path[1],
        "section": section,
        "type": q.q_type.value,
        "marks": q.marks,
        "difficulty": difficulty(q.computed_difficulty_score),
        "stem": stem,
    }
    if q.q_type.value == "NAT":
        lo, hi = q.tolerance_range
        base["answer"] = round(q.numerical_answer, 6)
        base["tolerance"] = round((hi - lo) / 2, 6)
        base["acceptedRange"] = {"min": round(lo, 6), "max": round(hi, 6)}
    else:
        order = [o.key for o in q.options]
        base["options"] = [o.text for o in q.options]
        base["answer"] = order.index(q.correct_keys[0])
    steps = q.solution_steps
    base["solution"] = f"**Working.**\n\n" + "\n".join(steps) + "\n\n**Answer.** See working above."
    return base


def generate_section(meta, section_code: str, n1: int, n2: int, seed: int):
    memory = AgentMemory()
    total = n1 + n2
    accum = []
    one, two = [], []
    batch = 0
    if LLM_MODE:
        from gate_gen import agent
        app = agent.build_agent_graph(model=LLM_MODEL)
    while len(one) < n1 or len(two) < n2:
        batch += 1
        if LLM_MODE:
            accum += agent.generate(meta, app, memory, count=total * 2, seed=seed + batch,
                                    model=LLM_MODEL, section=section_code)
        else:
            graph = build_graph()
            accum += generate(meta, graph, memory, count=total * 2, seed=seed + batch,
                              section=section_code)
        one = [q for q, _ in accum if q.marks == 1]
        two = [q for q, _ in accum if q.marks == 2]
        if batch > 8:
            raise RuntimeError(f"{section_code}: not enough questions ({len(one)}/1m, {len(two)}/2m)")
    return one[:n1] + two[:n2]


def pick_ga(bank, n1: int, n2: int, rand_seed: int):
    import random
    rng = random.Random(rand_seed)
    easy = [q for q in bank if q["difficulty"] == "easy"]
    rest = [q for q in bank if q["difficulty"] != "easy"]
    used = set()

    def unique(pool, n):
        rng.shuffle(pool)
        out = []
        for q in pool:
            if len(out) >= n:
                break
            if q["id"] in used:
                continue
            used.add(q["id"])
            out.append(q)
        return out

    return unique(easy, n1) + unique(rest, n2)


def build_mock(spec: dict, seed: int) -> dict:
    meta = XL_INSTRUCTIONAL_REGISTRY.model_copy(deep=True)
    meta.difficulty_distribution = DIFF_BIAS.get(spec.get("diffBias", "balanced"),
                                                 DIFF_BIAS["balanced"])
    graph = build_graph()
    memory = AgentMemory()
    questions = []

    ga_bank = json.loads(GA_BANK_FILE.read_text())["questions"]
    ga_pick = pick_ga(ga_bank, 5, 5, seed)
    idx = 1
    for marks, q in [(1, x) for x in ga_pick[:5]] + [(2, x) for x in ga_pick[5:]]:
        questions.append(to_mock_question_type({**q, "marks": marks}, idx))
        idx += 1

    sections = [{"name": "General Aptitude", "count": 10, "marks": 15}]
    for code, n1, n2 in paper_sections(spec["electives"]):
        section = f"{code} {SECTION_NAMES[code]}"
        name = SECTION_NAMES[code]
        sec_qs = generate_section(meta, code, n1, n2, seed + fnv(code) % 1000)
        for q in sec_qs:
            questions.append(to_mock_question(q, idx, section))
            idx += 1
        sections.append({"name": section, "count": n1 + n2, "marks": n1 + 2 * n2})

    total_marks = sum(q["marks"] for q in questions)
    return {
        "id": spec["id"],
        "title": spec["title"],
        "tier": spec["tier"],
        "duration": 180,
        "pattern": "GATE 2027 XL (65 Q · 100 marks · 3 hours)",
        "totalMarks": total_marks,
        "sections": sections,
        "negativeMarking": {"mcq1": -1 / 3, "mcq2": -2 / 3, "nat": 0, "msq": 0},
        "seed": seed,
        "locked": False,
        "questions": questions,
    }


def to_mock_question_type(ga_q: dict, idx: int) -> dict:
    return {
        "id": idx,
        "subject": "General Aptitude",
        "topic": ga_q.get("topic", ""),
        "section": "General Aptitude",
        "type": ga_q["type"],
        "marks": ga_q["marks"],
        "difficulty": ga_q.get("difficulty", "medium"),
        "stem": ga_q["stem"],
        **({"options": ga_q["options"]} if ga_q["type"] in ("MCQ", "MSQ") else {}),
        "answer": ga_q["answer"],
        **({"tolerance": ga_q.get("tolerance", 0.01)} if ga_q["type"] == "NAT" else {}),
        "solution": ga_q["solution"],
    }


def main() -> None:
    global LLM_MODE, LLM_MODEL
    ap = argparse.ArgumentParser(description="GATE XL mock builder")
    ap.add_argument("--only", default=None, help="comma-separated mock ids")
    ap.add_argument("--force", action="store_true", help="regen locked mocks")
    ap.add_argument("--seed", type=int, default=None, help="override seed (default: fnv(mock id))")
    ap.add_argument("--out", default=None, help="write to this path instead of the mocks dir")
    ap.add_argument("--llm", action="store_true", help="use the LangGraph+Ollama writer agent (requires Ollama running)")
    ap.add_argument("--model", default="qwen2.5:7b", help="Ollama model for --llm")
    args = ap.parse_args()
    LLM_MODE = args.llm
    LLM_MODEL = args.model

    only = set((args.only or "").split(",")) - {""}
    wrote = skipped = 0
    for spec in MOCK_SPECS:
        if only and spec["id"] not in only:
            continue
        seed = args.seed if args.seed is not None else fnv(spec["id"])
        out = Path(args.out) if args.out else MOCKS_DIR / f"{spec['id']}.json"

        if out.exists():
            existing = json.loads(out.read_text())
            if existing.get("locked") and not args.force:
                print(f"locked {spec['id']} (use --force)")
                skipped += 1
                continue

        mock = build_mock(spec, seed)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(mock, indent=2) + "\n")
        wrote += 1
        print(f"wrote {spec['id']}  {len(mock['questions'])} Qs · {mock['totalMarks']} marks · {mock['tier']} -> {out}")

    print(f"\nDone. wrote={wrote} skipped={skipped}")


if __name__ == "__main__":
    main()
