/**
 * GATE Environmental Science & Engineering (ES) practice banks — loaded from
 * per-subject JSON.
 *
 * Source of truth: apps/web/src/data/questions/practice/es-<slug>.json
 * Regenerate via: npx tsx scripts/build_es_practice.ts
 *
 * General Aptitude is shared with every GATE paper, so it is re-exported from
 * the common bank rather than duplicated.
 */
import type { PracticeSubject } from "@/data/practice";

import generalAptitude from "@/data/questions/practice/general-aptitude.json";
import management from "@/data/questions/practice/es-environmental-management-ethics.json";
import chemistry from "@/data/questions/practice/es-environmental-chemistry.json";
import microbiology from "@/data/questions/practice/es-environmental-microbiology.json";
import ecology from "@/data/questions/practice/es-ecology-biodiversity.json";
import air from "@/data/questions/practice/es-air-noise-pollution.json";
import water from "@/data/questions/practice/es-water-wastewater.json";
import waste from "@/data/questions/practice/es-solid-hazardous-waste.json";
import global from "@/data/questions/practice/es-global-regional-issues.json";
import engineeringMath from "@/data/questions/practice/es-engineering-mathematics.json";
import waterResources from "@/data/questions/practice/es-water-resources-hydraulics.json";

/** Environmental Science practice subjects in syllabus display order. */
export const ES_PRACTICE: PracticeSubject[] = [
  generalAptitude,
  engineeringMath,
  management,
  chemistry,
  microbiology,
  ecology,
  air,
  water,
  waterResources,
  waste,
  global,
] as PracticeSubject[];
