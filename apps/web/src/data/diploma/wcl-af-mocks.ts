/**
 * WCL Assistant Foreman (Electrical) mock tests — 20 mocks (1 free + 19 pro).
 *
 * Source of truth: apps/web/src/data/questions/mocks/diploma-wcl-foreman-mock-NN.json
 * Pattern: 100 MCQ · 100 marks · 120 min · NO negative marking.
 * Section A: General Awareness & Aptitude (20) + Section B: Technical Electrical (80).
 *
 * Syllabus: CIL/WCL Assistant Foreman (Electrical) recruitment.
 * Part 1: General Awareness, Reasoning, Quant, DI (Class X level).
 * Part 2: EE basics, Machines, Drives, Switchgear, Earthing, Substations, Safety.
 */
import mock01 from "@/data/questions/mocks/diploma-wcl-foreman-mock-01.json";
import mock02 from "@/data/questions/mocks/diploma-wcl-foreman-mock-02.json";
import mock03 from "@/data/questions/mocks/diploma-wcl-foreman-mock-03.json";
import mock04 from "@/data/questions/mocks/diploma-wcl-foreman-mock-04.json";
import mock05 from "@/data/questions/mocks/diploma-wcl-foreman-mock-05.json";
import mock06 from "@/data/questions/mocks/diploma-wcl-foreman-mock-06.json";
import mock07 from "@/data/questions/mocks/diploma-wcl-foreman-mock-07.json";
import mock08 from "@/data/questions/mocks/diploma-wcl-foreman-mock-08.json";
import mock09 from "@/data/questions/mocks/diploma-wcl-foreman-mock-09.json";
import mock10 from "@/data/questions/mocks/diploma-wcl-foreman-mock-10.json";
import mock11 from "@/data/questions/mocks/diploma-wcl-foreman-mock-11.json";
import mock12 from "@/data/questions/mocks/diploma-wcl-foreman-mock-12.json";
import mock13 from "@/data/questions/mocks/diploma-wcl-foreman-mock-13.json";
import mock14 from "@/data/questions/mocks/diploma-wcl-foreman-mock-14.json";
import mock15 from "@/data/questions/mocks/diploma-wcl-foreman-mock-15.json";
import mock16 from "@/data/questions/mocks/diploma-wcl-foreman-mock-16.json";
import mock17 from "@/data/questions/mocks/diploma-wcl-foreman-mock-17.json";
import mock18 from "@/data/questions/mocks/diploma-wcl-foreman-mock-18.json";
import mock19 from "@/data/questions/mocks/diploma-wcl-foreman-mock-19.json";
import mock20 from "@/data/questions/mocks/diploma-wcl-foreman-mock-20.json";

export const WCL_AF_MOCKS = [
  mock01, mock02, mock03, mock04, mock05,
  mock06, mock07, mock08, mock09, mock10,
  mock11, mock12, mock13, mock14, mock15,
  mock16, mock17, mock18, mock19, mock20,
] as const;

export const WCL_AF_PRICING = {
  free: 0,
  pro: 399,
} as const;
