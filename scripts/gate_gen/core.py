from __future__ import annotations

import math
import random
import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Set, Tuple

from pydantic import BaseModel, Field


class QuestionType(str, Enum):
    MCQ = "MCQ"
    MSQ = "MSQ"
    NAT = "NAT"


class BloomLevel(str, Enum):
    REMEMBER = "Remember"
    UNDERSTAND = "Understand"
    APPLY = "Apply"
    ANALYZE = "Analyze"
    EVALUATE = "Evaluate"
    CREATE = "Create"


class QuestionPattern(str, Enum):
    DEFINITION = "Definition"
    ASSERTION_REASON = "Assertion Reason"
    NUMERICAL = "Numerical"
    MULTI_CONCEPT = "Multi Concept"
    GRAPH_INTERPRETATION = "Graph Interpretation"
    CASE_STUDY = "Case Study"
    PYQ_INSPIRED = "PYQ Inspired"


class DistractorType(str, Enum):
    WRONG_SIGN = "Wrong Sign"
    WRONG_UNIT = "Wrong Unit"
    WRONG_FORMULA = "Wrong Formula"
    WRONG_ASSUMPTION = "Wrong Assumption"
    BOUNDARY_CONDITION = "Boundary Condition"
    CONCEPT_SWAP = "Concept Swap"


class Option(BaseModel):
    key: str
    text: str
    distractor_type: Optional[DistractorType] = None
    derivation_logic: str = ""


class QualityBreakdown(BaseModel):
    uniqueness: float
    correctness: float
    bloom_alignment: float
    ambiguity_penalty: float
    pyq_similarity: float
    distractor_strength: float
    numerical_validity: float
    grammar: float
    final_score: float


class QuestionProvenance(BaseModel):
    version: str = "v1.1"
    llm_model: str = "deterministic-templates"
    prompt_version: str = "p2.4"
    knowledge_version: str = "k2026.1"
    reference_citation: str
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ProductionQuestion(BaseModel):
    id: str = Field(default_factory=lambda: f"Q-{uuid.uuid4().hex[:8]}")
    paper_code: str
    section: str
    topic_path: List[str]
    q_type: QuestionType
    bloom_level: BloomLevel
    pattern: QuestionPattern
    marks: int
    negative_marks: float
    question_text: str
    options: Optional[List[Option]] = None
    numerical_answer: Optional[float] = None
    tolerance_range: Optional[Tuple[float, float]] = None
    unit: Optional[str] = None
    correct_keys: List[str]
    solution_steps: List[str]
    formulae_used: List[str]
    formula_params: Dict[str, str] = Field(default_factory=dict)
    computed_difficulty_score: float
    quality_breakdown: Optional[QualityBreakdown] = None
    provenance: QuestionProvenance


class FormulaEntry(BaseModel):
    name: str
    expression: str
    variables: Dict[str, str] = Field(default_factory=dict)
    canonical_units: Dict[str, str] = Field(default_factory=dict)
    solver: str = ""
    ranges: Dict[str, List[float]] = Field(default_factory=dict)
    int_vars: List[str] = Field(default_factory=list)
    result_unit: str = ""
    unit_factor: Optional[float] = None
    mistake_factor: Optional[float] = None
    add_offset: Optional[float] = None


class SectionMetadata(BaseModel):
    code: str
    name: str
    questions: int
    marks: int
    one_mark: int
    two_mark: int
    numerical_ratio: float
    formula_density: str
    topic_tree: Dict[str, Any]
    topic_weightage: Dict[str, float]
    formula_registry: Dict[str, List[FormulaEntry]]
    distractor_strategies: Dict[str, List[DistractorType]] = Field(default_factory=dict)


class SubjectMetadata(BaseModel):
    paper_code: str
    paper_name: str
    exam_duration: int = 180
    total_marks: int = 100
    questions: int = 65
    paper_pattern: Dict[str, int] = Field(default_factory=lambda: {"1_mark": 30, "2_mark": 35})
    numerical_ratio: float
    mcq_ratio: float
    msq_ratio: float
    difficulty_distribution: Dict[str, float]
    conceptual_ratio: float
    calculation_ratio: float
    analytical_ratio: float
    diagram_frequency: float
    formula_density: str
    topic_tree: Dict[str, Any] = Field(default_factory=dict)
    topic_weightage: Dict[str, float] = Field(default_factory=dict)
    formula_registry: Dict[str, List[FormulaEntry]] = Field(default_factory=dict)
    distractor_strategies: Dict[str, List[DistractorType]] = Field(default_factory=dict)
    sections: Dict[str, SectionMetadata] = Field(default_factory=dict)
    solvers: Dict[str, Callable] = Field(default_factory=dict)
    distractor_overrides: Dict[str, Callable] = Field(default_factory=dict)


class AgentMemory(BaseModel):
    generated_question_ids: Set[str] = Field(default_factory=set)
    covered_topic_paths: List[str] = Field(default_factory=list)
    covered_formulae: Set[str] = Field(default_factory=set)
    difficulty_histogram: Dict[str, int] = Field(default_factory=lambda: {"easy": 0, "medium": 0, "hard": 0})
    pyq_similarity_hashes: Set[str] = Field(default_factory=set)
    coverage: Set[str] = Field(default_factory=set)

    def is_covered(self, topic_path: str, formula: str) -> bool:
        return f"{topic_path}::{formula}" in self.coverage

    def is_duplicate(self, topic_path: str, formula: str, params_sig: str = "") -> bool:
        return f"{topic_path}::{formula}::{params_sig}" in self.pyq_similarity_hashes

    def record_generation(self, q: ProductionQuestion):
        self.generated_question_ids.add(q.id)
        self.covered_topic_paths.append(" -> ".join(q.topic_path))
        self.covered_formulae.update(q.formulae_used)
        if q.computed_difficulty_score < 70:
            self.difficulty_histogram["easy"] += 1
        elif q.computed_difficulty_score < 90:
            self.difficulty_histogram["medium"] += 1
        else:
            self.difficulty_histogram["hard"] += 1
        topic_path = " -> ".join(q.topic_path)
        self.coverage.add(f"{topic_path}::{','.join(q.formulae_used)}")
        params_sig = "|".join(f"{k}={v}" for k, v in sorted(q.formula_params.items()))
        self.pyq_similarity_hashes.add(f"{topic_path}::{','.join(q.formulae_used)}::{params_sig}")


class DifficultyEngine:
    @staticmethod
    def compute_score(formula_count, concept_count, numerical_depth, has_diagram, bloom) -> float:
        bloom_weights = {
            BloomLevel.REMEMBER: 10, BloomLevel.UNDERSTAND: 25, BloomLevel.APPLY: 50,
            BloomLevel.ANALYZE: 75, BloomLevel.EVALUATE: 90, BloomLevel.CREATE: 100,
        }
        score = (
            (formula_count * 15)
            + (concept_count * 20)
            + (numerical_depth * 10)
            + (15 if has_diagram else 0)
            + (bloom_weights[bloom] * 0.4)
        )
        return round(min(100.0, max(0.0, score)), 2)


class QualityScorer:
    @staticmethod
    def evaluate(question: ProductionQuestion, is_duplicate: bool) -> QualityBreakdown:
        uniqueness = 0.0 if is_duplicate else 98.0
        correctness = 100.0 if question.solution_steps else 0.0
        bloom_align = 95.0
        ambiguity_penalty = 0.0
        distractor_str = 96.0 if question.options else 100.0
        num_validity = 100.0 if (question.q_type != QuestionType.NAT or question.tolerance_range) else 0.0
        grammar = 100.0
        pyq_sim = 40.0
        final_score = (
            (uniqueness * 0.25)
            + (correctness * 0.25)
            + (bloom_align * 0.15)
            + (distractor_str * 0.15)
            + (num_validity * 0.10)
            + (grammar * 0.10)
            - ambiguity_penalty
        )
        return QualityBreakdown(
            uniqueness=uniqueness, correctness=correctness, bloom_alignment=bloom_align,
            ambiguity_penalty=ambiguity_penalty, pyq_similarity=pyq_sim,
            distractor_strength=distractor_str, numerical_validity=num_validity,
            grammar=grammar, final_score=round(final_score, 2),
        )


class VerificationPipeline:
    @staticmethod
    def run_checks(question: ProductionQuestion) -> Tuple[bool, List[str]]:
        errors = []
        if not question.unit and question.q_type == QuestionType.NAT:
            errors.append("NAT question missing dimensional unit specification.")
        if question.q_type == QuestionType.MCQ and question.options:
            keys = [o.key for o in question.options]
            if len(keys) != len(set(keys)):
                errors.append("Duplicate option keys detected.")
            if len(question.options) != 4:
                errors.append("MCQ must contain exactly 4 choices.")
            texts = [o.text for o in question.options]
            if len(texts) != len(set(texts)):
                errors.append("Duplicate option values detected.")
        if question.q_type == QuestionType.NAT and question.numerical_answer is None:
            errors.append("NAT question lacks an exact numerical answer.")
        return len(errors) == 0, errors


# =====================================================================
# Plain-python graph (dependency-free port of the LangGraph StateGraph)
# =====================================================================

END = "__end__"


class Graph:
    def __init__(self):
        self._nodes: Dict[str, Callable] = {}
        self._entry: Optional[str] = None
        self._edges: Dict[str, str] = {}
        self._conditional: Dict[str, Tuple[Callable, Dict[str, str]]] = {}

    def add_node(self, name, fn):
        self._nodes[name] = fn
        return self

    def set_entry_point(self, name):
        self._entry = name
        return self

    def add_edge(self, src, dst):
        self._edges[src] = dst
        return self

    def add_conditional_edges(self, src, gate, mapping):
        self._conditional[src] = (gate, mapping)
        return self

    def invoke(self, state: Dict[str, Any], max_retries: int = 4) -> Dict[str, Any]:
        node = self._entry
        retries = 0
        while node is not None:
            updates = self._nodes[node](state)
            state = {**state, **updates}
            if node in self._conditional:
                gate, mapping = self._conditional[node]
                result = gate(state)
                if result == "retry" and retries < max_retries:
                    retries += 1
                    node = mapping["retry"]
                else:
                    node = mapping.get("pass")
            else:
                node = self._edges.get(node)
            if node == END:
                node = None
        return state


# =====================================================================
# Question builder (real generator core)
# =====================================================================


def _rs(value: float) -> float:
    return float(f"{value:.4g}")


def sample_params(entry: FormulaEntry, rng: random.Random) -> Dict[str, float]:
    params = {}
    for var, (lo, hi) in entry.ranges.items():
        v = lo + rng.random() * (hi - lo)
        params[var] = round(v) if var in entry.int_vars else v
    return params


def _generic_distractors(entry: FormulaEntry, value: float) -> List[Tuple[float, Optional[DistractorType], str]]:
    out = []
    if entry.unit_factor:
        out.append((_rs(value * entry.unit_factor), DistractorType.WRONG_UNIT,
                    f"Used a different unit scale for {entry.result_unit}."))
    if entry.mistake_factor:
        out.append((_rs(value * entry.mistake_factor), DistractorType.WRONG_FORMULA,
                    "Mis-applied the formula (classic slip)."))
    if entry.add_offset is not None:
        out.append((_rs(value + entry.add_offset), DistractorType.WRONG_FORMULA,
                    f"Off by {entry.add_offset} in the constant term."))
    out.append((_rs(-value), DistractorType.WRONG_SIGN, "Flipped the sign of the computed value."))
    return out


def build_options(entry: FormulaEntry, value: float, params: Dict[str, float],
                  rng: random.Random, meta: SubjectMetadata) -> Tuple[List[Option], str]:
    override = meta.distractor_overrides.get(entry.solver)
    if override:
        candidates = override(value, params)
    else:
        candidates = _generic_distractors(entry, value)

    seen, distractors = set(), []
    for val, dtype, logic in candidates:
        key = _rs(val)
        if key in seen:
            continue
        seen.add(key)
        distractors.append((val, dtype, logic))
        if len(distractors) >= 3:
            break

    pad = 2
    while len(distractors) < 3:
        val = _rs(value * (2 + pad))
        if val not in seen:
            seen.add(val)
            distractors.append((val, DistractorType.WRONG_ASSUMPTION, "Decimal-place slip in the calculation."))
        pad += 1

    pairs = [(_rs(value), None, "Correct application of the formula.")] + distractors
    rng.shuffle(pairs)
    letters = ["A", "B", "C", "D"]
    correct_key = None
    opts = []
    for idx, (val, dtype, logic) in enumerate(pairs):
        key = letters[idx]
        if dtype is None:
            correct_key = key
        opts.append(Option(key=key, text=str(val), distractor_type=dtype, derivation_logic=logic))
    return opts, correct_key


def _pick_topic(section: SectionMetadata, rng: random.Random) -> str:
    candidates = [t for t, entries in section.formula_registry.items() if entries]
    weights = [section.topic_weightage.get(t, 0.0) for t in candidates]
    total = sum(weights) or 1.0
    r = rng.random() * total
    acc = 0.0
    for t, w in zip(candidates, weights):
        acc += w
        if r <= acc:
            return t
    return candidates[-1]


def _pick_section(meta: SubjectMetadata, rng: random.Random) -> str:
    codes = list(meta.sections.keys())
    weights = [meta.sections[c].questions for c in codes]
    total = sum(weights)
    r = rng.random() * total
    acc = 0.0
    for c, w in zip(codes, weights):
        acc += w
        if r <= acc:
            return c
    return codes[-1]


def _question_text(entry: FormulaEntry, params: Dict[str, float], value: float, unit: str) -> str:
    param_str = ", ".join(f"{k} = {v:.4g}" for k, v in params.items())
    return (f"Using {entry.name} ({entry.expression}) with {param_str}, "
            f"compute the value of the required quantity.")


# =====================================================================
# LangGraph-style nodes
# =====================================================================


def _pick_uncovered(meta: SubjectMetadata, section: SectionMetadata, memory: AgentMemory,
                    rng: random.Random) -> Tuple[str, FormulaEntry]:
    fresh = []
    for topic, entries in section.formula_registry.items():
        for e in entries:
            if not memory.is_covered(f"{section.code} -> {topic}", e.name):
                fresh.append((topic, e))
    if fresh:
        weights = [section.topic_weightage.get(t, 0.0) for t, _ in fresh]
        total = sum(weights) or 1.0
        r = rng.random() * total
        acc = 0.0
        for (t, e), w in zip(fresh, weights):
            acc += w
            if r <= acc:
                return t, e
        return fresh[-1]
    topic = _pick_topic(section, rng)
    return topic, rng.choice(section.formula_registry[topic])


def planner_node(state: Dict[str, Any]) -> Dict[str, Any]:
    meta = state["metadata"]
    rng = state["rng"]
    memory = state["memory"]
    section_code = state.get("section") or _pick_section(meta, rng)
    section = meta.sections[section_code]

    if state.get("formula"):
        entries = [e for entries in section.formula_registry.values() for e in entries]
        entry = next((e for e in entries if e.name == state["formula"]), None)
        topic = state.get("topic") or next(
            (t for t, es in section.formula_registry.items() if entry in es), list(section.formula_registry)[0]
        )
    elif state.get("topic"):
        entry = rng.choice(section.formula_registry.get(state["topic"]) or [])
        topic = state["topic"]
    else:
        topic, entry = _pick_uncovered(meta, section, memory, rng)

    # NAT requires a dimensional unit; unitless quantities stay MCQ.
    q_type = QuestionType.NAT if (entry.result_unit and rng.random() < section.numerical_ratio) else QuestionType.MCQ
    two_mark_prob = section.two_mark / max(1, section.one_mark + section.two_mark)
    marks = 2 if rng.random() < two_mark_prob else 1

    diff_roll = rng.random()
    cum = 0.0
    band = "medium"
    for name, weight in meta.difficulty_distribution.items():
        cum += weight
        if diff_roll <= cum:
            band = name
            break
    if band == "easy":
        bloom, concept_count, depth = BloomLevel.UNDERSTAND, 1, 1
    elif band == "hard":
        bloom, concept_count, depth = BloomLevel.ANALYZE, 2, 3
    else:
        bloom, concept_count, depth = BloomLevel.APPLY, 1, 2

    pattern = QuestionPattern.NUMERICAL if q_type == QuestionType.NAT else QuestionPattern.PYQ_INSPIRED
    blueprint = {
        "section": section_code,
        "topic": topic,
        "formula": entry,
        "q_type": q_type,
        "bloom": bloom,
        "pattern": pattern,
        "marks": marks,
        "negative_marks": round(1 / 3 if marks == 1 else 2 / 3, 3),
        "concept_count": concept_count,
        "depth": depth,
    }
    return {"blueprint": blueprint, "pipeline_passed": False, "pipeline_errors": [], "quality_metrics": None}


def generation_node(state: Dict[str, Any]) -> Dict[str, Any]:
    bp = state["blueprint"]
    meta = state["metadata"]
    rng = state["rng"]
    entry: FormulaEntry = bp["formula"]
    solver = meta.solvers.get(entry.solver)
    params = sample_params(entry, rng)
    value, unit = solver(params)
    value = _rs(value)

    provenance = QuestionProvenance(
        reference_citation=f"GATE {meta.paper_code} syllabus · {bp['section']} · {bp['topic']}"
    )
    common = dict(
        paper_code=meta.paper_code,
        section=bp["section"],
        topic_path=[bp["section"], bp["topic"], entry.name],
        q_type=bp["q_type"],
        bloom_level=bp["bloom"],
        pattern=bp["pattern"],
        marks=bp["marks"],
        negative_marks=bp["negative_marks"],
        question_text=_question_text(entry, params, value, unit),
        solution_steps=[
            f"Apply {entry.expression}",
            f"Substitute {', '.join(f'{k}={v:.4g}' for k, v in params.items())}",
            f"Result = {value} {unit}".strip(),
        ],
        formulae_used=[entry.name],
        formula_params={k: f"{v:.4g}" for k, v in params.items()},
        computed_difficulty_score=DifficultyEngine.compute_score(1, bp["concept_count"], bp["depth"], False, bp["bloom"]),
        provenance=provenance,
    )

    if bp["q_type"] == QuestionType.NAT:
        tol = abs(value) * 0.02
        q = ProductionQuestion(
            numerical_answer=value,
            tolerance_range=(value - tol, value + tol),
            unit=unit,
            correct_keys=["NAT"],
            **common,
        )
    else:
        options, correct_key = build_options(entry, value, params, rng, meta)
        q = ProductionQuestion(
            options=options,
            unit=unit if unit else None,
            correct_keys=[correct_key],
            **common,
        )
    return {"current_question": q}


def verification_node(state: Dict[str, Any]) -> Dict[str, Any]:
    q = state["current_question"]
    mem = state["memory"]
    passed, errors = VerificationPipeline.run_checks(q)
    params_sig = "|".join(f"{k}={v}" for k, v in sorted(q.formula_params.items()))
    is_dup = mem.is_duplicate(" -> ".join(q.topic_path), ",".join(q.formulae_used), params_sig)
    metrics = QualityScorer.evaluate(q, is_dup)
    if passed and metrics.final_score >= 90.0 and not is_dup:
        mem.record_generation(q)
    return {
        "pipeline_passed": passed and not is_dup,
        "pipeline_errors": errors,
        "quality_metrics": metrics,
        "retry_count": state["retry_count"] + 1,
    }


def quality_gate(state: Dict[str, Any]) -> str:
    metrics = state["quality_metrics"]
    if state["pipeline_passed"] and metrics is not None and metrics.final_score >= 90.0:
        return "pass"
    if state["retry_count"] >= 3:
        return "pass"
    return "retry"


def build_graph() -> Graph:
    g = Graph()
    g.add_node("planner", planner_node)
    g.add_node("generator", generation_node)
    g.add_node("verifier", verification_node)
    g.set_entry_point("planner")
    g.add_edge("planner", "generator")
    g.add_edge("generator", "verifier")
    g.add_conditional_edges("verifier", quality_gate, {"pass": END, "retry": "generator"})
    return g


def new_state(meta: SubjectMetadata, memory: AgentMemory, rng: random.Random,
              section=None, topic=None, formula=None) -> Dict[str, Any]:
    return {
        "paper_code": meta.paper_code,
        "section": section,
        "topic": topic,
        "formula": formula,
        "metadata": meta,
        "memory": memory,
        "rng": rng,
        "blueprint": {},
        "current_question": None,
        "pipeline_passed": False,
        "pipeline_errors": [],
        "quality_metrics": None,
        "retry_count": 0,
    }


def generate(meta: SubjectMetadata, graph: Graph, memory: AgentMemory, count: int, seed: int,
             section=None, topic=None, formula=None) -> List[Tuple[ProductionQuestion, QualityBreakdown]]:
    rng = random.Random(seed)
    out = []
    for _ in range(count):
        result = graph.invoke(new_state(meta, memory, rng, section, topic, formula))
        q = result["current_question"]
        metrics = result["quality_metrics"]
        if q is not None and result["pipeline_passed"] and metrics is not None and metrics.final_score >= 90.0:
            out.append((q, metrics))
    return out
