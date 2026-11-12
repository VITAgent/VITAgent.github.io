"""Validate the deployable site, including local links and fragment targets."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parents[1] / "site"

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.refs = set(), []
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for name in ("href", "src"):
            if name in attrs:
                self.refs.append(attrs[name])

pages = {p: Page(p) for p in ROOT.rglob("*.html")}
errors = []
for path, page in pages.items():
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = (ROOT / unquote(url.path).lstrip("/")) if url.path.startswith("/") else (path.parent / unquote(url.path))
        if not url.path:
            target = path
        if target.is_dir():
            target = target / "index.html"
        target = target.resolve()
        if not target.is_relative_to(ROOT.resolve()) or not target.is_file():
            errors.append(f"{path.relative_to(ROOT)}: missing or escaping link {ref}")
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f"{path.relative_to(ROOT)}: missing anchor {ref}")
for path in ROOT.rglob("*"):
    if path.is_symlink():
        errors.append(f"Deployment must not contain symlinks: {path}")
    if path.is_file() and path.suffix.lower() not in {".html", ".css", ".js", ".svg", ".png", ".webp", ".jpg", ".jpeg", ".ico", ".txt", ".woff2"}:
        errors.append(f"Unexpected deployment file: {path}")
if errors:
    sys.exit("\n".join(errors))
print(f"OK: {len(pages)} pages; local links and anchors resolve; deployable files checked.")
