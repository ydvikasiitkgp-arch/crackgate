export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  /** GATE subject slugs (e.g. "mining") this post belongs to. Absent = global blog only. */
  subjects?: string[];
  /** Call-to-action shown at the bottom of the article, linking to exam prep. */
  cta?: { label: string; href: string };
  body: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-prepare-for-gate-mining-2027",
    title: "How to Prepare for GATE Mining (MN) 2027 — A Complete Strategy Guide",
    description:
      "A step-by-step strategy to crack GATE Mining Engineering 2027. Covers syllabus breakdown, subject weightage, recommended books, mock test strategy, and a 12-month study plan.",
    date: "2026-07-01",
    author: "CrackGate Team",
    tags: ["GATE Mining", "GATE MN", "Study Plan", "Exam Strategy"],
    subjects: ["mining"],
    cta: { label: "Start preparing for GATE Mining (MN) 2027", href: "/gate/mining" },
    body: `GATE Mining Engineering (MN) is one of the most scoring papers in GATE — but only if you know where to focus. With a well-defined syllabus and predictable weightage pattern, a smart strategy matters more than sheer hours.

## GATE MN 2027 — Exam Pattern

- Total questions: 65 (10 General Aptitude + 55 Technical)
- Total marks: 100
- Duration: 3 hours
- Marking: +1 or +2 per correct answer, −⅓ or −⅔ negative for MCQ

## Subject-wise Weightage (from past 10 years)

| Subject | Approx Marks | Priority |
|---------|-------------|----------|
| Mining Methods & Machinery | 18–22 | High |
| Geomechanics & Ground Control | 14–18 | High |
| Mine Surveying | 10–14 | Medium |
| Mine Ventilation & Environment | 10–14 | Medium |
| Mineral Processing | 8–12 | Medium |
| Mathematics | 10–12 | Medium |
| General Aptitude | 15 | Low (practice only) |

## Recommended Books

1. **Mining Methods** — S. K. Das · S. K. Chaulya
2. **Geomechanics** — B. K. Kejriwal · Brady & Brown
3. **Mine Surveying** — S. Ghatak
4. **Ventilation** — G. B. Misra
5. **Mineral Processing** — B. A. Wills
6. **Engineering Mathematics** — B. S. Grewal

## 12-Month Study Plan

**Months 1–4 (Foundation):** Cover theory for all subjects from standard textbooks. Make concise notes — one page per topic. Solve end-of-chapter problems.

**Months 5–8 (Practice):** Switch to topic-wise practice. Target 30–40 questions per day across subjects. Identify weak areas from your accuracy data.

**Months 9–11 (Mock Tests):** Attempt one full-length mock every 3 days. Review every mistake — note down the concept, not just the answer. Take the free Mock 01 on CrackGate to benchmark your starting level.

**Month 12 (Revision):** Revise your notes. Take 2–3 mocks per week. Focus on time management — aim to finish the paper with 15 minutes to spare for review.

## Common Mistakes to Avoid

- **Skipping General Aptitude:** 15 marks are free if you practice. Don't lose them.
- **Over-studying low-weightage topics:** Numerical Methods and Linear Algebra need only basic coverage.
- **Not attempting enough mocks:** Exam temperament is built through repeated simulation. The NTA-style portal on CrackGate replicates the exact CBT experience.

## Why CrackGate for GATE MN?

Every mock and practice question on CrackGate is authored specifically for GATE Mining Engineering — no generic content, no padding. The platform gives you instant grading, detailed worked solutions, and SWOT analytics after every attempt. Start with Mock 01 — it's free, takes 3 hours, and tells you exactly where you stand.`,
  },
  {
    slug: "cil-mt-exam-pattern-guide",
    title: "CIL MT Exam Pattern 2026 — Complete Guide for Management Trainee",
    description:
      "Everything you need to know about the Coal India Limited Management Trainee exam: selection process, exam pattern, syllabus, discipline-wise vacancies, and preparation strategy.",
    date: "2026-06-15",
    author: "CrackGate Team",
    tags: ["CIL", "Coal India", "PSU", "Management Trainee"],
    cta: { label: "Practise for the CIL MT exam", href: "/psu/cil" },
    body: `Coal India Limited (CIL) recruits Management Trainees through a Computer-Based Test (CBT) conducted via TCS iON. With over 650 vacancies across 7 disciplines, it's one of the most sought-after PSU exams for engineering graduates.

## CIL MT Selection Process

1. **Computer-Based Test (CBT)** — 100 questions, 100 marks, 2 hours
2. **Personal Interview** — shortlisted candidates (typically 1:3 ratio)
3. **Document Verification** — Medical fitness test included

## Exam Pattern

| Section | Questions | Marks | Duration |
|---------|-----------|-------|----------|
| Technical (discipline-specific) | 80 | 80 | 2 hours |
| General Awareness, Reasoning & Aptitude | 20 | 20 | (combined) |

**Marking:** +1 for each correct answer. No negative marking.

## Discipline-wise Vacancies (Latest Advertisement)

| Post Code | Discipline | Vacancies |
|-----------|-----------|-----------|
| 11 | Civil | 178 |
| 12 | Electrical | 221 |
| 13 | Mechanical | 145 |
| 14 | System (CS/IT) | 43 |
| 15 | E&T | 38 |
| 16 | Geology | 15 |
| 17 | Industrial Engineering | 11 |

## Preparation Strategy

### Technical Section (80 marks)
The technical questions are at the level of a standard BTech degree — not as deep as GATE. Focus on core concepts from your engineering discipline rather than advanced topics.

- **Civil:** Strength of Materials, RCC Design, Soil Mechanics, Surveying
- **Mechanical:** Thermodynamics, Production Technology, Strength of Materials
- **Electrical:** Power Systems, Electrical Machines, Circuit Theory
- **System (CS):** Data Structures, Algorithms, DBMS, Computer Networks

### General Awareness (20 marks)
Current affairs of the last 6 months, especially related to the mining sector, coal production statistics, government schemes (MMDR Act, Coal Gasification), and CIL-specific knowledge.

## How CrackGate Helps

The CIL mock series on CrackGate is designed to match the actual TCS iON exam pattern — 100 questions, 2 hours, with the same interface. Each discipline has dedicated practice sets and full-length mocks. The detailed solutions explain not just the answer but also the concept behind it.`,
  },
  {
    slug: "cil-mt-geology-exam-guide",
    title: "CIL MT Geology 2026 — Exam Pattern, Syllabus & Preparation Strategy",
    description:
      "Complete guide to the Coal India Limited Management Trainee (Geology) exam — Post Code 16, pattern breakdown, Paper-II geology syllabus with topic weightage, and a focused preparation plan.",
    date: "2026-08-14",
    author: "CrackGate Team",
    tags: ["CIL", "Geology", "Coal India", "PSU", "Management Trainee"],
    cta: { label: "Practise for the CIL MT Geology exam", href: "/psu/cil/geology" },
    body: `Coal India Limited (CIL) recruits Management Trainees in Geology under **Post Code 16** of its annual CBT. With only **15 vacancies** and a qualification bar of **M.Sc. / M.Tech. in Geology, Applied Geology, Geophysics or Applied Geophysics (60%+)**, it is one of the most competitive — and most rewarding — PSU exams for geology postgraduates. Here's everything you need to crack it.

## CIL MT Geology — Exam Pattern

The CIL MT CBT (conducted via TCS iON) is uniform across disciplines:

- **Total:** 200 MCQ · **Marks:** 200 (1 mark each) · **Duration:** 180 minutes
- **Negative marking:** None
- **Papers:** Two — Paper-I (General) and Paper-II (Professional Knowledge)

| Section | Questions | Marks |
|---------|-----------|-------|
| Paper-I · General Awareness | 25 | 25 |
| Paper-I · Numerical Ability | 25 | 25 |
| Paper-I · Reasoning | 25 | 25 |
| Paper-I · General English | 25 | 25 |
| Paper-II · Professional Knowledge (Geology) | 100 | 100 |

Because there is **no negative marking**, never leave a question blank. A well-timed 100% attempt rate is worth several marks on its own.

## Paper-II Geology Syllabus — Topic Weightage

Based on the pattern of recent CIL Geology papers, the 100 professional-knowledge questions draw heavily on these topics:

| Topic | Typical Questions |
|-------|-------------------|
| Structural Geology | 8–10 |
| Remote Sensing & GIS | 6–8 |
| Hydrogeology | 5–7 |
| Petrology (Sedimentary, Igneous, Metamorphic) | 14–18 |
| Mineralogy & Crystallography | 8–10 |
| Economic Geology | 5–7 |
| Geophysics | 5–7 |
| Stratigraphy & Sedimentology | 5–8 |
| Engineering Geology | 4–6 |
| Coal Geology | 4–6 |
| Geomorphology & Physical Geology | 4–6 |
| Geochronology, Palaeontology, Geochemistry | 4–6 |

## Preparation Strategy

**Phase 1 — Consolidate the core branches (Weeks 1–6):** Petrology, mineralogy and structural geology together cover nearly half the paper. Revise your M.Sc. notes and draw/sketch the classification schemes — Bowen's reaction series, rock textures, stereonet basics, and fault/fold classification are recurring favourites.

**Phase 2 — Applied geology (Weeks 7–10):** Coal geology and engineering geology matter more here than in most geology exams. Focus on Indian coalfields, coal rank and grade, petrographic constituents (vitrinite, inertinite), and geotechnical basics for dams/tunnels/slope stability.

**Phase 3 — Speed through mocks (Weeks 11–12):** Since Paper-I carries a full **50 marks of general aptitude**, build speed with daily 25-question sprints. Take full-length mocks in the exact 180-minute TCS iON-style format, then review every mistake against the concept, not just the answer.

## Why CrackGate for CIL Geology?

The CrackGate **CIL Geology mock series** mirrors the real pattern — 200 MCQs, two papers, no negative marking — with worked solutions for every question and per-section analysis after each attempt. Start with the free Mock 01 to benchmark where you stand, then work through the remaining sets as your Paper-II revision progresses.`,
  },
  {
    slug: "how-to-prepare-for-gate-geology-2027",
    title: "How to Prepare for GATE Geology & Geophysics (GG) 2027 — Complete Strategy",
    description:
      "A complete GATE Geology & Geophysics (GG) 2027 strategy — Part A Geology and Part B Geophysics breakdown, topic weightage, recommended books and a 12-month study plan.",
    date: "2026-08-14",
    author: "CrackGate Team",
    tags: ["GATE GG", "Geology", "Geophysics", "Study Plan"],
    subjects: ["geology"],
    cta: { label: "Start preparing for GATE Geology & Geophysics (GG) 2027", href: "/gate/geology" },
    body: `GATE Geology & Geophysics (GG) is one of the few papers where you prepare **two full disciplines** — Part A Geology and Part B Geophysics. That breadth is both the challenge and the opportunity: the syllabus is fixed, the weightage is predictable, and candidates who build both halves systematically score consistently.

## GATE GG 2027 — Exam Pattern

- Total questions: 65 (10 General Aptitude + 55 Technical)
- Total marks: 100
- Duration: 3 hours
- Marking: +1 or +2 per correct answer, −⅓ or −⅔ negative for MCQ, none for NAT

## Part A — Geology (approx. 60% weight)

The geology section carries roughly 60% of the technical marks and is where most candidates build their base:

- Earth system science & geomorphology
- Mineralogy & crystallography
- Igneous, metamorphic & sedimentary petrology
- Structural geology
- Palaeontology
- Stratigraphy & Indian geology
- Economic & ore geology
- Geochemistry & isotope geology
- Engineering & environmental geology

**Tip:** Petrology + mineralogy + structural geology together make up roughly a third of Part A. Master the classification schemes (Bowen's reaction series, rock textures, fault/fold families) before anything else.

## Part B — Geophysics (approx. 40% weight)

- Signal processing
- Gravity & magnetic methods
- Seismology & seismic methods
- Electrical, electromagnetic & borehole methods
- Radiometric methods & well logging
- Applied remote sensing & GIS

**Tip:** Geophysics rewards comfort with the *equations* — gravity anomaly, magnetic anomaly, seismic travel-time and the standard correction terms. Practise them numerically rather than memorising theory.

## Recommended Books

1. **Physical Geology** — Mukherjee
2. **Principles of Petrology** — Tyrrell
3. **Structural Geology** — Billings
4. **Economic Mineral Deposits** — Jensen & Bateman
5. **Geochemistry** — William M. White
6. **An Introduction to Geophysical Exploration** — Kearey, Brooks & Hill
7. **Remote Sensing and Image Interpretation** — Lillesand, Kiefer & Chipman

## 12-Month Study Plan

**Months 1–4 (Foundation):** Cover all of Part A geology from textbooks. Draw every classification — rock textures, metamorphic facies, stratigraphic columns, structural diagrams. One page of notes per topic.

**Months 5–8 (Geophysics + practice):** Add Part B geophysics, solving every numerical example. Start topic-wise practice — target 30–40 questions per day. Track weak areas by topic from your accuracy data.

**Months 9–11 (Mocks):** One full-length GG mock every 3 days in the exact 3-hour GATE format. Review every mistake against the concept, not the answer.

**Month 12 (Revision):** Revise your notes, re-run your numerical methods, and take 2–3 mocks per week. Aim to finish with 15 minutes spare for review.

## Why CrackGate for GATE GG?

CrackGate's GATE Geology & Geophysics track gives you topic-wise learn modules, **975+ exam-grade practice questions**, and 20 full-length mocks on the official 65-question pattern. Start with the free mock to benchmark your starting level.`,
  },
  {
    slug: "how-to-prepare-for-gate-civil-2027",
    title: "How to Prepare for GATE Civil Engineering (CE) 2027 — Complete Strategy",
    description:
      "A complete GATE Civil Engineering (CE) 2027 strategy — syllabus breakdown, subject weightage, recommended books, and a 12-month study plan to crack CE.",
    date: "2026-08-14",
    author: "CrackGate Team",
    tags: ["GATE CE", "Civil Engineering", "Study Plan", "Exam Strategy"],
    subjects: ["civil"],
    cta: { label: "Start preparing for GATE Civil Engineering (CE) 2027", href: "/gate/civil" },
    body: `GATE Civil Engineering (CE) is the most attempted GATE paper, with competition from over 100,000 candidates every year. The good news: the syllabus is huge but **highly structured**, and past-paper weightage tells you exactly where the marks sit.

## GATE CE 2027 — Exam Pattern

- Total questions: 65 (10 General Aptitude + 55 Technical)
- Total marks: 100
- Duration: 3 hours
- Marking: +1 or +2 per correct answer, −⅓ or −⅔ negative for MCQ, none for NAT

## Section-wise Weightage

| Section | Approx Marks | Priority |
|---------|-------------|----------|
| Structural Engineering | 15–18 | High |
| Geotechnical Engineering | 12–15 | High |
| Water Resources & Hydraulics | 10–13 | High |
| Environmental Engineering | 8–11 | Medium |
| Transportation Engineering | 8–10 | Medium |
| Geomatics / Surveying | 5–7 | Medium |
| Engineering Mathematics | 12–15 | High |
| General Aptitude | 15 | Practice only |

## Recommended Books

1. **Engineering Mechanics** — Timoshenko
2. **Structural Analysis** — Hibbeler
3. **Concrete Technology** — M. S. Shetty
4. **Soil Mechanics & Foundations** — B. M. Das
5. **Fluid Mechanics** — R. K. Bansal
6. **Water Supply Engineering** — S. K. Garg
7. **Highway Engineering** — S. K. Khanna & C. E. G. Justo
8. **Engineering Mathematics** — B. S. Grewal

## 12-Month Study Plan

**Months 1–4 (Foundation):** Cover structural analysis, strength of materials and engineering mathematics first — they feed every other section. Make one-page concept notes per topic.

**Months 5–8 (Practice):** Topic-wise practice across all sections, 30–40 questions a day. Prioritise by weightage table above. Identify weak areas from accuracy data.

**Months 9–11 (Mocks):** One full-length CE mock every 3 days. CE's challenge is speed across many topics — review every mistake for the concept behind it.

**Month 12 (Revision):** Notes + 2–3 mocks per week. Finish papers with 15 minutes to spare for review.

## Why CrackGate for GATE CE?

The CrackGate Civil track provides learn modules across all core subjects, **1100+ exam-grade practice questions**, and 20 full-length mocks on the official GATE CE pattern. Start with the free mock to benchmark your level.`,
  },
  {
    slug: "how-to-prepare-for-gate-environmental-science-2027",
    title: "How to Prepare for GATE Environmental Science & Engineering (ES) 2027 — Complete Strategy",
    description:
      "A complete GATE Environmental Science & Engineering (ES) 2027 strategy — syllabus breakdown, topic weightage, recommended books and a study plan.",
    date: "2026-08-14",
    author: "CrackGate Team",
    tags: ["GATE ES", "Environmental Science", "Study Plan", "Exam Strategy"],
    subjects: ["environment"],
    cta: { label: "Start preparing for GATE Environmental Science (ES) 2027", href: "/gate/environment" },
    body: `GATE Environmental Science & Engineering (ES) blends chemistry, biology and engineering — the paper rewards candidates who connect fundamentals across all three rather than cramming isolated facts.

## GATE ES 2027 — Exam Pattern

- Total questions: 65 (10 General Aptitude + 55 Technical)
- Total marks: 100
- Duration: 3 hours
- Marking: +1 or +2 per correct answer, −⅓ or −⅔ negative for MCQ, none for NAT

## Topic-wise Weightage

| Topic | Approx Marks | Priority |
|-------|-------------|----------|
| Environmental Chemistry | 12–15 | High |
| Environmental Microbiology | 10–13 | High |
| Water & Wastewater Treatment | 10–13 | High |
| Air & Noise Pollution | 8–11 | Medium |
| Solid & Hazardous Waste Management | 8–10 | Medium |
| Ecology & Biodiversity | 6–8 | Medium |
| Environmental Management & Ethics | 5–7 | Medium |
| Engineering Mathematics | 12–15 | High |
| General Aptitude | 15 | Practice only |

## Recommended Books

1. **Environmental Engineering** — Peavy, Rowe & Tchobanoglous
2. **Water and Wastewater Engineering** — Metcalf & Eddy
3. **Air Pollution Control Engineering** — de Nevers
4. **Environmental Chemistry** — Manahan
5. **Wastewater Engineering: Treatment & Reuse** — Arceivala

## Study Plan

**Phase 1 (Weeks 1–8):** Environmental chemistry and microbiology are the foundation — understand reaction stoichiometry, water chemistry, microbial growth kinetics. Sketch every treatment process flow (primary, secondary, tertiary).

**Phase 2 (Weeks 9–16):** Move to water/wastewater and air pollution control. Solve design-type numericals — BOD/COD, MLSS, detention time, cyclone and ESP efficiency, dispersion.

**Phase 3 (Weeks 17–24):** Solid & hazardous waste, ecology, and management. Full-length mocks every 3 days, then review mistakes against the concept.

## Why CrackGate for GATE ES?

CrackGate's Environmental Science track offers learn modules for every topic, **1260+ practice questions**, and 20 full-length mocks on the official GATE ES pattern. Start with the free mock to see where you stand.`,
  },
  {
    slug: "how-to-prepare-for-gate-life-sciences-2027",
    title: "How to Prepare for GATE Life Sciences (XL) 2027 — Complete Strategy",
    description:
      "A complete GATE Life Sciences (XL) 2027 strategy — compulsory chemistry plus electives (biochemistry, botany, microbiology, zoology), with a study plan.",
    date: "2026-08-14",
    author: "CrackGate Team",
    tags: ["GATE XL", "Life Sciences", "Study Plan", "Exam Strategy"],
    subjects: ["life-sciences"],
    cta: { label: "Start preparing for GATE Life Sciences (XL) 2027", href: "/gate/life-sciences" },
    body: `GATE Life Sciences (XL) is unique — a **compulsory Chemistry section** plus **two electives** chosen from Biochemistry, Botany, Microbiology and Zoology. Choosing your electives strategically and preparing the chemistry core well is the whole game.

## GATE XL 2027 — Exam Pattern

- Total questions: 65 (10 General Aptitude + 55 Technical)
- Total marks: 100
- Duration: 3 hours
- Compulsory section: Chemistry
- Two electives from: Biochemistry, Botany, Microbiology, Zoology
- Marking: +1 or +2 per correct answer, −⅓ or −⅔ negative for MCQ, none for NAT

## Compulsory — Chemistry

Covers physical, organic and inorganic fundamentals: atomic structure, chemical bonding, thermodynamics, kinetics, stereochemistry and basic organic reactions. Treat it as a fixed, high-weightage block.

## Elective Strategy

Pick **two electives you're strongest in** — and ideally overlap your GATE-prep electives with your BTech/MSc coursework so you avoid studying two extra syllabi from scratch. Popular combinations: Microbiology + Biochemistry, or Botany + Zoology.

## Recommended Books

1. **Organic Chemistry** — Morrison & Boyd
2. **Biochemistry** — Lehninger
3. **Microbiology** — Prescott, Harley & Klein
4. **Genetics** — Stansfield
5. **Plant Physiology** — Taiz & Zeiger
6. **Animal Physiology** — Rastogi

## Study Plan

**Phase 1 (Weeks 1–8):** Lock the Chemistry core and your first elective — maximum overlap with your degree, maximum marks.

**Phase 2 (Weeks 9–16):** Second elective plus topic-wise practice. Daily 30–40 questions, tracking accuracy by topic.

**Phase 3 (Weeks 17–24):** Full-length XL mocks every 3 days on the official pattern, then concept-level review of every mistake.

## Why CrackGate for GATE XL?

CrackGate's Life Sciences track provides full-length mocks on the official XL paper pattern with a compulsory chemistry section and electives. Start with the free mock to benchmark your level.`,
  },
  {
    slug: "gate-vs-psu-which-exam-to-choose",
    title: "GATE vs PSU Exams — Which Should You Choose for a Mining Career?",
    description:
      "Confused between GATE and PSU exams for your mining engineering career? Compare scope, salary, exam pattern, preparation strategy, and which path aligns with your goals.",
    date: "2026-05-20",
    author: "CrackGate Team",
    tags: ["GATE", "PSU", "Career", "Mining Engineering"],
    subjects: ["mining"],
    cta: { label: "Compare GATE and PSU prep on CrackGate", href: "/gate/mining" },
    body: `Every mining engineering graduate faces this dilemma: should I focus on GATE for MTech or a PSU job? Should I prepare for both? Here's a no-nonsense breakdown.

## GATE Mining (MN) — For Academics & Research

**Best for:** Students aiming for MTech at IITs/NITs, PSU recruitment through GATE score, or a career in research.

**Salary after MTech:** ₹12–25 LPA (top IIT placements)
**PSU recruitment through GATE:** Coal India (CIL), NMDC, MOIL, HCL typically recruit through GATE scores. A top 200 AIR in GATE MN can land a PSU job directly.

**Pros:**
- One exam opens doors to both MTech and PSU jobs
- Standardized syllabus with years of past papers
- Can be attempted multiple times (score valid for 3 years for PSUs)

**Cons:**
- Highly competitive (30,000+ test-takers, ~500 seats across IITs)
- Requires deep conceptual understanding across 10+ subjects

## CIL MT Exam — Direct PSU Recruitment

**Best for:** Students who want a confirmed PSU job without going through GATE.

**Salary:** ₹50,000–70,000/month (basic + DA + perks) during training; ₹1.2–1.8 L/month after confirmation.

**Pros:**
- Easier than GATE — BTech-level questions, no negative marking
- Direct recruitment — no need for MTech
- CIL is a Maharatna PSU — job stability, housing, medical benefits

**Cons:**
- One-shot attempt per advertisement
- Limited disciplines and vacancies
- Career growth slower than MTech + PSU route

## Can You Prepare for Both?

**Yes, but with a strategy:**

**Phase 1 (Months 1–6):** Prepare for GATE deeply — the advanced concepts will make CIL questions feel easy. Focus on the GATE MN syllabus.

**Phase 2 (Months 7–8):** Transition to CIL-specific preparation. Solve past CIL papers (available in CrackGate's CIL discipline sets). The technical depth is lower, but the range of topics is wider in some disciplines.

**Phase 3 (Last month before CIL exam):** Full-length CIL mocks daily. Since there's no negative marking, speed is the differentiator.

## Which Path Has Better ROI?

| Factor | GATE + MTech | CIL MT Direct |
|--------|-------------|---------------|
| Time to job | 2+ years (MTech) | 6–12 months |
| Starting salary | ₹12–25 LPA | ₹15–22 LPA |
| Growth ceiling | Higher (R&D, academia, management) | Moderate (departmental promotions) |
| Exam difficulty | Very high | Moderate |
| Attempts | Annual | Per notification |

**Bottom line:** If you're a final-year student, attempt GATE first (February) and then CIL (typically June-July). The GATE preparation directly feeds into the CIL technical section. CrackGate covers both — use the GATE mocks for depth and the CIL mocks for speed.`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogPostsForSubject(subject: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.subjects?.includes(subject));
}

export function isBlogPostInSubject(post: BlogPost, subject: string): boolean {
  return post.subjects?.includes(subject) ?? false;
}
