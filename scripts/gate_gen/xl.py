"""GATE XL (Life Sciences) instructional registry + real formula solvers.

Syllabus source: official GATE Life Sciences combined syllabus (XL-P Chemistry
compulsory; XL-Q Biochemistry, XL-R Botany, XL-S Microbiology, XL-T Zoology,
XL-U Food Technology electives). Paper: 65 Q / 100 marks / 180 min; GA 10 Q/15 m
+ Chemistry 15 Q/25 m + any two electives 20 Q/30 m each. Negative marking only
on MCQs (1/3 for 1-mark, 2/3 for 2-mark); none for MSQ/NAT.

GA is intentionally NOT generated here - the app already ships shared GA banks
(scripts/gen_ga_pool.py -> paper1-ga.json).
"""

from __future__ import annotations

import math
from typing import Callable, Dict, List, Tuple

from gate_gen.core import (
    DistractorType,
    FormulaEntry,
    SectionMetadata,
    SubjectMetadata,
)

R = 8.314
F = 96485


# =====================================================================
# Real formula solvers  (params -> (value, unit))
# =====================================================================

def nernst(p: Dict[str, float]) -> Tuple[float, str]:
    return p["E0"] - 0.0591 / p["n"] * math.log10(p["Q"]), "V"


def gibbs_emf(p: Dict[str, float]) -> Tuple[float, str]:
    return -p["n"] * F * p["E"], "J/mol"


def gibbs_dh_ts(p: Dict[str, float]) -> Tuple[float, str]:
    return p["H"] - p["T"] * p["S"], "J/mol"


def gibbs_rt_lnk(p: Dict[str, float]) -> Tuple[float, str]:
    return -R * p["T"] * math.log(p["K"]), "J/mol"


def arrhenius(p: Dict[str, float]) -> Tuple[float, str]:
    return p["A"] * math.exp(-p["Ea"] / (R * p["T"])), "s-1"


def t_half_1st(p: Dict[str, float]) -> Tuple[float, str]:
    return math.log(2) / p["k"], "s"


def first_order_conc(p: Dict[str, float]) -> Tuple[float, str]:
    return p["A0"] * math.exp(-p["k"] * p["t"]), "M"


def henderson_hasselbalch(p: Dict[str, float]) -> Tuple[float, str]:
    return p["pKa"] + math.log10(p["ratio"]), ""


def ph_strong_acid(p: Dict[str, float]) -> Tuple[float, str]:
    return -math.log10(p["conc"]), ""


def ideal_gas_volume(p: Dict[str, float]) -> Tuple[float, str]:
    return p["n"] * 0.0821 * p["T"] / p["P"], "L"


def mm_rate(p: Dict[str, float]) -> Tuple[float, str]:
    return p["Vmax"] * p["S"] / (p["Km"] + p["S"]), "micromol/min"


def lineweaver_burk(p: Dict[str, float]) -> Tuple[float, str]:
    return (p["Km"] / p["Vmax"]) * (1 / p["S"]) + 1 / p["Vmax"], "min/micromol"


def kcat(p: Dict[str, float]) -> Tuple[float, str]:
    return p["Vmax"] / p["Et"], "s-1"


def beer_lambert(p: Dict[str, float]) -> Tuple[float, str]:
    return p["eps"] * p["c"] * p["l"], ""


def dna_fraction_light(p: Dict[str, float]) -> Tuple[float, str]:
    return 1 - 2 / (2 ** p["n"]), ""


def generation_time(p: Dict[str, float]) -> Tuple[float, str]:
    return math.log(2) / p["mu"], "h"


def exponential_growth(p: Dict[str, float]) -> Tuple[float, str]:
    return p["N0"] * (2 ** (p["t"] / p["td"])), "cells"


def cfu_count(p: Dict[str, float]) -> Tuple[float, str]:
    return p["col"] * p["DF"] / p["vol"], "CFU/mL"


def hardy_weinberg_heterozygote(p: Dict[str, float]) -> Tuple[float, str]:
    q = 1 - p["p"]
    return 2 * p["p"] * q, ""


def cardiac_output(p: Dict[str, float]) -> Tuple[float, str]:
    return p["HR"] * p["SV"], "mL/min"


def npp(p: Dict[str, float]) -> Tuple[float, str]:
    return p["GPP"] - p["R"], "gC/m2/yr"


def d_value(p: Dict[str, float]) -> Tuple[float, str]:
    return p["t"] / math.log10(p["N0"] / p["N"]), "min"


def z_value(p: Dict[str, float]) -> Tuple[float, str]:
    return p["D1"] * (10 ** ((p["T1"] - p["T2"]) / p["Z"])), "min"


def mixing_concentration(p: Dict[str, float]) -> Tuple[float, str]:
    return p["C1"] * p["V1"] / p["V2"], "M"


def reynolds(p: Dict[str, float]) -> Tuple[float, str]:
    return p["rho"] * p["v"] * p["D"] / p["mu"], ""


SOLVERS: Dict[str, Callable] = {
    "nernst": nernst,
    "gibbs_emf": gibbs_emf,
    "gibbs_dh_ts": gibbs_dh_ts,
    "gibbs_rt_lnk": gibbs_rt_lnk,
    "arrhenius": arrhenius,
    "t_half_1st": t_half_1st,
    "first_order_conc": first_order_conc,
    "henderson_hasselbalch": henderson_hasselbalch,
    "ph_strong_acid": ph_strong_acid,
    "ideal_gas_volume": ideal_gas_volume,
    "mm_rate": mm_rate,
    "lineweaver_burk": lineweaver_burk,
    "kcat": kcat,
    "beer_lambert": beer_lambert,
    "dna_fraction_light": dna_fraction_light,
    "generation_time": generation_time,
    "exponential_growth": exponential_growth,
    "cfu_count": cfu_count,
    "hardy_weinberg_heterozygote": hardy_weinberg_heterozygote,
    "cardiac_output": cardiac_output,
    "npp": npp,
    "d_value": d_value,
    "z_value": z_value,
    "mixing_concentration": mixing_concentration,
    "reynolds": reynolds,
}


# =====================================================================
# Domain-specific distractor overrides (additive / conceptual quantities)
# =====================================================================

def _hh_distractors(value: float, p: Dict[str, float]):
    pka, ratio = p["pKa"], p["ratio"]
    return [
        (round(14 - value, 4), DistractorType.CONCEPT_SWAP, "Computed pOH instead of pH."),
        (round(pka - math.log10(ratio), 4), DistractorType.WRONG_SIGN, "Inverted the base/acid ratio."),
        (round(value + 1, 4), DistractorType.WRONG_FORMULA, "Off by one pH unit (one pKa)."),
    ]


def _ph_acid_distractors(value: float, p: Dict[str, float]):
    return [
        (round(14 - value, 4), DistractorType.CONCEPT_SWAP, "Computed pOH instead of pH."),
        (round(-value, 4), DistractorType.WRONG_SIGN, "Dropped the minus sign in pH = -log10[H+]."),
        (round(value - 3, 4), DistractorType.WRONG_UNIT, "Treated concentration in mM instead of M."),
    ]


def _hw_distractors(value: float, p: Dict[str, float]):
    q = 1 - p["p"]
    return [
        (round(p["p"] ** 2, 4), DistractorType.WRONG_FORMULA, "Reported homozygous dominant frequency p^2."),
        (round(q ** 2, 4), DistractorType.WRONG_FORMULA, "Reported homozygous recessive frequency q^2."),
        (round(1.0, 4), DistractorType.WRONG_SIGN, "Reported p + q instead of the heterozygote frequency."),
    ]


def _dna_distractors(value: float, p: Dict[str, float]):
    n = p["n"]
    return [
        (round(2 / (2 ** n), 4), DistractorType.WRONG_FORMULA, "Reported the hybrid (H:L) fraction instead of light-only."),
        (round(1 / (2 ** n), 4), DistractorType.WRONG_FORMULA, "Assumed only one molecule retains label."),
        (round(1 - 1 / (2 ** n), 4), DistractorType.WRONG_SIGN, "Assumed label dilutes after n-1 generations."),
    ]


DISTRACTOR_OVERRIDES: Dict[str, Callable] = {
    "henderson_hasselbalch": _hh_distractors,
    "ph_strong_acid": _ph_acid_distractors,
    "hardy_weinberg_heterozygote": _hw_distractors,
    "dna_fraction_light": _dna_distractors,
}


# =====================================================================
# XL-P Chemistry (compulsory) - 15 Q / 25 marks (5 x 1-mark, 10 x 2-mark)
# =====================================================================

CHEM_TOPICS = {
    "Atomic Structure and Periodicity": ["Quantum numbers", "Electronic configuration", "Periodic trends"],
    "Structure and Bonding": ["VSEPR theory", "Hybridisation", "Intermolecular forces"],
    "s, p and d Block Elements": ["Alkali and alkaline earth metals", "Boron and carbon families", "Transition metal chemistry"],
    "Chemical Equilibria": ["Acid-base equilibrium", "Buffer solutions", "Solubility product"],
    "Electrochemistry": ["Nernst equation", "Electrochemical cells", "Conductivity"],
    "Reaction Kinetics": ["Order and molecularity", "Half-life and rate laws", "Arrhenius equation"],
    "Thermodynamics": ["First law and enthalpy", "Gibbs free energy", "Chemical potential"],
    "Structure-Reactivity Correlations and Organic Reaction Mechanisms": ["Nucleophilic substitution", "Elimination", "Carbocation stability"],
    "Chemistry of Biomolecules": ["Carbohydrates", "Amino acids and peptides", "Lipids and nucleic acids"],
}

CHEM_WEIGHTAGE = {
    "Atomic Structure and Periodicity": 0.12,
    "Structure and Bonding": 0.10,
    "s, p and d Block Elements": 0.12,
    "Chemical Equilibria": 0.15,
    "Electrochemistry": 0.12,
    "Reaction Kinetics": 0.13,
    "Thermodynamics": 0.12,
    "Structure-Reactivity Correlations and Organic Reaction Mechanisms": 0.08,
    "Chemistry of Biomolecules": 0.06,
}

CHEM_FORMULAS = {
    "Chemical Equilibria": [
        FormulaEntry(
            name="Henderson-Hasselbalch", expression="pH = pKa + log10([A-]/[HA])",
            variables={"pKa": "acid dissociation constant", "[A-]/[HA]": "base/acid ratio"},
            solver="henderson_hasselbalch", ranges={"pKa": [2.0, 10.0], "ratio": [0.01, 100.0]},
            result_unit="",
        ),
        FormulaEntry(
            name="Strong acid pH", expression="pH = -log10[H+]",
            variables={"[H+]": "hydrogen ion concentration (M)"},
            solver="ph_strong_acid", ranges={"conc": [1e-4, 1e-1]}, result_unit="",
        ),
    ],
    "Electrochemistry": [
        FormulaEntry(
            name="Nernst equation", expression="E = E0 - (0.0591/n) log10(Q)",
            variables={"E0": "standard potential (V)", "n": "electrons transferred", "Q": "reaction quotient"},
            canonical_units={"E": "V"}, solver="nernst",
            ranges={"E0": [0.2, 0.8], "n": [1.0, 3.0], "Q": [0.01, 100.0]}, int_vars=["n"],
            result_unit="V", unit_factor=1000.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Gibbs free energy from cell EMF", expression="dG = -n F E",
            variables={"n": "electrons transferred", "E": "cell potential (V)"},
            solver="gibbs_emf", ranges={"n": [1.0, 4.0], "E": [0.1, 1.5]}, int_vars=["n"],
            result_unit="J/mol", unit_factor=0.001, mistake_factor=2.0,
        ),
    ],
    "Reaction Kinetics": [
        FormulaEntry(
            name="First-order half-life", expression="t(1/2) = ln2 / k",
            variables={"k": "rate constant (s-1)"},
            solver="t_half_1st", ranges={"k": [0.001, 0.05]},
            result_unit="s", unit_factor=1 / 60, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Arrhenius equation", expression="k = A exp(-Ea/RT)",
            variables={"A": "pre-exponential factor (s-1)", "Ea": "activation energy (J/mol)", "T": "temperature (K)"},
            solver="arrhenius", ranges={"A": [1e6, 1e10], "Ea": [20000.0, 60000.0], "T": [300.0, 400.0]},
            result_unit="s-1", unit_factor=60.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="First-order concentration decay", expression="[A]t = [A]0 exp(-kt)",
            variables={"[A]0": "initial concentration (M)", "k": "rate constant (s-1)", "t": "time (s)"},
            solver="first_order_conc", ranges={"A0": [0.1, 1.0], "k": [0.001, 0.01], "t": [60.0, 600.0]},
            result_unit="M", unit_factor=1000.0, mistake_factor=2.0,
        ),
    ],
    "Thermodynamics": [
        FormulaEntry(
            name="Gibbs free energy", expression="dG = dH - T dS",
            variables={"dH": "enthalpy (J/mol)", "T": "temperature (K)", "dS": "entropy (J/mol K)"},
            solver="gibbs_dh_ts", ranges={"H": [-50000.0, 50000.0], "T": [250.0, 400.0], "S": [50.0, 250.0]},
            result_unit="J/mol", unit_factor=0.001, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Ideal gas law", expression="V = nRT/P",
            variables={"n": "moles", "T": "temperature (K)", "P": "pressure (atm)"},
            solver="ideal_gas_volume", ranges={"n": [0.5, 3.0], "T": [280.0, 350.0], "P": [0.5, 3.0]},
            result_unit="L", unit_factor=1000.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Gibbs free energy from K", expression="dG = -RT lnK",
            variables={"T": "temperature (K)", "K": "equilibrium constant"},
            solver="gibbs_rt_lnk", ranges={"T": [250.0, 400.0], "K": [0.01, 100.0]},
            result_unit="J/mol", unit_factor=0.001, mistake_factor=2.0,
        ),
    ],
}

CHEM_DISTRACTORS = {
    "Chemical Equilibria": [DistractorType.CONCEPT_SWAP, DistractorType.WRONG_SIGN, DistractorType.WRONG_UNIT],
    "Electrochemistry": [DistractorType.WRONG_SIGN, DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA],
    "Reaction Kinetics": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA, DistractorType.WRONG_ASSUMPTION],
    "Thermodynamics": [DistractorType.WRONG_SIGN, DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA],
}


# =====================================================================
# XL-Q Biochemistry (elective) - 20 Q / 30 marks (10 x 1-mark, 10 x 2-mark)
# =====================================================================

BIOCH_TOPICS = {
    "Organization of Life and Protein Structure": ["Protein folding and misfolding", "Myoglobin and haemoglobin", "Protein-ligand interactions"],
    "Enzyme Kinetics, Regulation and Bioenergetics": ["Michaelis-Menten kinetics", "Enzyme inhibition", "Vitamins and coenzymes", "Bioenergetics and ATP"],
    "Biochemical Separation Techniques": ["Chromatography", "Electrophoresis", "Centrifugation and spectroscopy"],
    "Cell Structure, Membranes and Transport": ["Membrane structure", "Membrane transport", "Action potential"],
    "Nucleic Acids, Replication and Expression": ["DNA replication", "Transcription and translation", "Recombinant DNA technology"],
    "Immunity and Immune System": ["Innate and adaptive immunity", "Antibody structure and function", "Cell-mediated and humoral immunity"],
}

BIOCH_WEIGHTAGE = {
    "Organization of Life and Protein Structure": 0.10,
    "Enzyme Kinetics, Regulation and Bioenergetics": 0.28,
    "Biochemical Separation Techniques": 0.08,
    "Cell Structure, Membranes and Transport": 0.14,
    "Nucleic Acids, Replication and Expression": 0.22,
    "Immunity and Immune System": 0.18,
}

BIOCH_FORMULAS = {
    "Enzyme Kinetics, Regulation and Bioenergetics": [
        FormulaEntry(
            name="Michaelis-Menten rate", expression="v = Vmax [S] / (Km + [S])",
            variables={"Vmax": "maximum rate (micromol/min)", "Km": "Michaelis constant (mM)", "[S]": "substrate (mM)"},
            solver="mm_rate", ranges={"Vmax": [10.0, 100.0], "Km": [0.5, 10.0], "S": [0.1, 20.0]},
            result_unit="micromol/min", unit_factor=1000.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Lineweaver-Burk", expression="1/v = (Km/Vmax)(1/[S]) + 1/Vmax",
            variables={"Vmax": "maximum rate (micromol/min)", "Km": "Michaelis constant (mM)", "[S]": "substrate (mM)"},
            solver="lineweaver_burk", ranges={"Vmax": [10.0, 100.0], "Km": [0.5, 10.0], "S": [0.5, 20.0]},
            result_unit="min/micromol", unit_factor=1000.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Turnover number", expression="kcat = Vmax / [E]t",
            variables={"Vmax": "max rate (micromol/s)", "[E]t": "total enzyme (micromol)"},
            solver="kcat", ranges={"Vmax": [1.0, 100.0], "Et": [0.5, 5.0]},
            result_unit="s-1", unit_factor=60.0, mistake_factor=2.0,
        ),
    ],
    "Biochemical Separation Techniques": [
        FormulaEntry(
            name="Beer-Lambert law", expression="A = eps c l",
            variables={"eps": "molar absorptivity (M-1 cm-1)", "c": "concentration (M)", "l": "path length (cm)"},
            solver="beer_lambert", ranges={"eps": [1e3, 1e4], "c": [1e-5, 1e-4], "l": [0.5, 2.0]},
            result_unit="", mistake_factor=2.0,
        ),
    ],
    "Nucleic Acids, Replication and Expression": [
        FormulaEntry(
            name="Semiconservative replication fraction", expression="fraction light-only = 1 - 2/2^n",
            variables={"n": "generations in light medium"},
            solver="dna_fraction_light", ranges={"n": [2.0, 8.0]}, int_vars=["n"], result_unit="",
        ),
    ],
}

BIOCH_DISTRACTORS = {
    "Enzyme Kinetics, Regulation and Bioenergetics": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
    "Biochemical Separation Techniques": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA],
    "Nucleic Acids, Replication and Expression": [DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
}


# =====================================================================
# XL-R Botany (elective) - 20 Q / 30 marks
# =====================================================================

BOTANY_TOPICS = {
    "Plant Systematics": ["Taxonomy and nomenclature", "Phylogenetic systematics"],
    "Plant Anatomy": ["Cell walls and meristems", "Tissue organisation", "Secondary growth"],
    "Plant Development": ["Cell and tissue morphogenesis", "Embryo and seedling development"],
    "Plant Physiology and Biochemistry": ["Photosynthesis", "Respiration", "Transport and signalling"],
    "Genetics and Genomics": ["Mendelian genetics", "Linkage and mapping", "Genome organisation"],
    "Plant Breeding, Genetic Modification, Genome Editing": ["Conventional breeding", "CRISPR and transgenics"],
    "Economic and Applied Botany": ["Medicinal and fibre plants", "Crops and sustainable agriculture"],
    "Plant Pathology": ["Pathogen types", "Plant disease mechanisms"],
    "Ecology and Environment": ["Ecosystem energetics", "Community dynamics", "Conservation"],
}

BOTANY_WEIGHTAGE = {
    "Plant Systematics": 0.08,
    "Plant Anatomy": 0.10,
    "Plant Development": 0.08,
    "Plant Physiology and Biochemistry": 0.22,
    "Genetics and Genomics": 0.20,
    "Plant Breeding, Genetic Modification, Genome Editing": 0.08,
    "Economic and Applied Botany": 0.06,
    "Plant Pathology": 0.08,
    "Ecology and Environment": 0.10,
}

BOTANY_FORMULAS = {
    "Genetics and Genomics": [
        FormulaEntry(
            name="Hardy-Weinberg heterozygote frequency", expression="2pq",
            variables={"p": "frequency of allele A"},
            solver="hardy_weinberg_heterozygote", ranges={"p": [0.2, 0.8]}, result_unit="",
        ),
    ],
    "Ecology and Environment": [
        FormulaEntry(
            name="Net primary productivity", expression="NPP = GPP - R",
            variables={"GPP": "gross primary productivity (gC/m2/yr)", "R": "respiration (gC/m2/yr)"},
            solver="npp", ranges={"GPP": [100.0, 500.0], "R": [20.0, 150.0]},
            result_unit="gC/m2/yr", mistake_factor=2.0,
        ),
    ],
}

BOTANY_DISTRACTORS = {
    "Genetics and Genomics": [DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
    "Ecology and Environment": [DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
}


# =====================================================================
# XL-S Microbiology (elective) - 20 Q / 30 marks
# =====================================================================

MICRO_TOPICS = {
    "Historical Perspective": ["Koch's postulates", "Discovery of antibiotics"],
    "Methods in Microbiology": ["Sterilisation and media", "Staining and microscopy"],
    "Microbial Taxonomy and Diversity": ["Classification of prokaryotes", "Bacterial phylogeny"],
    "Prokaryotic Cells: Structure and Function": ["Cell wall and membrane", "Flagella and pili", "Spores"],
    "Microbial Growth": ["Growth curve", "Generation time", "Continuous culture"],
    "Control of Micro-organisms": ["Physical control", "Chemical agents"],
    "Microbial Metabolism": ["Catabolism and fermentation", "Anabolism and energetics"],
    "Microbial Diseases and Host-Pathogen Interaction": ["Pathogenesis", "Virulence factors"],
    "Chemotherapy/Antibiotics": ["Antibiotic mechanisms", "Resistance"],
    "Microbial Genetics": ["Mutation", "Gene transfer and recombination"],
    "Microbial Ecology": ["Microbial communities", "Biogeochemical cycles"],
}

MICRO_WEIGHTAGE = {
    "Historical Perspective": 0.04,
    "Methods in Microbiology": 0.08,
    "Microbial Taxonomy and Diversity": 0.06,
    "Prokaryotic Cells: Structure and Function": 0.10,
    "Microbial Growth": 0.20,
    "Control of Micro-organisms": 0.08,
    "Microbial Metabolism": 0.14,
    "Microbial Diseases and Host-Pathogen Interaction": 0.08,
    "Chemotherapy/Antibiotics": 0.06,
    "Microbial Genetics": 0.08,
    "Microbial Ecology": 0.08,
}

MICRO_FORMULAS = {
    "Microbial Growth": [
        FormulaEntry(
            name="Generation time", expression="td = ln2 / mu",
            variables={"mu": "specific growth rate (h-1)"},
            solver="generation_time", ranges={"mu": [0.1, 1.0]},
            result_unit="h", unit_factor=60.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Exponential growth", expression="N = N0 2^(t/td)",
            variables={"N0": "initial cells", "t": "time (h)", "td": "doubling time (h)"},
            solver="exponential_growth", ranges={"N0": [1e3, 1e5], "t": [1.0, 10.0], "td": [0.5, 4.0]},
            result_unit="cells", mistake_factor=2.0,
        ),
        FormulaEntry(
            name="CFU count", expression="CFU/mL = colonies x dilution factor / volume plated",
            variables={"colonies": "counted colonies", "DF": "total dilution factor", "vol": "volume plated (mL)"},
            solver="cfu_count", ranges={"col": [25.0, 250.0], "DF": [1e3, 1e6], "vol": [0.1, 1.0]},
            int_vars=["col"],
            result_unit="CFU/mL", mistake_factor=2.0,
        ),
    ],
}

MICRO_DISTRACTORS = {
    "Microbial Growth": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
}


# =====================================================================
# XL-T Zoology (elective) - 20 Q / 30 marks
# =====================================================================

ZOOLOGY_TOPICS = {
    "Animal Diversity": ["Invertebrate phyla", "Vertebrate classes"],
    "Evolution": ["Mechanisms of evolution", "Speciation"],
    "Genetics": ["Mendelian inheritance", "Population genetics"],
    "Biochemistry and Molecular Biology": ["Macromolecules", "Enzyme function"],
    "Cell Biology": ["Organelles", "Cytoskeleton and division"],
    "Gene Expression in Eukaryotes": ["Transcription and processing", "Regulation"],
    "Animal Anatomy and Physiology": ["Circulation and respiration", "Excretion and osmoregulation"],
    "Parasitology and Immunology": ["Parasitic infections", "Immune responses"],
    "Developmental Biology": ["Gastrulation", "Pattern formation"],
    "Ecology": ["Population ecology", "Community ecology"],
    "Animal Behaviour": ["Foraging and communication", "Social behaviour"],
}

ZOOLOGY_WEIGHTAGE = {
    "Animal Diversity": 0.06,
    "Evolution": 0.06,
    "Genetics": 0.18,
    "Biochemistry and Molecular Biology": 0.18,
    "Cell Biology": 0.08,
    "Gene Expression in Eukaryotes": 0.08,
    "Animal Anatomy and Physiology": 0.14,
    "Parasitology and Immunology": 0.06,
    "Developmental Biology": 0.06,
    "Ecology": 0.08,
    "Animal Behaviour": 0.02,
}

ZOOLOGY_FORMULAS = {
    "Genetics": [
        FormulaEntry(
            name="Hardy-Weinberg heterozygote frequency", expression="2pq",
            variables={"p": "frequency of allele A"},
            solver="hardy_weinberg_heterozygote", ranges={"p": [0.2, 0.8]}, result_unit="",
        ),
    ],
    "Biochemistry and Molecular Biology": [
        FormulaEntry(
            name="Michaelis-Menten rate", expression="v = Vmax [S] / (Km + [S])",
            variables={"Vmax": "maximum rate (micromol/min)", "Km": "Michaelis constant (mM)", "[S]": "substrate (mM)"},
            solver="mm_rate", ranges={"Vmax": [10.0, 100.0], "Km": [0.5, 10.0], "S": [0.1, 20.0]},
            result_unit="micromol/min", unit_factor=1000.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Beer-Lambert law", expression="A = eps c l",
            variables={"eps": "molar absorptivity (M-1 cm-1)", "c": "concentration (M)", "l": "path length (cm)"},
            solver="beer_lambert", ranges={"eps": [1e3, 1e4], "c": [1e-5, 1e-4], "l": [0.5, 2.0]},
            result_unit="", mistake_factor=2.0,
        ),
    ],
    "Animal Anatomy and Physiology": [
        FormulaEntry(
            name="Cardiac output", expression="CO = HR x SV",
            variables={"HR": "heart rate (bpm)", "SV": "stroke volume (mL)"},
            solver="cardiac_output", ranges={"HR": [50.0, 120.0], "SV": [50.0, 120.0]},
            result_unit="mL/min", unit_factor=0.001, mistake_factor=2.0,
        ),
    ],
    "Ecology": [
        FormulaEntry(
            name="Net primary productivity", expression="NPP = GPP - R",
            variables={"GPP": "gross primary productivity (gC/m2/yr)", "R": "respiration (gC/m2/yr)"},
            solver="npp", ranges={"GPP": [100.0, 500.0], "R": [20.0, 150.0]},
            result_unit="gC/m2/yr", mistake_factor=2.0,
        ),
    ],
}

ZOOLOGY_DISTRACTORS = {
    "Genetics": [DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
    "Biochemistry and Molecular Biology": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA],
    "Animal Anatomy and Physiology": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
    "Ecology": [DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
}


# =====================================================================
# XL-U Food Technology (elective) - 20 Q / 30 marks
# =====================================================================

FOOD_TOPICS = {
    "Food Chemistry and Nutrition": ["Carbohydrates and proteins", "Lipids and pigments", "Vitamins and minerals", "Browning reactions"],
    "Food Microbiology": ["Spoilage organisms", "Fermented foods", "Food-borne pathogens"],
    "Food Products Technology": ["Thermal processing", "Preservation methods", "Milk and meat products"],
    "Food Engineering": ["Mass and energy balance", "Fluid flow and heat transfer", "Packaging and storage"],
}

FOOD_WEIGHTAGE = {
    "Food Chemistry and Nutrition": 0.30,
    "Food Microbiology": 0.22,
    "Food Products Technology": 0.28,
    "Food Engineering": 0.20,
}

FOOD_FORMULAS = {
    "Food Microbiology": [
        FormulaEntry(
            name="Generation time", expression="td = ln2 / mu",
            variables={"mu": "specific growth rate (h-1)"},
            solver="generation_time", ranges={"mu": [0.1, 1.0]},
            result_unit="h", unit_factor=60.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="CFU count", expression="CFU/mL = colonies x dilution factor / volume plated",
            variables={"colonies": "counted colonies", "DF": "total dilution factor", "vol": "volume plated (mL)"},
            solver="cfu_count", ranges={"col": [25.0, 250.0], "DF": [1e3, 1e6], "vol": [0.1, 1.0]},
            int_vars=["col"],
            result_unit="CFU/mL", mistake_factor=2.0,
        ),
    ],
    "Food Products Technology": [
        FormulaEntry(
            name="D-value (decimal reduction time)", expression="D = t / log10(N0/N)",
            variables={"t": "holding time (min)", "N0": "initial spores", "N": "surviving spores"},
            solver="d_value", ranges={"t": [10.0, 120.0], "N0": [1e5, 1e9], "N": [1.0, 100.0]},
            result_unit="min", unit_factor=60.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Z-value", expression="D2 = D1 10^((T1 - T2)/Z)",
            variables={"D1": "D-value at T1 (min)", "T1": "reference temperature (C)", "T2": "target temperature (C)", "Z": "z-value (C)"},
            solver="z_value", ranges={"D1": [1.0, 10.0], "T1": [110.0, 130.0], "T2": [90.0, 120.0], "Z": [8.0, 15.0]},
            result_unit="min", unit_factor=60.0, mistake_factor=2.0,
        ),
    ],
    "Food Engineering": [
        FormulaEntry(
            name="Dilution concentration", expression="C2 = C1 V1 / V2",
            variables={"C1": "stock concentration (M)", "V1": "stock volume (mL)", "V2": "final volume (mL)"},
            solver="mixing_concentration", ranges={"C1": [0.1, 1.0], "V1": [10.0, 100.0], "V2": [100.0, 500.0]},
            result_unit="M", unit_factor=1000.0, mistake_factor=2.0,
        ),
        FormulaEntry(
            name="Reynolds number", expression="Re = rho v D / mu",
            variables={"rho": "density (kg/m3)", "v": "velocity (m/s)", "D": "diameter (m)", "mu": "dynamic viscosity (Pa s)"},
            solver="reynolds", ranges={"rho": [900.0, 1100.0], "v": [0.5, 3.0], "D": [0.01, 0.05], "mu": [0.001, 0.01]},
            result_unit="", mistake_factor=2.0,
        ),
    ],
}

FOOD_DISTRACTORS = {
    "Food Microbiology": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA],
    "Food Products Technology": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA, DistractorType.WRONG_SIGN],
    "Food Engineering": [DistractorType.WRONG_UNIT, DistractorType.WRONG_FORMULA],
}


# =====================================================================
# XL registry assembly
# =====================================================================

XL_INSTRUCTIONAL_REGISTRY = SubjectMetadata(
    paper_code="XL",
    paper_name="Life Sciences",
    exam_duration=180,
    total_marks=100,
    questions=65,
    paper_pattern={"1_mark": 30, "2_mark": 35},
    numerical_ratio=0.20,
    mcq_ratio=0.65,
    msq_ratio=0.15,
    difficulty_distribution={"easy": 0.25, "medium": 0.50, "hard": 0.25},
    conceptual_ratio=0.35,
    calculation_ratio=0.45,
    analytical_ratio=0.20,
    diagram_frequency=0.10,
    formula_density="Medium-High",
    sections={
        "XL-P": SectionMetadata(
            code="XL-P", name="Chemistry (compulsory)", questions=15, marks=25,
            one_mark=5, two_mark=10, numerical_ratio=0.35, formula_density="High",
            topic_tree=CHEM_TOPICS, topic_weightage=CHEM_WEIGHTAGE,
            formula_registry=CHEM_FORMULAS, distractor_strategies=CHEM_DISTRACTORS,
        ),
        "XL-Q": SectionMetadata(
            code="XL-Q", name="Biochemistry", questions=20, marks=30,
            one_mark=10, two_mark=10, numerical_ratio=0.30, formula_density="Medium-High",
            topic_tree=BIOCH_TOPICS, topic_weightage=BIOCH_WEIGHTAGE,
            formula_registry=BIOCH_FORMULAS, distractor_strategies=BIOCH_DISTRACTORS,
        ),
        "XL-R": SectionMetadata(
            code="XL-R", name="Botany", questions=20, marks=30,
            one_mark=10, two_mark=10, numerical_ratio=0.25, formula_density="Low-Medium",
            topic_tree=BOTANY_TOPICS, topic_weightage=BOTANY_WEIGHTAGE,
            formula_registry=BOTANY_FORMULAS, distractor_strategies=BOTANY_DISTRACTORS,
        ),
        "XL-S": SectionMetadata(
            code="XL-S", name="Microbiology", questions=20, marks=30,
            one_mark=10, two_mark=10, numerical_ratio=0.35, formula_density="Medium",
            topic_tree=MICRO_TOPICS, topic_weightage=MICRO_WEIGHTAGE,
            formula_registry=MICRO_FORMULAS, distractor_strategies=MICRO_DISTRACTORS,
        ),
        "XL-T": SectionMetadata(
            code="XL-T", name="Zoology", questions=20, marks=30,
            one_mark=10, two_mark=10, numerical_ratio=0.30, formula_density="Medium",
            topic_tree=ZOOLOGY_TOPICS, topic_weightage=ZOOLOGY_WEIGHTAGE,
            formula_registry=ZOOLOGY_FORMULAS, distractor_strategies=ZOOLOGY_DISTRACTORS,
        ),
        "XL-U": SectionMetadata(
            code="XL-U", name="Food Technology", questions=20, marks=30,
            one_mark=10, two_mark=10, numerical_ratio=0.35, formula_density="High",
            topic_tree=FOOD_TOPICS, topic_weightage=FOOD_WEIGHTAGE,
            formula_registry=FOOD_FORMULAS, distractor_strategies=FOOD_DISTRACTORS,
        ),
    },
    solvers=SOLVERS,
    distractor_overrides=DISTRACTOR_OVERRIDES,
)
