# /// script
# requires-python = ">=3.12"
# dependencies = ["pillow>=11"]
# ///
"""Extract product/photo assets from the Furniro UI-kit PDF into backend/media/.

Two steps (see docs/DESIGN_SPEC.md §5):

  uv run scripts/extract_design_assets.py extract
      Runs `pdfimages` (poppler-utils) on the PDF, merges soft masks (alpha), removes duplicate
      images, and writes .design-extract/unique/<key>.png plus contact sheets for picking names.

  uv run scripts/extract_design_assets.py build
      Converts every image listed in scripts/design_assets_map.json to WebP
      (max 1600 px long edge, quality 80) at backend/media/<target>.webp.

The map is committed; the PDF and .design-extract/ are not (see .gitignore).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "Furniro_Web_Design_UI_KIT.pdf"
WORK = ROOT / ".design-extract"
UNIQUE = WORK / "unique"
MAP_FILE = ROOT / "scripts" / "design_assets_map.json"
MEDIA = ROOT / "backend" / "media"

MIN_EDGE = 60  # skip icons and tiny UI glyphs
MAX_EDGE = 1600
WEBP_QUALITY = 80
MAX_FILE_BYTES = 400 * 1024


@dataclass
class ListedImage:
    page: int
    num: int
    kind: str  # "image" | "smask" | ...
    width: int
    height: int
    object_id: int


def run(cmd: list[str]) -> str:
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout  # noqa: S603


def list_images(pdf: Path) -> list[ListedImage]:
    rows: list[ListedImage] = []
    for line in run(["pdfimages", "-list", str(pdf)]).splitlines()[2:]:
        cols = line.split()
        rows.append(
            ListedImage(
                page=int(cols[0]),
                num=int(cols[1]),
                kind=cols[2],
                width=int(cols[3]),
                height=int(cols[4]),
                object_id=int(cols[10]),
            )
        )
    return rows


def extract(pdf: Path) -> None:
    if not pdf.exists():
        sys.exit(f"PDF not found: {pdf}")
    if shutil.which("pdfimages") is None:
        sys.exit("pdfimages not found: install poppler-utils")

    listed = list_images(pdf)
    by_num = {row.num: row for row in listed}
    print(f"{len(listed)} embedded images listed; extracting (takes ~5 minutes)…")

    if UNIQUE.exists():
        shutil.rmtree(UNIQUE)
    UNIQUE.mkdir(parents=True)

    index: list[dict[str, object]] = []
    seen: dict[str, str] = {}
    with tempfile.TemporaryDirectory(dir=WORK) as tmp:
        run(["pdfimages", "-png", str(pdf), f"{tmp}/img"])
        for row in listed:
            if row.kind != "image" or min(row.width, row.height) < MIN_EDGE:
                continue
            image = Image.open(f"{tmp}/img-{row.num:03d}.png")
            mask_row = by_num.get(row.num + 1)
            if mask_row and mask_row.kind == "smask" and mask_row.object_id == row.object_id:
                mask = Image.open(f"{tmp}/img-{mask_row.num:03d}.png").convert("L")
                image = image.convert("RGB")
                if mask.size != image.size:
                    mask = mask.resize(image.size)
                image.putalpha(mask)
            elif image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGB")

            digest = hashlib.sha256(image.tobytes()).hexdigest()
            key = f"p{row.page}-{row.num}"
            if digest in seen:
                continue
            seen[digest] = key
            image.save(UNIQUE / f"{key}.png")
            index.append(
                {"key": key, "page": row.page, "width": image.width, "height": image.height}
            )

    (WORK / "index.json").write_text(json.dumps(index, indent=2))
    sheets = write_contact_sheets(index)
    print(f"{len(index)} unique images → {UNIQUE.relative_to(ROOT)}")
    print(f"{sheets} contact sheet(s) → {WORK.relative_to(ROOT)}/contact-sheet-*.jpg")


def write_contact_sheets(index: list[dict[str, object]], per_sheet: int = 30) -> int:
    thumb, cols, label_h = 240, 6, 22
    sheets = 0
    for start in range(0, len(index), per_sheet):
        chunk = index[start : start + per_sheet]
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * thumb, rows * (thumb + label_h)), "white")
        draw = ImageDraw.Draw(sheet)
        for i, entry in enumerate(chunk):
            image = Image.open(UNIQUE / f"{entry['key']}.png")
            image.thumbnail((thumb - 8, thumb - 8))
            x, y = (i % cols) * thumb, (i // cols) * (thumb + label_h)
            backdrop = Image.new("RGB", image.size, (230, 230, 230))
            backdrop.paste(image, mask=image.getchannel("A") if image.mode == "RGBA" else None)
            sheet.paste(backdrop, (x + 4, y + 4))
            label = f"{entry['key']} {entry['width']}x{entry['height']}"
            draw.text((x + 4, y + thumb), label, fill="black")
        sheets += 1
        sheet.save(WORK / f"contact-sheet-{sheets}.jpg", quality=80)
    return sheets


def build() -> None:
    mapping: dict[str, str] = json.loads(MAP_FILE.read_text())["assets"]
    missing = [key for key in mapping if not (UNIQUE / f"{key}.png").exists()]
    if missing:
        sys.exit(f"Run `extract` first; missing extracted images: {', '.join(missing)}")

    total = 0
    for key, target in sorted(mapping.items(), key=lambda item: item[1]):
        image = Image.open(UNIQUE / f"{key}.png")
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        out = MEDIA / f"{target}.webp"
        out.parent.mkdir(parents=True, exist_ok=True)
        quality = WEBP_QUALITY
        image.save(out, "WEBP", quality=quality, method=6)
        while out.stat().st_size > MAX_FILE_BYTES and quality > 50:
            quality -= 10
            image.save(out, "WEBP", quality=quality, method=6)
        size = out.stat().st_size
        total += size
        print(f"{target:<40} {image.width:>5}x{image.height:<5} {size / 1024:7.1f} KB  q{quality}")
    print(f"{len(mapping)} assets, {total / 1024 / 1024:.1f} MB total → {MEDIA.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument("command", choices=["extract", "build"])
    parser.add_argument("--pdf", type=Path, default=PDF)
    args = parser.parse_args()
    WORK.mkdir(exist_ok=True)
    if args.command == "extract":
        extract(args.pdf)
    else:
        build()


if __name__ == "__main__":
    main()
