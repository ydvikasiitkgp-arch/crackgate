// Downloadable reference sheets + important links, grouped by exam family.
// Each item is rendered as a printable HTML page at /downloads/<slug> and
// listed on the SEO index at /downloads.

export type DownloadLink = { label: string; href: string; note?: string; external?: boolean };

export type DownloadSection = { heading: string; body: string };

export type DownloadItem = {
  slug: string;
  title: string;
  category: string;
  description: string;
  sections: DownloadSection[];
  links: DownloadLink[];
};

export const DOWNLOAD_ITEMS: DownloadItem[] = [
  {
    slug: "gate-2027-pattern-and-syllabus",
    title: "GATE 2027 — Exam Pattern & Mining (MN) Syllabus",
    category: "GATE",
    description:
      "GATE 2027 exam pattern, subject weightage for Mining Engineering (MN), recommended books and the complete GATE MN syllabus in one printable sheet.",
    sections: [
      {
        heading: "GATE Exam Pattern",
        body: `GATE is a 3-hour Computer Based Test of 100 marks. The paper has 65 questions: 10 General Aptitude (15 marks) and 55 technical questions (85 marks). Marking is +1 or +2 per correct answer with −1/3 or −2/3 negative marking for MCQs, and no negative marking for Numerical Answer Type (NAT) questions.`,
      },
      {
        heading: "Subject-wise Weightage — GATE Mining Engineering (MN)",
        body: `Mining Methods & Machinery (18–22), Geomechanics & Ground Control (14–18), Mine Surveying (10–14), Mine Ventilation & Environment (10–14), Mineral Processing (8–12), Engineering Mathematics (10–12), General Aptitude (15).`,
      },
      {
        heading: "Recommended Books",
        body: `Mining Methods — S. K. Das, S. K. Chaulya · Geomechanics — B. K. Kejriwal, Brady & Brown · Mine Surveying — S. Ghatak · Ventilation — G. B. Misra · Mineral Processing — B. A. Wills · Engineering Mathematics — B. S. Grewal.`,
      },
    ],
    links: [
      { label: "GATE official website (IIT admissions)", href: "https://gate.iitd.ac.in", note: "Official notification, syllabus PDF and exam schedule.", external: true },
      { label: "NPTEL–GATE PYQ portal", href: "https://gate.nptel.ac.in", note: "Previous-year questions with solutions and full-length mocks.", external: true },
      { label: "GATE Mining (MN) hub on CrackGate", href: "/gate/mining" },
      { label: "Full-length GATE MN mocks", href: "/mocks" },
    ],
  },
  {
    slug: "gate-gg-2027-pattern-and-syllabus",
    title: "GATE Geology & Geophysics (GG) 2027 — Exam Pattern & Syllabus",
    category: "GATE",
    description:
      "GATE 2027 Geology & Geophysics (GG) exam pattern, subject-wise syllabus and preparation links — mineralogy, petrology, structural geology, geophysics, remote sensing & GIS.",
    sections: [
      {
        heading: "GATE GG Exam Pattern",
        body: `GATE GG is a 3-hour CBT of 100 marks with 65 questions — 10 General Aptitude (15 marks) and 55 technical questions (85 marks). Negative marking of −1/3 or −2/3 applies to MCQs only; Numerical Answer Type (NAT) questions carry no negative marking.`,
      },
      {
        heading: "Section A — Geology (Part 1, ~60 questions)",
        body: `Earth system science and geomorphology · mineralogy and crystallography · igneous, metamorphic and sedimentary petrology · structural geology · palaeontology · stratigraphy and Indian geology · economic and ore geology · geochemistry and isotope geology · engineering and environmental geology.`,
      },
      {
        heading: "Section B — Geophysics (Part 2, ~60 questions)",
        body: `Signal processing · gravity and magnetic methods · seismology and seismic methods · electrical, electromagnetic and borehole methods · radiometric methods · well logging · applied remote sensing and GIS.`,
      },
      {
        heading: "Recommended Books",
        body: `Physical Geology — Mukherjee · Principles of Petrology — Tyrrell · Structural Geology — Billings · Economic Mineral Deposits — Jensen & Bateman · Geochemistry — W. M. White · An Introduction to Geophysical Exploration — Kearey, Brooks & Hill · Remote Sensing and Image Interpretation — Lillesand, Kiefer & Chipman.`,
      },
    ],
    links: [
      { label: "GATE official website (IIT admissions)", href: "https://gate.iitd.ac.in", note: "Official notification and syllabus PDF.", external: true },
      { label: "NPTEL–GATE PYQ portal", href: "https://gate.nptel.ac.in", note: "Previous-year GG questions with solutions.", external: true },
      { label: "GATE Geology & Geophysics hub on CrackGate", href: "/gate/geology" },
      { label: "GATE GG practice questions", href: "/gate/geology/practice" },
      { label: "GATE GG full-length mocks", href: "/gate/geology/mocks" },
    ],
  },
  {
    slug: "gate-ce-2027-pattern-and-syllabus",
    title: "GATE Civil Engineering (CE) 2027 — Exam Pattern & Syllabus",
    category: "GATE",
    description:
      "GATE 2027 Civil Engineering (CE) exam pattern and syllabus — structural engineering, geotechnical, water resources, environmental, transportation and geomatics engineering.",
    sections: [
      {
        heading: "GATE CE Exam Pattern",
        body: `GATE CE is a 3-hour CBT of 100 marks with 65 questions — 10 General Aptitude (15 marks) and 55 technical questions (85 marks). Negative marking of −1/3 or −2/3 applies to MCQs only; NAT questions have no negative marking.`,
      },
      {
        heading: "Section A — Core Subjects",
        body: `Engineering mathematics (linear algebra, calculus, differential equations, probability) · solid and structural mechanics · concrete and steel structures · construction materials and management.`,
      },
      {
        heading: "Section B — Specialised Subjects",
        body: `Geotechnical engineering (soil mechanics, foundation engineering) · water resources and hydrology · environmental engineering · transportation engineering · surveying and geomatics engineering.`,
      },
      {
        heading: "Recommended Books",
        body: `Engineering Mechanics — Timoshenko · Structural Analysis — Hibbeler · Concrete Technology — M. S. Shetty · Soil Mechanics — B. M. Das · Fluid Mechanics — R. K. Bansal · Water Supply Engineering — Garg.`,
      },
    ],
    links: [
      { label: "GATE official website (IIT admissions)", href: "https://gate.iitd.ac.in", note: "Official notification and syllabus PDF.", external: true },
      { label: "NPTEL–GATE PYQ portal", href: "https://gate.nptel.ac.in", note: "Previous-year CE questions with solutions.", external: true },
      { label: "GATE Civil Engineering hub on CrackGate", href: "/gate/civil" },
      { label: "GATE CE practice questions", href: "/gate/civil/practice" },
      { label: "GATE CE full-length mocks", href: "/gate/civil/mocks" },
    ],
  },
  {
    slug: "gate-es-2027-pattern-and-syllabus",
    title: "GATE Environmental Science & Engineering (ES) 2027 — Exam Pattern & Syllabus",
    category: "GATE",
    description:
      "GATE 2027 Environmental Science & Engineering (ES) exam pattern and syllabus — environmental chemistry, microbiology, water & wastewater, air pollution, waste management and ecology.",
    sections: [
      {
        heading: "GATE ES Exam Pattern",
        body: `GATE ES is a 3-hour CBT of 100 marks with 65 questions — 10 General Aptitude (15 marks) and 55 technical questions (85 marks). Negative marking of −1/3 or −2/3 applies to MCQs only; NAT questions have no negative marking.`,
      },
      {
        heading: "Section A — Core Subjects",
        body: `Environmental chemistry · environmental microbiology · ecology and biodiversity · environmental engineering mathematics.`,
      },
      {
        heading: "Section B — Specialised Subjects",
        body: `Water and wastewater treatment · air and noise pollution · solid and hazardous waste management · global and regional environmental issues · environmental management, ethics and sustainability.`,
      },
      {
        heading: "Recommended Books",
        body: `Environmental Engineering — Peavy, Rowe & Tchobanoglous · Water and Wastewater Engineering — Metcalf & Eddy · Air Pollution Control Engineering — de Nevers · Environmental Chemistry — Manahan · Wastewater Engineering — Arceivala.`,
      },
    ],
    links: [
      { label: "GATE official website (IIT admissions)", href: "https://gate.iitd.ac.in", note: "Official notification and syllabus PDF.", external: true },
      { label: "NPTEL–GATE PYQ portal", href: "https://gate.nptel.ac.in", note: "Previous-year ES questions with solutions.", external: true },
      { label: "GATE Environmental Science hub on CrackGate", href: "/gate/environment" },
      { label: "GATE ES practice questions", href: "/gate/environment/practice" },
      { label: "GATE ES full-length mocks", href: "/gate/environment/mocks" },
    ],
  },
  {
    slug: "gate-xl-2027-pattern-and-syllabus",
    title: "GATE Life Sciences (XL) 2027 — Exam Pattern & Syllabus",
    category: "GATE",
    description:
      "GATE 2027 Life Sciences (XL) exam pattern and syllabus — compulsory chemistry, biochemistry, botany, microbiology and zoology electives.",
    sections: [
      {
        heading: "GATE XL Exam Pattern",
        body: `GATE XL is a 3-hour CBT of 100 marks. It has a compulsory Chemistry section plus two electives chosen from Biochemistry, Botany, Microbiology and Zoology. MCQs carry −1/3 or −2/3 negative marking; NAT questions carry none.`,
      },
      {
        heading: "Compulsory Section — Chemistry",
        body: `Physical, organic and inorganic chemistry fundamentals — atomic structure, chemical bonding, thermodynamics, kinetics, stereochemistry, and basic organic reactions.`,
      },
      {
        heading: "Electives",
        body: `Biochemistry (biomolecules, metabolism, enzymes, molecular biology) · Botany (plant anatomy, physiology, taxonomy, genetics) · Microbiology (microbial structure, growth, pathogens) · Zoology (animal physiology, cell biology, genetics).`,
      },
      {
        heading: "Recommended Books",
        body: `Chemistry — Morrison & Boyd · Biochemistry — Lehninger · Microbiology — Prescott · Genetics — Stansfield · Plant Physiology — Taiz & Zeiger · Animal Physiology — Rastogi.`,
      },
    ],
    links: [
      { label: "GATE official website (IIT admissions)", href: "https://gate.iitd.ac.in", note: "Official notification and syllabus PDF.", external: true },
      { label: "NPTEL–GATE PYQ portal", href: "https://gate.nptel.ac.in", note: "Previous-year XL questions with solutions.", external: true },
      { label: "GATE Life Sciences hub on CrackGate", href: "/gate/life-sciences" },
      { label: "GATE XL full-length mocks", href: "/gate/life-sciences/mocks" },
    ],
  },
  {
    slug: "cil-mt-exam-pattern-and-vacancies",
    title: "CIL Management Trainee — Exam Pattern & Vacancies",
    category: "PSU — CIL",
    description:
      "Coal India Limited Management Trainee CBT pattern, discipline-wise vacancies and eligibility for all 7 posts — Civil, Electrical, Mechanical, System, E&T, Geology, Industrial Engineering.",
    sections: [
      {
        heading: "CIL MT Exam Pattern (CBT via TCS iON)",
        body: `200 MCQ · 2 papers · 1 mark each · no negative marking · 180 minutes. Paper-I (100 questions): General Awareness, Numerical Ability, Reasoning and General English (25 each). Paper-II (100 questions): discipline-specific Professional Knowledge.`,
      },
      {
        heading: "Discipline-wise Vacancies",
        body: `Civil (Post 11) 178 · Electrical (Post 12) 221 · Mechanical (Post 13) 145 · System (Post 14) 43 · E&T (Post 15) 38 · Geology (Post 16) 15 · Industrial Engineering (Post 17) 11.`,
      },
      {
        heading: "Eligibility",
        body: `Engineering posts require a degree in the relevant branch with minimum 60% marks. Geology (Post 16) requires M.Sc. / M.Tech. in Geology, Applied Geology, Geophysics or Applied Geophysics with minimum 60% marks.`,
      },
    ],
    links: [
      { label: "CIL MT recruitment notification (TCS iON)", href: "https://g03.tcsion.com//per/g03/pub/726/EForms/image/ImageDocUpload/71161/5/1501287760.pdf", note: "Official advertisement PDF.", external: true },
      { label: "CIL MT hub on CrackGate", href: "/psu/cil" },
      { label: "CIL Geology MT mocks", href: "/psu/cil/geology" },
    ],
  },
  {
    slug: "dgms-mining-safety-overview",
    title: "CIL DGMS — Mining Safety & Statutory Framework",
    category: "CIL DGMS",
    description:
      "Directorate General of Mines Safety (DGMS) overview — Mines Act 1952, Coal Mines Regulations 2017, the Sirdar certificate of competency, and DGMS's role in coal mine safety.",
    sections: [
      {
        heading: "What is DGMS?",
        body: `The Directorate General of Mines Safety is the Indian statutory body that enforces the Mines Act 1952 and its subordinate regulations in all mines. It inspects mines, approves competency certificates, and monitors safety, health and welfare of mine workers.`,
      },
      {
        heading: "Key Statutes",
        body: `Mines Act 1952 · Coal Mines Regulations 2017 · Mines Rules 1955 · Mines Vocational Training Rules 1966 · Mines Rescue Rules 1985 · Metalliferous Mines Regulations. DGMS circulars issued from time to time supplement these regulations.`,
      },
      {
        heading: "Mining Sirdar Certificate of Competency",
        body: `DGMS awards the Mining Sirdar / Overman certificate of competency under CMR 2017. Diploma-level recruitment (NCL, WCL and other coal subsidiaries) maps its technical section directly to this syllabus — opencast working, blasting, strata control, ventilation, mine gases, duties of Sirdar, and legal provisions.`,
      },
    ],
    links: [
      { label: "DGMS official website", href: "https://dgms.gov.in", note: "Circulars, statutory forms and competency exam dates.", external: true },
      { label: "Diploma exam hub on CrackGate", href: "/diploma" },
      { label: "NCL Mining Sirdar prep", href: "/diploma/ncl/mining-sirdar" },
    ],
  },
  {
    slug: "ncl-mining-sirdar-and-surveyor-pattern",
    title: "NCL Mining Sirdar & Surveyor — Exam Pattern",
    category: "Diploma — NCL",
    description:
      "Northern Coalfields Limited (NCL) direct recruitment exam pattern for Mining Sirdar T&S Gr. C and Surveyor T&S Gr. B — section-wise weightage, syllabus and marking.",
    sections: [
      {
        heading: "NCL Exam Pattern",
        body: `100 MCQs · 100 marks · 90 minutes · no negative marking · bilingual (English + Hindi). Section A (70 MCQs, technical) + Section B (30 MCQs — GK, General Awareness, Reasoning and Quantitative Aptitude).`,
      },
      {
        heading: "Mining Sirdar T&S Gr. C — Section A (70)",
        body: `Opencast coal mine working and bench formation · shot firing and explosives · safety in opencast workings · reclamation · Coal Mines Regulations 2017 and Mines Act 1952 provisions · Mines Rules 1955, Vocational Training Rules 1966, Rescue Rules 1985 and DGMS circulars · report writing.`,
      },
      {
        heading: "Surveyor T&S Gr. B — Section A (70)",
        body: `Linear and angular measurement · chain surveying · theodolite and total stations · levelling and contouring · tachometry · triangulation and GPS · mine plans and sections · field astronomy and gyro theodolite · photogrammetry and remote sensing · borehole surveying and volume calculations.`,
      },
      {
        heading: "Vacancies",
        body: `Mining Sirdar — 254 posts; Surveyor (Mining) — 5 posts. Advt. No. NCL/SING/HR/Direct-Recruitment/2026-27/246 dated 10.07.2026.`,
      },
    ],
    links: [
      { label: "NCL official website", href: "https://nclcil.in", note: "Recruitment notifications and results.", external: true },
      { label: "NCL Mining Sirdar mocks on CrackGate", href: "/diploma/ncl/mining-sirdar" },
      { label: "NCL Surveyor mocks on CrackGate", href: "/diploma/ncl/surveyor" },
    ],
  },
  {
    slug: "wcl-mining-sirdar-and-foreman-pattern",
    title: "WCL Mining Sirdar & Assistant Foreman (Electrical) — Exam Pattern",
    category: "Diploma — WCL",
    description:
      "Western Coalfields Limited (WCL) recruitment exam pattern for Mining Sirdar and Assistant Foreman (Electrical) — 100 MCQs, section-wise syllabus and marking scheme.",
    sections: [
      {
        heading: "WCL Exam Pattern",
        body: `100 MCQs · 100 marks · 120 minutes · no negative marking. Section A (20 MCQs, 20 marks): General English, reasoning, quantitative aptitude, data interpretation and current affairs. Section B (80 MCQs, 80 marks): technical syllabus.`,
      },
      {
        heading: "WCL Mining Sirdar — Section B (80)",
        body: `Explosives and blasting · board & pillar development and depillaring · strata control (SCAMP) and roof bolting · stowing and subsidence · opencast working and dump management · drifting · geology · mine surveying · inundation danger · mine fires and rescue · ventilation and mine gases · duties of Sirdar · man riding and winding · shaft sinking · coal dust · accidents · face machinery (SDL, LHD, CM, belt conveyor) · electrical safety · Mines Act 1952, CMR 2017 and DGMS circulars · report writing.`,
      },
      {
        heading: "Assistant Foreman (Electrical)",
        body: `The technical section covers electrical engineering applied to mine workings — cables and switches, flameproof enclosures, intrinsically safe devices, face electrical installations, earthing and statutory electrical provisions under CMR 2017.`,
      },
    ],
    links: [
      { label: "WCL official website", href: "https://westerncoal.in", note: "Recruitment notifications and results.", external: true },
      { label: "WCL Mining Sirdar mocks on CrackGate", href: "/diploma/wcl/mining-sirdar" },
      { label: "WCL Assistant Foreman (Electrical) mocks", href: "/diploma/wcl/assistant-foreman-electrical" },
    ],
  },
  {
    slug: "state-mining-exams-rpsc",
    title: "State Mining Exams — RPSC Assistant Mining Engineer",
    category: "State Exams",
    description:
      "State-level mining engineering recruitment exams — the RPSC Assistant Mining Engineer pattern, marking scheme and how to prepare alongside GATE and PSU exams.",
    sections: [
      {
        heading: "RPSC Assistant Mining Engineer Pattern",
        body: `150 MCQs · 150 marks · 150 minutes · online CBT · 1 mark each with −1/3 negative marking. The syllabus spans mining methods, mine surveying, ventilation, strata control, mining machinery and safety legislation.`,
      },
      {
        heading: "State Exams vs GATE",
        body: `State PSC exams (RPSC, MPPSC, etc.) ask BTech-level technical questions with a syllabus overlapping GATE Mining. GATE-level preparation covers most of the technical syllabus; the difference is speed — state exams reward breadth and quick attempt rates.`,
      },
    ],
    links: [
      { label: "RPSC official website", href: "https://rpsc.rajasthan.gov.in", note: "Notifications, syllabus PDFs and results.", external: true },
      { label: "State exams hub on CrackGate", href: "/state" },
      { label: "RPSC AME mocks on CrackGate", href: "/state" },
    ],
  },
];

export function getDownloadItem(slug: string): DownloadItem | undefined {
  return DOWNLOAD_ITEMS.find((d) => d.slug === slug);
}