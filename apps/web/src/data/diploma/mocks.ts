/**
 * DIPLOMA-level mining mock tests — one JSON file per mock.
 *
 * Source of truth: apps/web/src/data/questions/mocks/diploma-<exam>-mock-NN.json
 * Regenerate via:  npx tsx scripts/build_state_diploma_mocks.ts
 *
 * Currently shipped:
 *   - Coalfield Mining Sirdar / Junior Overman CBT (original 2 mocks)
 *   - WCL Mining Sirdar (20 mocks — see wcl-mocks.ts)
 *   - WCL Assistant Foreman Electrical (20 mocks — see wcl-af-mocks.ts)
 *
 * All mocks: 100 MCQ · 100 marks · 120 min · NO negative marking.
 * Section A: General Awareness & Aptitude (20) + Section B: Technical (80).
 */
import sirdarMock01 from "@/data/questions/mocks/diploma-coal-sirdar-mock-01.json";
import overmanMock01 from "@/data/questions/mocks/diploma-coal-overman-mock-01.json";
import { WCL_SIRDAR_MOCKS } from "@/data/diploma/wcl-mocks";
import { WCL_AF_MOCKS } from "@/data/diploma/wcl-af-mocks";

export const DIPLOMA_MOCKS = [
  sirdarMock01,
  overmanMock01,
  ...WCL_SIRDAR_MOCKS,
  ...WCL_AF_MOCKS,
] as const;
