/**
 * WCL Mining Sirdar mock tests — 20 mocks (1 free + 19 pro).
 *
 * Source of truth: apps/web/src/data/questions/mocks/diploma-wcl-sirdar-mock-NN.json
 * Pattern: 100 MCQ · 100 marks · 120 min · NO negative marking.
 * Section A: General Awareness & Aptitude (20) + Section B: Technical (80).
 *
 * Syllabus: DGMS Mining Sirdar Certificate of Competency under CMR 2017.
 * WCL-specific facts verified from westerncoal.in (as of May 2026).
 */
import mock01 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-01.json";
import mock02 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-02.json";
import mock03 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-03.json";
import mock04 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-04.json";
import mock05 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-05.json";
import mock06 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-06.json";
import mock07 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-07.json";
import mock08 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-08.json";
import mock09 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-09.json";
import mock10 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-10.json";
import mock11 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-11.json";
import mock12 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-12.json";
import mock13 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-13.json";
import mock14 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-14.json";
import mock15 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-15.json";
import mock16 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-16.json";
import mock17 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-17.json";
import mock18 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-18.json";
import mock19 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-19.json";
import mock20 from "@/data/questions/mocks/diploma-wcl-sirdar-mock-20.json";

export const WCL_SIRDAR_MOCKS = [
  mock01, mock02, mock03, mock04, mock05,
  mock06, mock07, mock08, mock09, mock10,
  mock11, mock12, mock13, mock14, mock15,
  mock16, mock17, mock18, mock19, mock20,
] as const;

export const WCL_SIRDAR_PRICING = {
  free: 0,
  pro: 399,
} as const;
