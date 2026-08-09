"""GATE question-generator package.

Plain-python port of the LangGraph pipeline in docs/gate-question-generator.md,
instantiated for GATE XL (Life Sciences) in gate_gen.xl.
"""

from gate_gen.core import (
    AgentMemory,
    BloomLevel,
    DifficultyEngine,
    DistractorType,
    FormulaEntry,
    Graph,
    ProductionQuestion,
    QualityBreakdown,
    QualityScorer,
    QuestionPattern,
    QuestionProvenance,
    QuestionType,
    SectionMetadata,
    SubjectMetadata,
    VerificationPipeline,
    build_graph,
    generate,
    new_state,
)
from gate_gen.xl import XL_INSTRUCTIONAL_REGISTRY

__all__ = [
    "AgentMemory",
    "BloomLevel",
    "DifficultyEngine",
    "DistractorType",
    "FormulaEntry",
    "Graph",
    "ProductionQuestion",
    "QualityBreakdown",
    "QualityScorer",
    "QuestionPattern",
    "QuestionProvenance",
    "QuestionType",
    "SectionMetadata",
    "SubjectMetadata",
    "VerificationPipeline",
    "XL_INSTRUCTIONAL_REGISTRY",
    "build_graph",
    "generate",
    "new_state",
]
