"""LifeOS ASCEND fitness planning and analysis tools."""

from __future__ import annotations

from langchain_core.tools import tool

# ---------------------------------------------------------------------------
# Workout templates keyed by goal and experience level
# ---------------------------------------------------------------------------

_WARMUP = "5 min light cardio (jumping jacks / brisk walk) + dynamic stretches"
_COOLDOWN = "5 min static stretching + 2 min deep breathing"

_EXERCISES: dict[str, dict[str, list[str]]] = {
    "weight_loss": {
        "beginner": [
            "Bodyweight squats – 3×12",
            "Push-ups (knee) – 3×10",
            "Jumping jacks – 3×30 s",
            "Plank hold – 3×20 s",
            "Mountain climbers – 3×15",
        ],
        "intermediate": [
            "Goblet squats – 4×12",
            "Push-ups – 4×15",
            "Burpees – 4×10",
            "Plank – 3×45 s",
            "Box jumps – 3×12",
            "Kettlebell swings – 3×15",
        ],
        "advanced": [
            "Barbell back squats – 5×8",
            "Bench press – 4×10",
            "Burpee pull-ups – 4×8",
            "Weighted plank – 3×60 s",
            "Sled push – 4×20 m",
            "Battle ropes – 4×30 s",
        ],
    },
    "muscle_gain": {
        "beginner": [
            "Dumbbell bench press – 3×10",
            "Lat pull-down – 3×10",
            "Dumbbell shoulder press – 3×10",
            "Bodyweight lunges – 3×12 each leg",
            "Bicep curls – 3×12",
        ],
        "intermediate": [
            "Barbell bench press – 4×8",
            "Barbell rows – 4×8",
            "Overhead press – 4×8",
            "Romanian deadlift – 4×10",
            "Weighted pull-ups – 3×8",
            "Cable flyes – 3×12",
        ],
        "advanced": [
            "Bench press – 5×5 (heavy)",
            "Deadlift – 5×5",
            "Weighted pull-ups – 4×6",
            "Barbell OHP – 4×6",
            "Barbell squats – 5×5",
            "Incline dumbbell press – 4×8",
            "Farmer's walks – 3×40 m",
        ],
    },
    "endurance": {
        "beginner": [
            "Brisk walking / light jog – 20 min",
            "Bodyweight circuit (squats, push-ups, lunges) – 2 rounds",
            "Jump rope – 3×1 min",
        ],
        "intermediate": [
            "Running – 30 min steady state",
            "Rowing machine – 15 min intervals",
            "Bodyweight circuit – 3 rounds",
            "Cycling – 20 min moderate",
        ],
        "advanced": [
            "Interval sprints – 8×400 m",
            "Long run – 45-60 min",
            "Swimming – 30 min continuous",
            "Rowing intervals – 20 min",
            "Stairmaster – 20 min HIIT",
        ],
    },
    "general": {
        "beginner": [
            "Bodyweight squats – 3×12",
            "Push-ups (knee) – 3×8",
            "Plank – 3×20 s",
            "Walking lunges – 2×10 each leg",
            "Light jog – 10 min",
        ],
        "intermediate": [
            "Goblet squats – 3×12",
            "Push-ups – 3×15",
            "Dumbbell rows – 3×12",
            "Plank – 3×40 s",
            "Jump rope – 5 min",
            "Cycling – 15 min",
        ],
        "advanced": [
            "Barbell squats – 4×8",
            "Bench press – 4×8",
            "Pull-ups – 4×10",
            "Deadlift – 4×6",
            "Running intervals – 20 min",
            "Core circuit – 3 rounds",
        ],
    },
}

# Day labels used for scheduling
_DAY_LABELS: list[str] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]


def _experience_level(workout_history_count: int) -> str:
    if workout_history_count < 10:
        return "beginner"
    if workout_history_count <= 50:
        return "intermediate"
    return "advanced"


@tool
def create_workout_plan(
    fitness_goal: str,
    available_days: int,
    current_weight: float,
    workout_history_count: int,
) -> str:
    """Create a weekly workout plan based on goals.

    Supported goals: 'weight_loss', 'muscle_gain', 'endurance', 'general'.
    Returns a structured day-by-day plan.
    """
    goal = fitness_goal.strip().lower().replace(" ", "_")
    if goal not in _EXERCISES:
        return (
            f"Error: Unknown fitness goal '{fitness_goal}'. "
            "Choose from: weight_loss, muscle_gain, endurance, general."
        )

    clamped_days = max(1, min(available_days, 7))
    level = _experience_level(workout_history_count)
    exercises = _EXERCISES[goal][level]

    # Intensity note based on weight
    if current_weight > 100:
        intensity_note = (
            "Start with lower impact exercises; prioritise joint-friendly movements."
        )
    elif current_weight < 55:
        intensity_note = (
            "Focus on progressive overload; ensure adequate calorie surplus if gaining."
        )
    else:
        intensity_note = "Standard intensity. Increase load/reps progressively each week."

    lines: list[str] = [
        f"═══ Weekly Workout Plan ═══",
        "",
        f"Goal              : {fitness_goal.replace('_', ' ').title()}",
        f"Experience level   : {level.title()}",
        f"Current weight     : {current_weight} kg",
        f"Training days/week : {clamped_days}",
        f"Intensity note     : {intensity_note}",
        "",
    ]

    rest_interval = max(1, 7 // (clamped_days + 1))  # spread rest days

    training_day = 0
    for day_idx in range(7):
        day_label = _DAY_LABELS[day_idx]

        is_rest = (
            training_day >= clamped_days
            or (day_idx > 0 and day_idx % (rest_interval + 1) == 0 and training_day < clamped_days - 1)
        )

        if is_rest and training_day >= clamped_days:
            lines.append(f"  {day_label}: 🛌 Rest / Active Recovery (light walk, stretching)")
            continue
        if is_rest:
            lines.append(f"  {day_label}: 🛌 Rest / Active Recovery (light walk, stretching)")
            continue

        # Rotate exercises so each day has slight variety
        rotated = exercises[training_day % len(exercises):] + exercises[:training_day % len(exercises)]
        day_exercises = rotated[:min(len(rotated), 4 + (1 if level != "beginner" else 0))]

        lines.append(f"  {day_label}: 💪 Training Day {training_day + 1}")
        lines.append(f"    Warm-up  : {_WARMUP}")
        for ex in day_exercises:
            lines.append(f"    • {ex}")
        lines.append(f"    Cool-down: {_COOLDOWN}")
        lines.append("")

        training_day += 1

    lines += [
        "",
        "── General Tips ──",
        "  • Hydrate: aim for 2.5-3.5 L water/day.",
        "  • Sleep 7-9 hours for optimal recovery.",
        "  • Log workouts in LifeOS ASCEND to track XP gains!",
    ]

    return "\n".join(lines)


@tool
def analyze_fitness_metrics(
    steps: int,
    sleep_hours: float,
    workouts_this_week: int,
    weight: float,
    step_target: int,
    sleep_target: float,
) -> str:
    """Analyze current fitness metrics and provide actionable insights."""
    step_pct = (steps / step_target * 100) if step_target > 0 else 0.0
    sleep_pct = (sleep_hours / sleep_target * 100) if sleep_target > 0 else 0.0

    # Workout frequency score (assume 3-5 is ideal)
    ideal_workouts = 4
    workout_score = min(workouts_this_week / ideal_workouts * 100, 100.0)

    # Identify biggest gap
    metrics = {
        "Steps": step_pct,
        "Sleep": sleep_pct,
        "Workout frequency": workout_score,
    }
    biggest_gap_name = min(metrics, key=metrics.get)  # type: ignore[arg-type]
    biggest_gap_value = metrics[biggest_gap_name]

    # BMI estimate (rough – assumes average height 1.72 m when not provided)
    assumed_height = 1.72
    bmi = weight / (assumed_height ** 2)
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25:
        bmi_category = "Normal"
    elif bmi < 30:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"

    # Build recommendations
    recommendations: list[str] = []

    if step_pct < 80:
        deficit = step_target - steps
        recommendations.append(
            f"🚶 Increase daily steps by ~{deficit:,} to hit your {step_target:,} target. "
            "Try a 15-min post-meal walk."
        )
    if sleep_pct < 90:
        gap = round(sleep_target - sleep_hours, 1)
        recommendations.append(
            f"😴 You're {gap} h short on sleep. Set a bedtime alarm and avoid screens "
            "30 min before bed."
        )
    if workout_score < 75:
        recommendations.append(
            "🏋️ Aim for at least 3-4 workouts this week. Even a 20-min bodyweight "
            "session counts."
        )

    # Ensure at least 3 recommendations
    evergreen = [
        "💧 Drink at least 2.5 L of water today.",
        "🧘 Add 5 minutes of stretching or meditation to your morning routine.",
        "📊 Log your meals to identify nutritional gaps.",
    ]
    while len(recommendations) < 3:
        recommendations.append(evergreen[len(recommendations) % len(evergreen)])

    lines: list[str] = [
        "═══ Fitness Metrics Analysis ═══",
        "",
        f"  Steps          : {steps:>8,} / {step_target:,}  ({step_pct:.0f} %)",
        f"  Sleep          : {sleep_hours:>8.1f} h / {sleep_target:.1f} h  ({sleep_pct:.0f} %)",
        f"  Workouts (week): {workouts_this_week:>8} / {ideal_workouts}        ({workout_score:.0f} %)",
        f"  Weight         : {weight:.1f} kg  (est. BMI {bmi:.1f} – {bmi_category})",
        "",
        f"── Biggest Gap: {biggest_gap_name} ({biggest_gap_value:.0f} %) ──",
        "",
        "── Recommendations ──",
    ]
    for idx, rec in enumerate(recommendations[:3], 1):
        lines.append(f"  {idx}. {rec}")

    return "\n".join(lines)
