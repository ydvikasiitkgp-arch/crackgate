/**
 * NCL Surveyor (Mining) mock tests — 20 mocks (all pro).
 *
 * Source of truth: apps/web/src/data/questions/mocks/diploma-ncl-surveyor-mock-NN.json
 * Pattern: 100 MCQ · 100 marks · 120 min · NO negative marking.
 * Section A: Technical (70) + Section B: General (30).
 *
 * Syllabus: Surveyors' Certificate of Competency under CMR 2017.
 * NCL Advt. No. NCL/SING/HR/2026-27/246 dated 10.07.2026.
 */
import mock01 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-01.json";
import mock02 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-02.json";
import mock03 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-03.json";
import mock04 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-04.json";
import mock05 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-05.json";
import mock06 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-06.json";
import mock07 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-07.json";
import mock08 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-08.json";
import mock09 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-09.json";
import mock10 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-10.json";
import mock11 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-11.json";
import mock12 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-12.json";
import mock13 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-13.json";
import mock14 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-14.json";
import mock15 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-15.json";
import mock16 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-16.json";
import mock17 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-17.json";
import mock18 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-18.json";
import mock19 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-19.json";
import mock20 from "@/data/questions/mocks/diploma-ncl-surveyor-mock-20.json";

export const NCL_SURVEYOR_MOCKS = [
  mock01, mock02, mock03, mock04, mock05,
  mock06, mock07, mock08, mock09, mock10,
  mock11, mock12, mock13, mock14, mock15,
  mock16, mock17, mock18, mock19, mock20,
] as const;

export const NCL_SURVEYOR_PRICING = {
  free: 0,
  pro: 399,
} as const;
