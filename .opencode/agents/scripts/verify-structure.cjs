#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const DIFFICULTIES = ["easy", "medium", "hard"];
const TYPES = ["MCQ", "NAT", "MSQ"];

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: node verify-structure.cjs <path/to/mock.json>");
    process.exit(2);
  }
  const abs = path.resolve(file);
  const parsed = JSON.parse(fs.readFileSync(abs, "utf8"));
  const questions = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(questions)) {
    console.error(JSON.stringify({ ok: false, fatal: "no questions array" }));
    process.exit(1);
  }

  const structureErrors = [];
  const missingTolerance = [];
  const answerRangeErrors = [];
  const ids = new Set();

  questions.forEach((q, i) => {
    const label = `q#${q.id ?? i + 1}`;
    if (typeof q.id !== "number") structureErrors.push(`${label}: missing numeric id`);
    else {
      if (q.id !== i + 1) structureErrors.push(`${label}: id ${q.id} not sequential at index ${i}`);
      if (ids.has(q.id)) structureErrors.push(`${label}: duplicate id`);
      ids.add(q.id);
    }
    if (!q.stem || !String(q.stem).trim()) structureErrors.push(`${label}: empty stem`);
    if (!q.solution || !String(q.solution).trim()) structureErrors.push(`${label}: empty solution`);
    if (!q.subject) structureErrors.push(`${label}: missing subject`);
    if (!q.topic) structureErrors.push(`${label}: missing topic`);
    if (q.difficulty !== undefined && !DIFFICULTIES.includes(q.difficulty)) {
      structureErrors.push(`${label}: difficulty '${q.difficulty}' not in ${DIFFICULTIES.join("|")}`);
    }
    if (typeof q.marks !== "number") structureErrors.push(`${label}: missing numeric marks`);
    if (q.type !== undefined && !TYPES.includes(q.type)) {
      structureErrors.push(`${label}: unknown type '${q.type}'`);
    }

    const type = q.type || inferType(q);
    if (type === "MCQ") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        structureErrors.push(`${label}: MCQ needs >=2 options`);
      } else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
        answerRangeErrors.push(q.id ?? i + 1);
      }
    } else if (type === "NAT") {
      if (typeof q.answer !== "number") {
        structureErrors.push(`${label}: NAT answer must be numeric`);
      }
      if (typeof q.tolerance !== "number" || q.tolerance <= 0) {
        missingTolerance.push(q.id ?? i + 1);
      }
    } else if (type === "MSQ") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        structureErrors.push(`${label}: MSQ needs >=2 options`);
      }
      if (!Array.isArray(q.answer)) {
        structureErrors.push(`${label}: MSQ answer must be an array`);
      } else {
        const seen = new Set();
        for (const a of q.answer) {
          if (!Number.isInteger(a) || a < 0 || a >= (q.options?.length ?? 0)) {
            answerRangeErrors.push(q.id ?? i + 1);
          }
          if (seen.has(a)) structureErrors.push(`${label}: duplicate MSQ answer index ${a}`);
          seen.add(a);
        }
      }
    }
  });

  const byType = {};
  const byDifficulty = {};
  const byMarks = {};
  questions.forEach((q) => {
    const type = q.type || inferType(q);
    byType[type] = (byType[type] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    byMarks[q.marks] = (byMarks[q.marks] || 0) + 1;
  });

  const report = {
    ok: structureErrors.length === 0 && missingTolerance.length === 0 && answerRangeErrors.length === 0,
    file: path.basename(abs),
    id: parsed.id ?? null,
    title: parsed.title ?? null,
    total: questions.length,
    byType,
    byDifficulty,
    byMarks,
    structureErrors,
    missingTolerance,
    answerRangeErrors,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ok ? 0 : 1);
}

function inferType(q) {
  if (Array.isArray(q.answer)) return "MSQ";
  if (typeof q.answer === "number" && !Number.isInteger(q.answer)) return "NAT";
  if (Number.isInteger(q.answer)) return "MCQ";
  return "UNKNOWN";
}

main();
