"""Append ?v=<version> to local CSS and JS references in every page.

Run in the Pages workflow just before upload, so a deploy never pairs new HTML
with stylesheets or scripts the browser cached from the previous deploy.
Usage: python3 scripts/stamp_assets.py <version>
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1] / "site"
version = re.sub(r"[^0-9A-Za-z]", "", sys.argv[1] if len(sys.argv) > 1 else "")[:12]
if not version:
    sys.exit("usage: stamp_assets.py <version>")

ref = re.compile(r'((?:href|src)="(?!https?:|//)[^"?#]+\.(?:css|js))(\?v=[0-9A-Za-z]*)?"')
count = 0
for page in ROOT.rglob("*.html"):
    text = page.read_text()
    new, n = ref.subn(lambda m: f'{m.group(1)}?v={version}"', text)
    if n:
        page.write_text(new)
        count += n
print(f"Stamped {count} asset references with v={version}.")
