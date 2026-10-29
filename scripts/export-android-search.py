"""Export Android's read-only Room names table for the web suggestions service.
Usage: python3 scripts/export-android-search.py /path/to/coinzy_final_room.db
"""
import json
import sqlite3
import sys
from pathlib import Path

source = Path(sys.argv[1]).resolve()
output = Path(__file__).resolve().parents[1] / "public/assets/catalogue/android-coin-names.json"
with sqlite3.connect(f"{source.as_uri()}?mode=ro", uri=True) as database:
    names = [row[0] for row in database.execute("SELECT name FROM names ORDER BY id")]
output.write_text(json.dumps(names, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
print(f"Exported {len(names):,} names to {output}")
