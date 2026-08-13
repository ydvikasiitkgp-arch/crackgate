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
    if (q.id === undefined || q.id === null || q.id === "") {
      structureErrors.push(`${label}: missing id`);
    } else {
      if (typeof q.id === "number") {
        if (q.id !== i + 1) structureErrors.push(`${label}: id ${q.id} not sequential at index ${i}`);
      }
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
    if (q.type !== undefined && !TYPES.includes(String(q.type).toUpperCase())) {
      structureErrors.push(`${label}: unknown type '${q.type}'`);
    }

    const type = String(q.type || inferType(q)).toUpperCase();
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
    const type = String(q.type || inferType(q)).toUpperCase();
    byType[type] = (byType[type] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    byMarks[q.marks] = (byMarks[q.marks] || 0) + 1;
  });

  const envelopeErrors = [];
  const sections = parsed.sections;
  const actualMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);
  if (parsed.totalMarks != null && actualMarks !== parsed.totalMarks) {
    envelopeErrors.push(`totalMarks ${parsed.totalMarks} != sum of question marks ${actualMarks}`);
  }
  if (Array.isArray(sections)) {
    const hasQuestionArrays = sections.some((sec) => Array.isArray(sec.questions));
    if (hasQuestionArrays) {
      const sectionIds = sections.flatMap((sec) => sec.questions || []);
      if (sectionIds.length !== questions.length) {
        envelopeErrors.push(`sections reference ${sectionIds.length} ids != questions ${questions.length}`);
      }
      const known = new Set(questions.map((q) => q.id));
      const missing = sectionIds.filter((id) => !known.has(id));
      if (missing.length) envelopeErrors.push(`section ids not in questions: [${missing.join(", ")}]`);
      const orphaned = questions.filter((q) => !sectionIds.includes(q.id));
      if (orphaned.length) envelopeErrors.push(`questions not in any section: [${orphaned.map((q) => q.id).join(", ")}]`);
    } else {
      const secCount = (sec) => sec.count ?? sec.questionCount ?? 0;
      const declaredCount = sections.reduce((s, sec) => s + secCount(sec), 0);
      const declaredMarks = sections.reduce((s, sec) => s + (sec.marks || 0), 0);
      if (declaredCount && declaredCount !== questions.length) {
        envelopeErrors.push(`sum of section counts ${declaredCount} != questions ${questions.length}`);
      }
      if (declaredMarks && parsed.totalMarks != null && declaredMarks !== parsed.totalMarks) {
        envelopeErrors.push(`sum of section marks ${declaredMarks} != totalMarks ${parsed.totalMarks}`);
      }
    }
  } else if (sections && typeof sections === "object") {
    const sectionIds = Object.values(sections).flat();
    if (sectionIds.length !== questions.length) {
      envelopeErrors.push(`sections reference ${sectionIds.length} ids != questions ${questions.length}`);
    }
    const known = new Set(questions.map((q) => q.id));
    const missing = sectionIds.filter((id) => !known.has(id));
    if (missing.length) envelopeErrors.push(`section ids not in questions: [${missing.join(", ")}]`);
    const orphaned = questions.filter((q) => !sectionIds.includes(q.id));
    if (orphaned.length) envelopeErrors.push(`questions not in any section: [${orphaned.map((q) => q.id).join(", ")}]`);
  }

  const report = {
    ok: structureErrors.length === 0 && missingTolerance.length === 0 && answerRangeErrors.length === 0 && envelopeErrors.length === 0,
    file: path.basename(abs),
    id: parsed.id ?? null,
    title: parsed.title ?? null,
    total: questions.length,
    totalMarks: parsed.totalMarks ?? actualMarks,
    byType,
    byDifficulty,
    byMarks,
    structureErrors,
    envelopeErrors,
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
