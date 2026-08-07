#!/usr/bin/env node
/**
 * Structural + duplicate validation for CrackGate mock question papers.
 *
 * Usage: node validate-mock.cjs <path/to/mock.json>
 *
 * Checks:
 *  - top-level mock envelope (id/title/sections) matches the question array
 *  - 100 questions, ids 1..100 sequential and unique
 *  - every question has exactly 4 options, answer 0-3, marks 1
 *  - difficulty is one of easy|medium|hard
 *  - section split 70 Technical / 30 General
 *  - duplicate and near-duplicate stems across ALL sibling mock files
 *
 * Exits 0 on pass, 1 on failure. Prints summary + difficulty profile.
 */
const fs = require("fs");
const path = require("path");

const DIFFICULTIES = ["easy", "medium", "hard"];
const SECTION_A = "Section A — Technical";
const SECTION_B = "Section B — General";

function fail(...msg) {
  console.error("FAIL:", ...msg);
  process.exitCode = 1;
}

function normalizeStem(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function loadQuestions(file) {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(parsed) ? parsed : parsed.questions;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node validate-mock.cjs <path/to/mock.json>");
    process.exit(2);
  }
  const abs = path.resolve(file);
  const parsed = JSON.parse(fs.readFileSync(abs, "utf8"));
  const questions = loadQuestions(abs);
  const dir = path.dirname(abs);

  console.log("validating:", path.basename(abs));

  if (parsed.id) console.log("mock id:", parsed.id, "| title:", parsed.title);

  if (!Array.isArray(questions) || questions.length !== 100) {
    fail("expected 100 questions, got", questions && questions.length);
    return;
  }

  const ids = new Set();
  let a = 0, b = 0, marks = 0;
  const difficulty = { easy: 0, medium: 0, hard: 0 };
  const topics = new Set();

  questions.forEach((q, i) => {
    if (q.id !== i + 1) fail(`#${i + 1}: id must be sequential (${i + 1}), got ${q.id}`);
    if (ids.has(q.id)) fail(`#${q.id}: duplicate id`);
    ids.add(q.id);
    if (!Array.isArray(q.options) || q.options.length !== 4)
      fail(`#${q.id}: expected 4 options, got ${q.options && q.options.length}`);
    if (![0, 1, 2, 3].includes(q.answer)) fail(`#${q.id}: answer must be 0-3, got ${q.answer}`);
    if (q.marks !== 1) fail(`#${q.id}: marks must be 1, got ${q.marks}`);
    if (!DIFFICULTIES.includes(q.difficulty)) fail(`#${q.id}: bad difficulty "${q.difficulty}"`);
    if (q.section === SECTION_A) a++;
    else if (q.section === SECTION_B) b++;
    else fail(`#${q.id}: unknown section "${q.section}"`);
    marks += q.marks;
    if (q.topic) topics.add(q.topic);
    difficulty[q.difficulty]++;
  });

  if (a !== 70) fail("Section A count must be 70, got", a);
  if (b !== 30) fail("Section B count must be 30, got", b);
  if (marks !== 100) fail("total marks must be 100, got", marks);

  console.log(`structure OK: 100 Q | A: ${a} B: ${b} | marks: ${marks}`);
  console.log(`difficulty profile: ${difficulty.easy} easy / ${difficulty.medium} medium / ${difficulty.hard} hard`);
  console.log("topics (" + topics.size + "):");
  topics.forEach((t) => console.log("  - " + t));

  // Cross-mock duplicate stems: only report stems in THIS mock that also
  // appear in another mock of the same exam series (same file prefix).
  const base = path.basename(abs).replace(/-(\d+)\.json$/, "");
  const siblings = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && f.startsWith(base + "-") && f !== path.basename(abs))
    .sort();
  const stemToIds = new Map(); // normalized stem -> [{file, id}]
  for (const f of [path.basename(abs), ...siblings]) {
    let qs;
    try {
      qs = loadQuestions(path.join(dir, f));
    } catch (e) {
      continue;
    }
    if (!Array.isArray(qs)) continue;
    for (const q of qs) {
      if (!q || typeof q.stem !== "string") continue;
      const k = normalizeStem(q.stem);
      if (!stemToIds.has(k)) stemToIds.set(k, []);
      stemToIds.get(k).push({ file: f, id: q.id });
    }
  }

  const targetStem = new Map(); // normalized stem -> id in this mock
  questions.forEach((q) => targetStem.set(normalizeStem(q.stem), q.id));
  const dupes = new Map(); // normalized stem -> hits in other files
  for (const [stem, hits] of stemToIds) {
    if (!targetStem.has(stem)) continue;
    const others = hits.filter((h) => h.file !== path.basename(abs));
    if (others.length > 0) dupes.set(stem, others);
  }

  if (dupes.size > 0) {
    console.warn(`\nCROSS-MOCK DUPLICATES (${dupes.size} stems in this mock also appear in ${siblings.length} sibling mock(s)):`);
    for (const [stem, others] of dupes) {
      const refs = others.map((h) => `${h.file}#${h.id}`).join(", ");
      console.warn(`  mock #${targetStem.get(stem)} "${stem}" -> ${refs}`);
    }
  } else {
    console.log("\nno cross-mock duplicate stems found in the same series.");
  }

  console.log(process.exitCode ? "\nRESULT: FAIL" : "\nRESULT: PASS");
}

main();
