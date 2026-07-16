"""LifeOS ASCEND web search tool (beta stub)."""

from __future__ import annotations

from langchain_core.tools import tool


@tool
def web_search(query: str) -> str:
    """Search the web for information.

    Returns a summary of search results. Useful for current events, study
    resources, health tips, and general knowledge.
    """
    sanitised_query = query.strip()
    if not sanitised_query:
        return "Error: Search query must not be empty."

    # Detect domain-specific hints and tailor the guidance
    query_lower = sanitised_query.lower()

    resource_lines: list[str] = []

    if any(kw in query_lower for kw in ("jee", "neet", "physics", "chemistry", "math", "iit")):
        resource_lines += [
            "  • NCERT Textbooks (ncert.nic.in)",
            "  • HC Verma – Concepts of Physics",
            "  • Previous-year JEE Main & Advanced papers (jeemain.nta.ac.in)",
            "  • Allen / FIITJEE study material",
        ]

    if any(kw in query_lower for kw in ("fitness", "workout", "exercise", "gym", "weight", "diet", "nutrition")):
        resource_lines += [
            "  • ACE / ACSM certified trainer guidelines",
            "  • Examine.com for supplement & nutrition research",
            "  • NSCA Strength & Conditioning resources",
        ]

    if any(kw in query_lower for kw in ("mental health", "stress", "anxiety", "meditation", "mindfulness")):
        resource_lines += [
            "  • WHO mental-health fact sheets (who.int)",
            "  • Headspace / Calm guided meditations",
            "  • NIMHANS helpline (India): 080-46110007",
        ]

    if not resource_lines:
        resource_lines += [
            "  • Google Scholar (scholar.google.com)",
            "  • Wikipedia (en.wikipedia.org)",
            "  • Relevant official / government portals",
        ]

    lines: list[str] = [
        f"Search query: {sanitised_query}",
        "",
        "Note: Web search is currently in beta. Live internet results are not",
        "available in this version. Below are curated authoritative sources for",
        "your query:",
        "",
        "── Recommended Sources ──",
        *resource_lines,
        "",
        "Tip: Copy the query into your browser for real-time results.",
    ]

    return "\n".join(lines)
