"""LifeOS ASCEND JEE preparation strategy tools."""

from __future__ import annotations

from langchain_core.tools import tool

# ---------------------------------------------------------------------------
# Chapter recommendations keyed by subject
# ---------------------------------------------------------------------------

_CHAPTER_MAP: dict[str, list[str]] = {
    "physics": [
        "Mechanics (Newton's Laws, Work-Energy, Rotational Motion)",
        "Electrodynamics (Coulomb's Law, Circuits, EMI)",
        "Optics (Ray & Wave Optics)",
        "Modern Physics (Photoelectric, Nuclear)",
        "Thermodynamics & Kinetic Theory",
    ],
    "chemistry": [
        "Physical Chemistry (Equilibrium, Thermodynamics, Electrochemistry)",
        "Organic Chemistry (GOC, Named Reactions, Biomolecules)",
        "Inorganic Chemistry (Coordination, p-Block, d-Block)",
        "Mole Concept & Stoichiometry",
        "Chemical Bonding & Molecular Structure",
    ],
    "math": [
        "Calculus (Limits, Derivatives, Integration, Differential Equations)",
        "Coordinate Geometry (Conics, Straight Lines, Circles)",
        "Algebra (Complex Numbers, Matrices, Quadratics, Sequences)",
        "Trigonometry (Identities, Equations, Properties of Triangles)",
        "Vectors & 3-D Geometry",
    ],
}


def _percentile_estimate(avg_accuracy: float, total_solved: int) -> str:
    """Return a rough JEE percentile range string."""
    score = avg_accuracy * 0.6 + min(total_solved / 300, 1.0) * 0.4
    if score >= 0.85:
        return "95-99+"
    if score >= 0.70:
        return "85-95"
    if score >= 0.55:
        return "70-85"
    if score >= 0.40:
        return "50-70"
    return "Below 50"


@tool
def analyze_jee_performance(
    physics_solved: int,
    chemistry_solved: int,
    math_solved: int,
    physics_accuracy: float,
    chemistry_accuracy: float,
    math_accuracy: float,
) -> str:
    """Analyze JEE preparation performance across Physics, Chemistry and Mathematics.

    Returns a structured analysis with weak areas, strong areas, and priority
    recommendations.
    """
    subjects: dict[str, dict[str, float | int]] = {
        "Physics": {
            "solved": physics_solved,
            "accuracy": physics_accuracy,
            "weighted": physics_accuracy * physics_solved,
        },
        "Chemistry": {
            "solved": chemistry_solved,
            "accuracy": chemistry_accuracy,
            "weighted": chemistry_accuracy * chemistry_solved,
        },
        "Mathematics": {
            "solved": math_solved,
            "accuracy": math_accuracy,
            "weighted": math_accuracy * math_solved,
        },
    }

    total_solved = physics_solved + chemistry_solved + math_solved
    avg_accuracy = (
        (physics_accuracy + chemistry_accuracy + math_accuracy) / 3.0
        if total_solved > 0
        else 0.0
    )

    # Rank subjects by weighted score (lowest = weakest)
    ranked = sorted(subjects.items(), key=lambda kv: kv[1]["weighted"])
    weakest_name, weakest_data = ranked[0]
    strongest_name, strongest_data = ranked[-1]

    # Priority ordering
    priority_order = [name for name, _ in ranked]

    percentile = _percentile_estimate(avg_accuracy, total_solved)

    lines: list[str] = [
        "═══ JEE Performance Analysis ═══",
        "",
        f"Total Questions Solved : {total_solved}",
        f"Average Accuracy       : {avg_accuracy:.1%}",
        f"Estimated Percentile   : {percentile}",
        "",
        "── Per-Subject Breakdown ──",
    ]

    for name, data in subjects.items():
        tag = ""
        if name == weakest_name:
            tag = "  ⚠ WEAKEST"
        elif name == strongest_name:
            tag = "  ★ STRONGEST"
        lines.append(
            f"  {name:<12}  Solved: {int(data['solved']):>4}  "
            f"Accuracy: {data['accuracy']:.1%}  "
            f"Weighted: {data['weighted']:.1f}{tag}"
        )

    lines += [
        "",
        "── Weakness Identification ──",
        f"  Primary weak area : {weakest_name} "
        f"(accuracy {weakest_data['accuracy']:.1%}, "
        f"{int(weakest_data['solved'])} solved)",
    ]

    if weakest_data["accuracy"] < 0.4:
        lines.append(
            "  ⚠ Critical: accuracy below 40 %. Fundamentals review needed."
        )
    elif weakest_data["accuracy"] < 0.6:
        lines.append(
            "  ⚡ Moderate gap: targeted practice on high-weightage chapters."
        )
    else:
        lines.append("  ✓ Reasonable accuracy – focus on speed & advanced problems.")

    lines += [
        "",
        "── Priority Ranking ──",
    ]
    for idx, name in enumerate(priority_order, 1):
        lines.append(f"  {idx}. {name}")

    lines += [
        "",
        "── Recommendations ──",
        f"  1. Dedicate 40-50 % of study time to {weakest_name}.",
        f"  2. Maintain {strongest_name} with weekly revision tests.",
        "  3. Attempt a full-length mock test every 7-10 days.",
        "  4. Analyse errors after every practice session.",
    ]

    return "\n".join(lines)


@tool
def create_jee_study_plan(
    weak_subject: str,
    available_hours: float,
    days: int,
    current_accuracy: float,
) -> str:
    """Create a focused JEE study plan for the weak subject.

    Returns a day-by-day plan with time allocation split between theory
    revision (30 %), problem solving (50 %), and mock tests (20 %).
    """
    subject_key = weak_subject.strip().lower()
    if subject_key not in _CHAPTER_MAP:
        normalised = (
            "physics"
            if "phy" in subject_key
            else "chemistry"
            if "chem" in subject_key
            else "math"
            if any(k in subject_key for k in ("math", "maths"))
            else None
        )
        if normalised is None:
            return (
                f"Error: Unrecognised subject '{weak_subject}'. "
                "Use 'physics', 'chemistry', or 'math'."
            )
        subject_key = normalised

    chapters = _CHAPTER_MAP[subject_key]

    theory_hours = round(available_hours * 0.30, 1)
    practice_hours = round(available_hours * 0.50, 1)
    mock_hours = round(available_hours * 0.20, 1)

    # Decide difficulty progression
    if current_accuracy < 0.4:
        difficulty = "Foundation"
        focus_note = "Start with NCERT & basic-level problems."
    elif current_accuracy < 0.65:
        difficulty = "Intermediate"
        focus_note = "Use HC Verma / Cengage-level problems."
    else:
        difficulty = "Advanced"
        focus_note = "Solve previous-year JEE Advanced papers."

    lines: list[str] = [
        f"═══ JEE Study Plan – {weak_subject.title()} ═══",
        "",
        f"Duration        : {days} days",
        f"Daily study time: {available_hours} h",
        f"Current accuracy: {current_accuracy:.0%}",
        f"Difficulty tier  : {difficulty}",
        f"Focus note       : {focus_note}",
        "",
        "── Daily Time Split ──",
        f"  Theory revision : {theory_hours} h (30 %)",
        f"  Problem solving : {practice_hours} h (50 %)",
        f"  Mock / timed    : {mock_hours} h (20 %)",
        "",
        "── Day-by-Day Plan ──",
    ]

    for day in range(1, days + 1):
        chapter = chapters[(day - 1) % len(chapters)]
        is_mock_day = day % 3 == 0  # every 3rd day is a mini-mock day

        lines.append(f"  Day {day:>2}:")
        lines.append(f"    📖 Theory  ({theory_hours} h) – Revise: {chapter}")
        lines.append(
            f"    ✏️  Practice ({practice_hours} h) – "
            f"Solve 15-25 problems on {chapter.split('(')[0].strip()}"
        )

        if is_mock_day:
            lines.append(
                f"    🧪 Mock    ({mock_hours} h) – "
                "Timed mini-test: 30 Qs / 60 min covering recent chapters"
            )
        else:
            lines.append(
                f"    📝 Review  ({mock_hours} h) – "
                "Analyse yesterday's errors & revise formula sheet"
            )

    lines += [
        "",
        "── Key Resources ──",
        f"  • NCERT Textbook ({weak_subject.title()})",
        "  • HC Verma / Cengage subject volume",
        "  • Previous year JEE Main & Advanced papers",
        "  • LifeOS ASCEND progress tracker (log daily scores!)",
    ]

    return "\n".join(lines)
