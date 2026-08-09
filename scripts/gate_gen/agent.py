"""LangGraph agentic writer for GATE XL questions.

Architecture: the deterministic pipeline owns *numbers* (planner picks the
formula + parameter values, solver computes the ground-truth answer), and the
LLM owns *language* (the stem and the worked solution). The verifier node
cross-checks the LLM's declared answer against the solver's value and retries
the writer on mismatch, so the LLM can never publish a wrong number.

The stem prompt forbids naming the formula or printing the equation, so
questions read like real GATE XL papers instead of "Using X (y) with params,
compute the value".

Usage:
    from gate_gen.agent import build_agent_graph, generate
    app = build_agent_graph(model="qwen2.5:7b")
    questions = generate(XL_INSTRUCTIONAL_REGISTRY, app, AgentMemory(), count=8, seed=7)

Requires a running Ollama server (OLLAMA_HOST) and the langgraph +
langchain-ollama packages.
"""

from __future__ import annotations

import math
import random
import sys
import traceback
from typing import Any, Dict, List, Optional, Tuple, TypedDict

from pydantic import BaseModel, Field
from langgraph.graph import END, StateGraph
from langchain_ollama import ChatOllama

from gate_gen.core import (
    AgentMemory,
    DifficultyEngine,
    Option,
    ProductionQuestion,
    QualityBreakdown,
    QualityScorer,
    QuestionProvenance,
    QuestionType,
    SubjectMetadata,
    VerificationPipeline,
    _question_text,
    _rs,
    build_options,
    sample_params,
)
from gate_gen.core import planner_node as _det_planner

R = 8.314
F = 96485


class WriterDraft(BaseModel):
    stem: str = Field(description="The full question stem, GATE-style, without naming the formula or printing the equation.")
    solution_steps: List[str] = Field(description="Worked solution as a list of steps, formula stated here, concluding with the numeric answer.")
    declared_answer: float = Field(description="The numeric answer the stem asks for, matching the value supplied in the prompt.")
    unit: str = Field(description="Unit of the answer (empty string if dimensionless).")


def make_writer(model: str = "qwen2.5:7b", base_url: Optional[str] = None) -> Any:
    llm = ChatOllama(
        model=model,
        base_url=base_url,
        temperature=0.4,
        num_ctx=4096,
    )
    return llm.with_structured_output(WriterDraft)


def _num_str(v: float) -> str:
    return f"{v:.4g}"


def _plain(v: float) -> str:
    """Plain decimal rendering (never scientific) so the model copies it exactly."""
    s = f"{v:.10f}".rstrip("0").rstrip(".")
    return s if s and s != "-" else "0"


def _writer_prompt(meta: SubjectMetadata, section_name: str, topic: str, entry, params, value: float, unit: str) -> str:
    params_lines = "\n".join(
        f"- {k} = {_num_str(v)} {entry.canonical_units.get(k, entry.variables.get(k, ''))}"
        for k, v in params.items()
    )
    return f"""You are writing a single multiple-choice {meta.paper_name} (GATE XL) exam question.

Topic: {section_name} > {topic}
Formula: {entry.name} — {entry.expression}
Parameter values used (the ONLY numbers you may use):
{params_lines}

Correct numerical answer: {_plain(value)} {unit}

Write a realistic GATE-style question stem that embeds these values in a
natural experimental or applied scenario.

Hard rules:
- Do NOT name the formula ({entry.name}) in the stem. Do NOT print the
  equation or the variable symbols. A student must recognise the concept
  from the scenario alone.
- Plain ASCII text only in the stem: NO Greek letters, NO LaTeX ($...$),
  NO delta/Delta prefixes. Use standard exam notation such as "Vmax",
  "Km", "[S]" or plain English — never "μmax", "ΔVmax", "Δ1/v".
- Use exactly the numbers above, with their real units, stated in plain
  language (e.g. "at 37 °C" instead of "T = 310 K" where the variable allows).
- The stem must end by asking for the single quantity whose value is the
  correct answer above (one clear, unambiguous quantity).
- solution_steps: a concise worked solution a topper would write — name the
  formula and equation here (the solution may), plug the values with units,
  show the arithmetic, and conclude with the numeric answer.
- declared_answer: copy the value {_plain(value)} EXACTLY. This field is
  verified programmatically against {_plain(value)}. Do NOT recompute it,
  do NOT convert units, do NOT use scientific notation or rounding — copy the
  number character-for-character. The arithmetic belongs in solution_steps,
  not here.
- unit is the unit of the answer: "{unit}" (empty string if dimensionless).

Return the JSON object only."""
class WriterError(Exception):
    pass


class AgentState(TypedDict, total=False):
    paper_code: str
    section: Optional[str]
    topic: Optional[str]
    formula: Optional[str]
    metadata: SubjectMetadata
    memory: AgentMemory
    rng: random.Random
    model: str
    writer: Any
    blueprint: Dict[str, Any]
    draft: Optional[WriterDraft]
    current_question: Optional[ProductionQuestion]
    pipeline_passed: bool
    pipeline_errors: List[str]
    quality_metrics: Optional[QualityBreakdown]
    writer_feedback: Optional[str]
    writer_error: Optional[str]
    ground_value: Optional[float]
    ground_unit: Optional[str]
    retry_count: int


def _entry_params_from_blueprint(bp: Dict[str, Any], rng: random.Random):
    entry = bp["formula"]
    params = sample_params(entry, rng)
    return entry, params


def _round_params(entry, params: Dict[str, float]) -> Dict[str, float]:
    """Round sampled values to 3 sig figs so stems read like real GATE numbers."""
    out = {}
    for k, v in params.items():
        if k in entry.int_vars:
            out[k] = round(v)
            continue
        if v == 0:
            out[k] = 0.0
            continue
        out[k] = round(v, max(0, 2 - int(math.floor(math.log10(abs(v))))))
    return out


def planner_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Same selection logic as the deterministic pipeline, plus sampled params."""
    bp = _det_planner(state)["blueprint"]
    entry, params = _entry_params_from_blueprint(bp, state["rng"])
    params = _round_params(entry, params)
    bp = {**bp, "params": params}
    return {"blueprint": bp, "pipeline_passed": False, "pipeline_errors": [], "quality_metrics": None}


def writer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    bp = state["blueprint"]
    meta = state["metadata"]
    entry = bp["formula"]
    params = bp["params"]
    solver = meta.solvers[entry.solver]
    value, unit = solver(params)
    value = _rs(value)

    section_name = f"{bp['section']} {meta.sections[bp['section']].name}"
    feedback = state.get("writer_feedback")
    prompt = _writer_prompt(meta, section_name, bp["topic"], entry, params, value, unit)
    if feedback:
        prompt += f"\n\nPrevious attempt failed verification: {feedback}\nRewrite the stem/solution so the declared answer matches the required value."

    try:
        draft = state["writer"].invoke(prompt)
    except Exception as e:  # LLM/parse failure -> fail this attempt, retry
        traceback.print_exc(file=sys.stderr)
        return {"writer_error": f"writer call failed: {e}", "pipeline_passed": False,
                "pipeline_errors": [f"writer call failed: {e}"]}

    return {
        "draft": draft,
        "ground_value": value,
        "ground_unit": unit,
        "writer_error": None,
    }


def solver_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Assemble the ProductionQuestion. Answer value ALWAYS comes from the solver."""
    bp = state["blueprint"]
    meta = state["metadata"]
    entry = bp["formula"]
    params = bp["params"]
    value = state.get("ground_value")
    unit = state.get("ground_unit")
    draft = state.get("draft")
    if draft is None or value is None:
        return {"pipeline_passed": False, "pipeline_errors": ["no draft from writer"]}

    provenance = QuestionProvenance(
        llm_model=f"ollama:{state.get('model', 'qwen2.5:7b')}",
        reference_citation=f"GATE {meta.paper_code} syllabus · {bp['section']} · {bp['topic']}",
    )
    solution = list(draft.solution_steps)
    if not solution:
        solution = [
            f"Apply {entry.expression}",
            f"Substitute {', '.join(f'{k}={_num_str(v)}' for k, v in params.items())}",
            f"Result = {_num_str(value)} {unit}".strip(),
        ]
    common = dict(
        paper_code=meta.paper_code,
        section=bp["section"],
        topic_path=[bp["section"], bp["topic"], entry.name],
        q_type=bp["q_type"],
        bloom_level=bp["bloom"],
        pattern=bp["pattern"],
        marks=bp["marks"],
        negative_marks=bp["negative_marks"],
        question_text=draft.stem,
        solution_steps=solution,
        formulae_used=[entry.name],
        formula_params={k: _num_str(v) for k, v in params.items()},
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
        options, correct_key = build_options(entry, value, params, state["rng"], meta)
        q = ProductionQuestion(
            options=options,
            unit=unit if unit else None,
            correct_keys=[correct_key],
            **common,
        )
    return {"current_question": q}


def _answer_match(q: ProductionQuestion, declared: float) -> bool:
    if q.q_type == QuestionType.NAT:
        target = q.numerical_answer
    else:
        correct = next(o for o in q.options if o.key == q.correct_keys[0])
        target = float(correct.text)
    return abs(declared - target) <= 0.02 * abs(target)


def verifier_node(state: Dict[str, Any]) -> Dict[str, Any]:
    q = state.get("current_question")
    draft = state.get("draft")
    errors = list(state.get("pipeline_errors", []))
    if q is None or draft is None:
        return {"pipeline_passed": False, "pipeline_errors": errors or ["no question"],
                "writer_feedback": "writer produced no question"}
    passed, verr = VerificationPipeline.run_checks(q)
    errors.extend(verr)

    if not _answer_match(q, draft.declared_answer):
        errors.append(f"LLM declared answer {draft.declared_answer} does not match solver value "
                      f"{(q.numerical_answer if q.q_type == QuestionType.NAT else 'options')}")

    mem = state["memory"]
    params_sig = "|".join(f"{k}={v}" for k, v in sorted(q.formula_params.items()))
    is_dup = mem.is_duplicate(" -> ".join(q.topic_path), ",".join(q.formulae_used), params_sig)
    metrics = QualityScorer.evaluate(q, is_dup)

    if passed and not errors and metrics.final_score >= 90.0 and not is_dup:
        mem.record_generation(q)
        return {"pipeline_passed": True, "pipeline_errors": [], "quality_metrics": metrics,
                "retry_count": state["retry_count"] + 1, "writer_feedback": None}
    return {"pipeline_passed": False, "pipeline_errors": errors, "quality_metrics": metrics,
            "retry_count": state["retry_count"] + 1,
            "writer_feedback": "; ".join(errors)[:500]}


def quality_gate(state: Dict[str, Any]) -> str:
    if state["pipeline_passed"]:
        return "pass"
    if state["retry_count"] >= 3:
        return "pass"
    return "retry"


def build_agent_graph(model: str = "qwen2.5:7b", base_url: Optional[str] = None) -> Any:
    writer = make_writer(model, base_url)
    g = StateGraph(AgentState)
    g.add_node("planner", planner_node)
    g.add_node("writer", writer_node)
    g.add_node("solver", solver_node)
    g.add_node("verifier", verifier_node)
    g.set_entry_point("planner")
    g.add_edge("planner", "writer")
    g.add_edge("writer", "solver")
    g.add_edge("solver", "verifier")
    g.add_conditional_edges("verifier", quality_gate, {"pass": END, "retry": "writer"})
    return g.compile()


def generate(meta: SubjectMetadata, app, memory: AgentMemory, count: int, seed: int,
             model: str = "qwen2.5:7b", base_url: Optional[str] = None,
             section=None, topic=None, formula=None) -> List[Tuple[ProductionQuestion, QualityBreakdown]]:
    rng = random.Random(seed)
    writer = make_writer(model, base_url)
    out = []
    for _ in range(count):
        state = {
            "paper_code": meta.paper_code,
            "section": section,
            "topic": topic,
            "formula": formula,
            "metadata": meta,
            "memory": memory,
            "rng": rng,
            "model": model,
            "writer": writer,
            "blueprint": {},
            "draft": None,
            "current_question": None,
            "pipeline_passed": False,
            "pipeline_errors": [],
            "quality_metrics": None,
            "writer_feedback": None,
            "writer_error": None,
            "retry_count": 0,
        }
        result = app.invoke(state)
        q = result["current_question"]
        metrics = result["quality_metrics"]
        if q is not None and result["pipeline_passed"] and metrics is not None and metrics.final_score >= 90.0:
            out.append((q, metrics))
    return out
