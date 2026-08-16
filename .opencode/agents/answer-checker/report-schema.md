# Report schema — reference for @answer-checker

Read this before writing or self-checking the report, before maintaining the
ledger, and when judging difficulty. This file is the single source of truth
for formats; the agent file only carries workflow and constraints.

## Report file

Canonical location: `$TMPDIR/opencode/<mock-id>-answer-report.json`
(fall back to `/tmp/` if unavailable). Written/updated after EVERY batch.

```json
{
  "mockId": "mn-mock-02",
  "examinedAt": "2026-08-13T00:00:00.000Z",
  "checked": 65,
  "correct": 61,
  "incorrect": 4,
  "unverifiable": 0,
  "lastCompletedId": 65,
  "difficultyFlags": [
    {
      "id": 43,
      "from": "easy",
      "to": "medium"
    }
  ],
  "fixes": [
    {
      "id": 42,
      "type": "NAT",
      "subject": "Mine Ventilation",
      "topic": "Air Quantity",
      "kind": "wrong-answer",
      "statedAnswer": 14,
      "correctAnswer": 13.5,
      "reason": "Air quantity recomputed: Q = A·V = 4.5 × 3 = 13.5 m³/s, not 14.",
      "source": "derived",
      "confidence": "high"
    },
    {
      "id": 6,
      "type": "MCQ",
      "subject": "Technical (Mining)",
      "topic": "CMR 2017 & Mines Act 1952",
      "kind": "no-valid-option",
      "statedAnswer": 3,
      "correctAnswer": "Reg 110 of CMR 2017 = Codes of practice (not a mine closure plan)",
      "suggestedOption": "Frame and enforce codes of practice before introducing a new machinery or operation",
      "reason": "Stated answer misattributes Reg 110; no offered option is correct.",
      "source": "web",
      "confidence": "high"
    }
  ],
  "difficultySummary": {
    "stated": { "easy": 47, "medium": 37, "hard": 16 },
    "verified": { "easy": 52, "medium": 41, "hard": 7 },
    "flagged": 8
  }
}
```

## `kind` — exactly one, chosen for the author action needed

- `wrong-answer` — an existing option/value is correct; the stated answer
  points elsewhere. Action: swap the answer index.
- `no-valid-option` — the correct value exists but no offered option
  matches; `suggestedOption` supplies the replacement text. Action:
  replace an option (or add one).
- `ambiguous` — two or more options are defensible (near-synonyms,
  both-plausible). Action: tighten options or accept the alternative.
- `premise-invalid` — the stem's premise is false or fabricated (event
  never happened / misattributed / contradictory facts). Action: rewrite
  the question or drop it; no answer swap can fix it.
- `underdetermined` — the stem does not force a unique answer (missing
  constraint, inconsistent data). Action: add a constraint or change the
  answer to "Cannot be determined".

## Fix entry rules

- `correctAnswer` must always contain the actual correct answer: the correct
  option index (or corrected array) when an option matches, or the concrete
  factual answer (value/statement, e.g. `"Reg 110 of CMR 2017 = Codes of
  practice; mine closure plan is not Reg 110"`) when no option is correct —
  never `null`, never a bare "no valid option".
- When no option matches, include a `suggestedOption` field with text that
  would make a correct option.
- When the correct answer confirms the stated one, do NOT list it in `fixes`.
- `source` is one of `derived` (recomputed/reasoned), `docs` (verified
  against the local statute texts in `docs/Mining/` — cite the file and
  regulation), `web` (internet verified), or `mixed`.
- `confidence` is `high` | `medium` | `low`.
- Every fix must explain why the stated answer is wrong and give the correct
  value — a report entry without a defensible reason is itself a bug.

## difficultyFlags

- Entries are `{id, from, to}` only — the mismatch verdict, no reason text.
- `from`/`to` are the stated and suggested labels, both one of
  `easy|medium|hard`, always different.
- Never list a question in `difficultyFlags` if it also appears in `fixes` —
  the answer fix is the finding; a difficulty flag on the same question is
  noise.

## difficultySummary

- `stated` = distribution of difficulty labels written in the paper (counted
  in the metadata pass, known up front).
- `verified` = your own judgment of every question — you judge difficulty
  anyway to find mismatches; accumulate it: start at `{0,0,0}` and add one to
  the matching `verified` bucket as each batch completes.
- `flagged` must equal `difficultyFlags.length`.
- When the run is complete, `stated` and `verified` each sum to the paper's
  question count; in a partial (resumed) report, `verified` sums to `checked`
  only — never to more.

## Difficulty rubric

- `easy` — single-step recall/definition/direct substitution; the answer is
  obvious.
- `medium` — multi-step arithmetic, statutory thresholds, standard concepts
  applied, or moderate reasoning.
- `hard` — multi-part reasoning, counter-intuitive math, tricky statutory
  interplay, or lengthy computation.

Flag ONLY clear mismatches (e.g. a 5-step computation labeled `easy`, or a
trivial definition labeled `hard`). Skip borderline calls — a report full of
marginal flags is noise. Judge each question independently; never enforce a
paper-level difficulty spread.

## Ledger format

Canonical location: `$TMPDIR/opencode/<mock-id>-ledger.json`

```json
{
  "mockId": "mn-mock-02",
  "entries": [
    {
      "fact": "Reg 86(3) CMR 2017: FoS ≥ 10",
      "verdict": "10",
      "source": "docs/Mining/Coal Mines Regulation 2017.txt",
      "batch": 4
    }
  ]
}
```

- A running list of `fact → verdict → source → batch` for every
  statutory/technical/time-sensitive fact you verify. Consult it before any
  check; a settled fact is reused as-is (cite the earlier batch), never
  re-searched, never re-litigated.
- Persist after every batch (small Node one-liner: read current file if it
  exists, merge, write).
- Entries with `source` starting `caller-seeded` were settled outside your
  run — use the verdict verbatim, never re-derive.
- Keep entries terse; prefer short Node one-liners (inline scripts longer
  than ~4,000 chars fail in this environment — write a tiny helper script to
  `$TMPDIR` once and reuse it).

## Self-check (before finishing)

Run a Node one-liner that JSON-parses the written file and asserts:

- `mockId` is a string and `checked` equals the paper's question count
- `correct + incorrect + unverifiable === checked`
- every `fixes` entry has non-empty `id`, `kind` (one of
  wrong-answer|no-valid-option|ambiguous|premise-invalid|underdetermined),
  `correctAnswer`, `reason`, `source` (one of derived|docs|web|mixed), and
  `confidence` (high|medium|low)
- `lastCompletedId === checked`
- `difficultySummary.stated` and `.verified` maps each sum to `checked`, have
  exactly the three keys `easy|medium|hard`, and
  `flagged === difficultyFlags.length`

If the self-check fails, rewrite the report until it passes — never hand back
a malformed report.