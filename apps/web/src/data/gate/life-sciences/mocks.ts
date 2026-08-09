/**
 * GATE Life Sciences (XL) full-length mock tests — one JSON file per mock.
 *
 * Source of truth: apps/web/src/data/questions/mocks/xl-mock-NN.json
 * Regenerate via:  python3 scripts/build_xl_mocks.py
 *
 * Each file follows the official GATE XL paper: General Aptitude (10 Q · 15 m),
 * compulsory XL-P Chemistry (15 Q · 25 m) and two electives of 20 Q · 30 m —
 * 65 questions · 100 marks · 180 minutes, negative marking ON (calculator allowed).
 */
import xlMock01 from "@/data/questions/mocks/xl-mock-01.json";

export const XL_MOCKS = [xlMock01] as const;
