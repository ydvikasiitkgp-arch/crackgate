---
name: mock-review
description: Review and audit mock question papers (NCL Mining Sirdar, Coal Sirdar, Coal Overman, CE diploma) to real-exam standard. Use when the user asks to review/audit/fix/improve a mock, question paper, or mock-NN.json file — covers factual accuracy against DGMS/Mines Act/CMR/Mines Rules, distractor quality, cross-mock duplicate stems, difficulty labels, and topic coverage.
argument-hint: "[path/to/mock.json]"
metadata:
  author: sauravsk7
  version: "1.0.0"
---

# Mock Review

Audit a CrackGate mock question paper to real-exam (DGMS Mining Sirdar / Overman) standard and apply fixes. Built from the mock-03/04/05 audit campaigns.

## When to Use

- "Review / audit / fix / improve mock NN" or a specific `diploma-ncl-sirdar-mock-NN.json`
- Check factual accuracy of mining-regulations questions
- Remove answer-leaking or eliminable distractors
- Replace redundant/weak questions with uncovered topics
- Fix difficulty labels, or find cross-mock duplicate stems
- Present findings without editing — changes are applied only when the user says so

## Inputs

Ask for (default to the convention if the user is vague):

1. **Mock file** — convention: `apps/web/src/data/questions/mocks/diploma-ncl-sirdar-mock-NN.json` (CE: `ce-mock-NN.json`). If only a number is given, use the NCL Sirdar series.
2. **Scope** — full audit, or only factual fixes / only difficulty / only dupes.

## Structure contract (must hold)

- Top-level object: `id`, `title`, `tier`, `duration`, `pattern`, `totalMarks`, `sections`, `negativeMarking`, `seed`, `locked`, `questions`.
- Exactly **100 questions**, ids **1..100 sequential**, each `marks: 1`.
- **4 options**, `answer` 0-based (0-3), `difficulty` ∈ `easy|medium|hard`, non-empty `stem`, `solution`, `subject`, `topic`, `section`.
- **70 Section A — Technical + 30 Section B — General** (NCL Sirdar).
- JSON: 2-space indentation, trailing newline.

Validate with the bundled script:

```bash
node .opencode/skills/mock-review/scripts/validate-mock.cjs apps/web/src/data/questions/mocks/diploma-ncl-sirdar-mock-05.json
```

It also reports cross-mock duplicate stems across all sibling mocks. Then run typecheck — the mocks are imported by `apps/web/src/data/diploma/ncl-sirdar-mocks.ts`, so JSON errors surface at compile time:

```bash
npm run --workspace apps/web typecheck
```

## Audit order (priority)

1. **Factual accuracy** — highest priority. No fabricated statutory limits. When unsure of a legal/technical fact, verify with a web search (DGMS / Mines Act 1952 / CMR 2017 / Mines Rules 1955 / Mines Rescue Rules 1985). Never guess a regulation number or a numeric threshold.
2. **Distractor quality** — eliminate options that are obviously wrong, recycled across questions, or share wording/pattern with the answer (answer-leak). Replace with plausible, same-domain distractors.
3. **Redundant / duplicate stems** — replace with a genuinely different question on an under-covered topic.
4. **Topic coverage** — technical topics for NCL Sirdar: `CMR 2017 & Mines Act 1952`, `Mines Rules 1955 & Related Rules`, `Mines Rescue Rules, 1985`, `Explosives & Shot Firing`, `Mine Gases & Ventilation`, `Mine Surveying`, `Strata Control & Roof Support`, `Opencast Working & Bench Formation`, `Safety in Opencast Workings`, `Safety Management Plan`, `Reclamation in Opencast Mining`, `First Aid & Mine Emergencies`, `Report Writing`. General: `Quantitative Aptitude`, `Reasoning & Verbal Ability`, `General Knowledge`, `General Awareness`.
5. **Difficulty labels** — apply the rubric below last.
6. **Present findings — do not edit.** Deliver the findings report (summary line, per-question findings table, coverage table). Make **no file changes** during the audit. Wait for the user to say "apply" (or point at specific items) before touching the JSON.

## Difficulty rubric (per-exam target profiles)

Each exam paper has its own difficulty profile — never apply one exam's profile to another. Establish the target from that exam's notification (format, cutoffs, negative marking) and any independent paper analysis; no official easy/medium/hard split is published for CIL Sirdar exams.

| Exam | Target profile | Evidence |
|---|---|---|
| NCL Mining Sirdar | easy-to-moderate, recall-dominant; `hard` ≤ 10% | NCL notification (100 Q, 70 tech + 30 GK, 90 min, no -ve marking, UR cutoff 50%); WCL Sirdar 2023 paper analysis |
| Coal Sirdar / Coal Overman / CE diploma | establish from the paper's own notification + analyses | — (do not reuse NCL numbers) |

| Label | Criteria | Examples |
|---|---|---|
| `easy` | Simple recall / definition | selective mining, rehandle, hydroseeding mixture, underground lighting, smallest planet |
| `medium` | Arithmetic / synonyms / statutory thresholds / blast concepts | canteen worker threshold, powder factor, haul-road camber %, electronic detonators, "enervate", GPS augmentation system |
| `hard` | Genuinely complex multi-part / numeric / chemistry items | theodolite least count, blackdamp composition, statutory air-quality limits, filter self-rescuer CO chemistry |

Rules:

- **NCL Sirdar: `hard` at most 10% of the mock (0-10 per 100).** A hard label is a flag to re-check; most flagged items are really medium.
- No fixed easy/medium split; the bulk of the paper should read recall-dominant (mostly `easy`, with `medium` as the working majority for arithmetic/statutory items).
- For a non-NCL paper, derive its target profile first; if unknown, default to easy-to-moderate for an entry-level certificate exam until evidence says otherwise.
- Each label must match the rubric row above — never force a distribution to hit a target profile.

## Verified statutory facts (from mock-03/04/05 audits)

Reuse these; verify anything not on this list.

- **Mines Act 1952**: S.5(3) — District Magistrate may exercise the powers and perform the duties of an Inspector (subject to Central Government orders); S.5 exclusions: S.22/22A/61 powers are not transferable to the DM. S.41A — Safety Committee. S.58(1)(q) — welfare/threshold powers.
- **Mines Rules 1955**: Rule 72(1) — Welfare Officer required where **500 or more** persons are ordinarily employed (NOT 200).
- **CMR 2017**: Reg 153(2)(b) — air at any workplace must contain **not less than 19% oxygen and not more than 0.5% carbon dioxide**. Reg 204 — misfires: a relieving hole must be drilled so that at no point it is nearer than **30 cm** from the misfired hole (Reg 204(6)). Reg 104 — supports/roof control. CMR has no "2% misfire limit" — do not use that.
- **Mines Rescue Rules 1985**: a filter type self-rescuer converts **carbon monoxide** to CO2 via a Hopcalite catalyst; it does NOT supply oxygen.
- **Technical**: haul-road berm height ≥ **50% of the largest tyre diameter**; conventional surveyor's theodolite least count **20 seconds**; adult CPR compression:ventilation = **30:2**; blackdamp = **carbon dioxide + nitrogen** (formed where oxygen is consumed).
- **GK**: Modhera (Gujarat) = India's first **24×7 solar-powered** village (2022); JNPT / Nhava Sheva (Maharashtra) = India's largest **container** port.

## Distractor red flags to purge

- Recycled filler across questions: "Quarrying of granite", "Specific to metal mines only", "Reduce equipment maintenance", "Enhance surveying accuracy", "Optional in non-hazardous areas", "Required only in UG mines", "Increase production rate", "Not applicable / none".
- Answer-leak patterns: absurdly wrong options, options sharing distinctive words with the stem or answer, one long option next to short ones, or a pattern in the correct position (e.g., always index 0).
- Near-duplicate stems: same question rephrased across mocks (compare normalized stems; cosmetic rewording still counts). Known historic batches: 167 dupes across mocks 18/19/20; mock-05 had 15 dupes vs mocks 06/18/19/20.

## Editing rules

Only edit after the user has seen the findings and said "apply" (or selected specific items). Never edit during the audit itself.

- Prefer `edit`/`write` on the mock JSON with 2-space indentation preserved.
- When reordering options, update `answer` to the new index. Keep `answer` 0-based.
- When replacing a stem, give the replacement a real statutory/technical grounding and set a rubric-matched `difficulty` and an accurate `topic` (use the taxonomy above).
- Keep `solution` factual and specific (cite the rule/regulation when applicable).

## Delivery (only when the user asks)

Branch/commit rules in `AGENTS.md` apply (never a branch named after a remote ref or starting with `feat`; prefix with `improve/`). Established pattern:

- Create branch off `feat`: `git checkout -b improve/ncl-sirdar-mock-NN-audit-fixes feat`
- Commit with a `fix(ncl):` or `improve(ncl):` message
- Push to fork with the explicit-lease token pattern (plain `--force-with-lease` fails with "stale info"):
  `git push --force-with-lease=<branch>:<expected_sha> "https://sauravsk7:${GITHUB_PERSONAL_TOKEN}@github.com/sauravsk7/crackgate.git" <branch>`
- Open PR: `gh pr create --repo iamyadavvikas/crackgate --base feat --head sauravsk7:<branch> --reviewer iamyadavvikas`
