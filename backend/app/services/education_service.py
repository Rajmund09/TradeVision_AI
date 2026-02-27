"""
Educational content provider – returns tutorials and explanations.
"""

from typing import Any


def get_tutorial(topic: str) -> str:
    """Retrieve text or HTML for an educational ``topic``.

    In a full application the text might live in the database or be
    generated on the fly; this stub simply returns a placeholder string.
    """
    return f"Tutorial content for '{topic}' is coming soon."
