#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
OUTPUT="$ROOT/exports/okepong-codex.zip"

mkdir -p "$ROOT/exports"
rm -f "$OUTPUT"

cd "$ROOT"
ROOT="$ROOT" OUTPUT="$OUTPUT" python3 <<'PY'
import os
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(os.environ["ROOT"])
output = Path(os.environ["OUTPUT"])
sources = [
    "AGENTS.md",
    "CODEX_HANDOFF.md",
    ".env.example",
    ".gitignore",
    "index.html",
    "package.json",
    "pnpm-lock.yaml",
    "tsconfig.json",
    "vite.config.ts",
    "src",
    "public",
    "scripts/export-codex.sh",
]

with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for source in sources:
        path = root / source
        if path.is_dir():
            for file in sorted(path.rglob("*")):
                if file.is_file():
                    archive.write(file, file.relative_to(root))
        elif path.is_file():
            archive.write(path, path.relative_to(root))
PY

printf 'Created %s\n' "$OUTPUT"
