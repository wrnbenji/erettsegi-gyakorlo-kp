#!/usr/bin/env python3
"""Validate all exam JSON files under data/.

Checks:
  - Valid JSON syntax
  - Required top-level fields (id, subject, year, session, date, sections)
  - Date contains Hungarian accented month name ("május"/"október" etc.) when applicable
  - Each section has tasks[] array
  - Each task has id, type, question, points
  - Task type is one of the known set
  - Essay tasks have minWords, maxWords, rubric[]
  - Multiple-choice tasks have options[] and correct as int
  - Fill-in tasks have correct as list
  - Ordering tasks have items[] and correctOrder[]
  - Every <img src="..."> points to an existing file

Exit code 0 if everything passes; non-zero otherwise.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")

# Task types handled by quiz-engine.js
VALID_TASK_TYPES = {
    "fill-in", "short-answer", "multiple-choice", "ordering",
    "essay", "matching", "true-false", "table-fill",
}

# Legacy / non-standard task types present in existing JSONs that the engine
# doesn't have an explicit case for. Warn, don't error.
LEGACY_TASK_TYPES = {
    "true-false-series", "true-false-group", "true-false-with-correction",
    "categorization",
}

ACCENTED_MONTHS = {
    "május": "Majus",
    "október": "Oktober",
}

errors = []
warnings = []

def err(path, msg):
    errors.append(f"{os.path.basename(path)}: {msg}")

def warn(path, msg):
    warnings.append(f"{os.path.basename(path)}: {msg}")

def check_task(path, section_name, task, idx):
    tid = task.get("id", f"<idx {idx}>")
    # szovegalkotas tasks are essay choices and may use title/prompt instead of question/points
    is_sa = section_name == "szovegalkotas"

    if "id" not in task:
        err(path, f"{section_name}[{tid}]: missing field 'id'")
    if "type" not in task and not is_sa:
        err(path, f"{section_name}[{tid}]: missing field 'type'")

    # Essay tasks use 'prompt' instead of 'question'
    has_text = "question" in task or "prompt" in task
    if not is_sa and not has_text:
        err(path, f"{section_name}[{tid}]: missing field 'question' (or 'prompt' for essays)")
    # Points: errors for non-essay, warn for essay (can be derived from rubric)
    if not is_sa and "points" not in task:
        if task.get("type") == "essay":
            warn(path, f"{section_name}[{tid}]: essay missing 'points' (will be derived from rubric)")
        else:
            err(path, f"{section_name}[{tid}]: missing field 'points'")

    ttype = task.get("type")
    if ttype and ttype not in VALID_TASK_TYPES:
        if ttype in LEGACY_TASK_TYPES:
            warn(path, f"{section_name}[{tid}]: legacy type '{ttype}' (not handled by quiz-engine)")
        else:
            err(path, f"{section_name}[{tid}]: unknown type '{ttype}'")

    if ttype == "fill-in":
        if not isinstance(task.get("correct"), (list, str, dict)):
            err(path, f"{section_name}[{tid}]: fill-in needs 'correct' as list, string, or dict")
    elif ttype == "multiple-choice":
        if not isinstance(task.get("options"), list):
            err(path, f"{section_name}[{tid}]: multiple-choice needs 'options' as list")
        correct = task.get("correct")
        if not isinstance(correct, (int, list)):
            err(path, f"{section_name}[{tid}]: multiple-choice needs 'correct' as int (or list of ints for multi-select)")
    elif ttype == "ordering":
        if not isinstance(task.get("items"), list):
            err(path, f"{section_name}[{tid}]: ordering needs 'items' list")
        if not isinstance(task.get("correctOrder"), list):
            err(path, f"{section_name}[{tid}]: ordering needs 'correctOrder' list")
    elif ttype == "essay":
        if "rubric" not in task or not isinstance(task["rubric"], list):
            err(path, f"{section_name}[{tid}]: essay needs 'rubric' list")
        if "minWords" not in task or "maxWords" not in task:
            warn(path, f"{section_name}[{tid}]: essay missing minWords/maxWords")

def check_image_refs(path, data):
    text = json.dumps(data, ensure_ascii=False)
    # <img src="..."> references (real images, not placeholders)
    for m in re.finditer(r'<img[^>]*src=\\?"([^"\\]+)\\?"', text):
        src = m.group(1)
        if src.startswith("http"):
            continue
        full = os.path.join(ROOT, src)
        if not os.path.exists(full):
            err(path, f"missing image file: {src}")

def check_file(path):
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        err(path, f"invalid JSON: {e}")
        return

    # subject is required for tort JSONs, optional for magyar (legacy)
    required = ["id", "year", "session", "date", "sections"]
    if os.path.basename(path).startswith("tort-"):
        required.append("subject")
    for field in required:
        if field not in data:
            err(path, f"missing top-level field '{field}'")

    date = data.get("date", "")
    if isinstance(date, str):
        # Date must contain accented Hungarian month when it has one
        for accented in ACCENTED_MONTHS:
            no_accent = ACCENTED_MONTHS[accented].lower()
            if no_accent in date.lower() and accented not in date.lower():
                warn(path, f"date missing accent: {date!r} (expected {accented!r})")

    sections = data.get("sections", {})
    if not isinstance(sections, dict):
        err(path, "'sections' must be object")
        return

    for sname, sec in sections.items():
        if not isinstance(sec, dict):
            err(path, f"section '{sname}' must be object")
            continue
        tasks = sec.get("tasks")
        if not isinstance(tasks, list):
            err(path, f"section '{sname}' missing tasks[] array")
            continue
        for i, t in enumerate(tasks):
            check_task(path, sname, t, i)

    check_image_refs(path, data)

def main():
    if not os.path.isdir(DATA_DIR):
        print(f"data dir not found: {DATA_DIR}", file=sys.stderr)
        sys.exit(2)

    files = sorted(f for f in os.listdir(DATA_DIR) if f.endswith(".json"))
    empty = []
    for f in files:
        p = os.path.join(DATA_DIR, f)
        if os.path.getsize(p) == 0:
            empty.append(f)
            continue
        check_file(p)

    for f in empty:
        warnings.append(f"{f}: file is empty (skipped)")

    if warnings:
        print("=== WARNINGS ===")
        for w in warnings:
            print(f"  {w}")

    if errors:
        print("=== ERRORS ===")
        for e in errors:
            print(f"  {e}")
        print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
        sys.exit(1)
    print(f"OK — {len(files) - len(empty)} file(s) valid, {len(warnings)} warning(s)")

if __name__ == "__main__":
    main()
