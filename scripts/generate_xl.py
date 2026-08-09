#!/usr/bin/env python3
"""Generate GATE XL (Life Sciences) questions via the question-generator pipeline.

Usage:
  python3 scripts/generate_xl.py --count 10 [--section XL-Q] [--topic "Reaction Kinetics"]
                                 [--seed 42] [--out questions.json] [--self-check]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from gate_gen.core import AgentMemory, VerificationPipeline, build_graph, generate
from gate_gen.xl import XL_INSTRUCTIONAL_REGISTRY


def self_check() -> None:
    graph = build_graph()
    memory = AgentMemory()
    results = generate(XL_INSTRUCTIONAL_REGISTRY, graph, memory, count=16, seed=7)
    assert len(results) >= 10, f"only {len(results)} questions generated"
    for q, metrics in results:
        ok, errors = VerificationPipeline.run_checks(q)
        assert ok, errors
        assert metrics.final_score >= 90.0, metrics.final_score
        assert 0 <= q.computed_difficulty_score <= 100
        if q.q_type.value == "MCQ":
            assert len(q.options) == 4
            assert len({o.key for o in q.options}) == 4
            assert len({o.text for o in q.options}) == 4
            assert q.correct_keys[0] in {o.key for o in q.options}
        else:
            assert q.numerical_answer is not None
            assert q.tolerance_range is not None
            assert q.unit
    assert len({q.id for q, _ in results}) == len(results)
    print(f"self-check PASS: {len(results)}/16 questions generated and verified")


def main() -> None:
    parser = argparse.ArgumentParser(description="GATE XL question generator")
    parser.add_argument("--count", type=int, default=10, help="questions to generate")
    parser.add_argument("--section", default=None, help="restrict to a section code (XL-P..XL-U)")
    parser.add_argument("--topic", default=None, help="restrict to a topic name")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--out", default=None, help="write questions to this JSON file")
    parser.add_argument("--self-check", action="store_true", help="run the verification self-check")
    parser.add_argument("--llm", action="store_true", help="use the LangGraph+Ollama writer agent (requires Ollama running)")
    parser.add_argument("--model", default="qwen2.5:7b", help="Ollama model for --llm")
    args = parser.parse_args()

    if args.self_check:
        self_check()
        return

    memory = AgentMemory()
    if args.llm:
        from gate_gen import agent
        app = agent.build_agent_graph(model=args.model)
        results = agent.generate(
            XL_INSTRUCTIONAL_REGISTRY, app, memory,
            count=args.count, seed=args.seed, model=args.model,
            section=args.section, topic=args.topic,
        )
    else:
        results = generate(
            XL_INSTRUCTIONAL_REGISTRY, build_graph(), memory,
            count=args.count, seed=args.seed, section=args.section, topic=args.topic,
        )

    if not results:
        print("No questions cleared the quality gate (retry budget exhausted). Try a higher --count.")
        sys.exit(1)

    print(f"Generated {len(results)}/{args.count} questions passing the quality gate")
    print(f"Difficulty histogram: {dict(memory.difficulty_histogram)}")
    print("=" * 78)
    for q, metrics in results:
        answer = q.numerical_answer if q.q_type.value == "NAT" else q.correct_keys[0]
        print(f"[{q.id}] {q.section} | {q.topic_path[1]} | {q.q_type.value} {q.marks}m")
        print(f"    difficulty {q.computed_difficulty_score:5.1f} | quality {metrics.final_score:5.2f} | answer {answer}")
        print(f"    {q.question_text}")

    if args.out:
        payload = [
            {
                **q.model_dump(),
                "quality_breakdown": metrics.model_dump(),
                "answer": q.numerical_answer if q.q_type.value == "NAT" else q.correct_keys[0],
            }
            for q, metrics in results
        ]
        Path(args.out).write_text(json.dumps(payload, indent=2))
        print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
