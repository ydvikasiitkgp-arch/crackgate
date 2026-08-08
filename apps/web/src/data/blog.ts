export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  /** GATE subject slugs (e.g. "mining") this post belongs to. Absent = global blog only. */
  subjects?: string[];
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
    slug: "gate-vs-psu-which-exam-to-choose",
    title: "GATE vs PSU Exams — Which Should You Choose for a Mining Career?",
    description:
      "Confused between GATE and PSU exams for your mining engineering career? Compare scope, salary, exam pattern, preparation strategy, and which path aligns with your goals.",
    date: "2026-05-20",
    author: "CrackGate Team",
    tags: ["GATE", "PSU", "Career", "Mining Engineering"],
    subjects: ["mining"],
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
