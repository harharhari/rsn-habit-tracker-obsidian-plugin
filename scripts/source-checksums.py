#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Refresh the explicitly inventoried source snapshot, plus optional new paths."""
import hashlib
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
manifest = root / "SHA256SUMS"
paths = {line.split("  ", 1)[1] for line in manifest.read_text().splitlines() if line.strip()}
paths.update(sys.argv[1:])
lines = []
for name in sorted(paths):
    relative = Path(name)
    if relative.is_absolute() or ".." in relative.parts or name == "SHA256SUMS":
        raise SystemExit(f"Invalid source path: {name}")
    file = root / relative
    if file.is_file():
        lines.append(hashlib.sha256(file.read_bytes()).hexdigest() + "  " + name)
manifest.write_text("\n".join(lines) + "\n")
print(f"Updated {len(lines)} source checksums")
