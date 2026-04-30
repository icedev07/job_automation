#!/usr/bin/env python3
"""
Recursively find .docx files under a root directory and convert each to .pdf in the same folder.

Free backends (pick one):
  1) docx2pdf — pip install docx2pdf — uses Microsoft Word on Windows/macOS (best fidelity if Word is installed).
  2) LibreOffice — no Word needed; install LibreOffice and pass --engine=libreoffice (or use --soffice path).

One-shot (from project root):
  py -3.12 scripts/convertDocxToPdf.py "C:\\path\\to\\Resumes_Mohan"
  py -3.12 scripts/convertDocxToPdf.py Resumes_Mohan --subdir-within-days=2

Watch mode (like chatgpt backfill — polls forever):
  py -3.12 scripts/convertDocxToPdf.py --watch
  Env: DOCX_PDF_WATCH_POLL_SECONDS (default 300) — sleep between rounds when idle / after each round.
  Env: DOCX_PDF_WATCH_RUN_ONCE=1 — one round (Mohan + Jiayong default roots) then exit.
  Env: DOCX_PDF_WATCH_ROOTS — optional semicolon-separated paths (default: Resumes_Mohan;Resumes under cwd).
  Env: DOCX_PDF_SUBDIR_WITHIN_DAYS (default 2) — same as --subdir-within-days for watch.

Skips Word lock files (~$*.docx).
By default converts when there is no .pdf, or when the .docx is newer than the existing .pdf (stale PDF).
Use --overwrite to always replace every .pdf next to a .docx.
With --subdir-within-days=N, only immediate child folders of root are scanned when their mtime/ctime is
within the last N days (recursive .docx inside those folders). Older top-level folders are ignored.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

try:
    from dotenv import load_dotenv

    _env = Path(__file__).resolve().parent.parent / ".env"
    if _env.exists():
        load_dotenv(_env)
except ImportError:
    pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent

WATCH_POLL_SECONDS = max(60, int(os.environ.get("DOCX_PDF_WATCH_POLL_SECONDS", "300")))
WATCH_RUN_ONCE = os.environ.get("DOCX_PDF_WATCH_RUN_ONCE", "").strip().lower() in ("1", "true", "yes")
WATCH_SUBDIR_DAYS_DEFAULT = float(os.environ.get("DOCX_PDF_SUBDIR_WITHIN_DAYS", "2"))


def should_convert(docx: Path, pdf: Path, *, overwrite: bool) -> bool:
    """Convert if --overwrite, or no PDF, or DOCX is newer than PDF (file mtime)."""
    if overwrite:
        return True
    if not pdf.is_file():
        return True
    try:
        docx_mtime = docx.stat().st_mtime
        pdf_mtime = pdf.stat().st_mtime
    except OSError:
        return True
    return docx_mtime > pdf_mtime


def dir_is_within_days(d: Path, days: float) -> bool:
    """True if directory's latest of mtime/ctime is within the last `days` days."""
    try:
        st = d.stat()
    except OSError:
        return False
    latest = max(st.st_mtime, st.st_ctime)
    age_sec = time.time() - latest
    return age_sec <= days * 86400.0


def find_docx_files(root: Path, *, subdir_within_days: float | None) -> list[Path]:
    out: list[Path] = []

    def collect_from(base: Path) -> None:
        for p in base.rglob("*.docx"):
            if p.name.startswith("~$"):
                continue
            out.append(p)

    if subdir_within_days is None:
        collect_from(root)
    else:
        for child in sorted(root.iterdir()):
            if not child.is_dir():
                continue
            if dir_is_within_days(child, subdir_within_days):
                collect_from(child)

    return sorted(out)


def convert_with_docx2pdf(docx: Path, convert) -> None:
    convert(str(docx))


def find_soffice() -> str | None:
    env = os.environ.get("LIBREOFFICE_SOFFICE") or os.environ.get("SOFFICE_PATH")
    if env and Path(env).is_file():
        return env
    which = shutil.which("soffice") or shutil.which("soffice.exe")
    if which:
        return which
    candidates = [
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    ]
    for c in candidates:
        if Path(c).is_file():
            return c
    return None


def convert_with_libreoffice(docx: Path, soffice: str) -> None:
    outdir = str(docx.parent.resolve())
    try:
        subprocess.run(
            [
                soffice,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                outdir,
                str(docx.resolve()),
            ],
            check=True,
            timeout=180,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        err = (e.stderr or e.stdout or str(e)).strip()
        if err:
            print(err, file=sys.stderr)
        raise


def resolve_engine(
    engine: str, docx2pdf_convert
) -> tuple[bool, object | None, str | None]:
    """Returns (docx2pdf_ok, convert_fn, soffice_path)."""
    soffice = find_soffice()
    docx2pdf_ok = docx2pdf_convert is not None
    if engine == "docx2pdf" and not docx2pdf_ok:
        raise RuntimeError("docx2pdf not installed. Run: pip install docx2pdf")
    use_lo = engine == "libreoffice" or (engine == "auto" and not docx2pdf_ok)
    if use_lo and not soffice:
        raise RuntimeError(
            "LibreOffice not found. Install LibreOffice or set LIBREOFFICE_SOFFICE to soffice.exe, "
            "or install Word + pip install docx2pdf"
        )
    return docx2pdf_ok, docx2pdf_convert, soffice


def run_one_root(
    root: Path,
    *,
    subdir_within_days: float | None,
    overwrite: bool,
    engine: str,
    soffice_override: str,
    dry_run: bool,
) -> tuple[int, int, int, int]:
    """
    Returns (ok, fail, skipped_existing_pdf, total_docx).
    Exit success if fail == 0.
    """
    if not root.is_dir():
        print(f"Not a directory (skip): {root}", file=sys.stderr)
        return 0, 0, 0, 0

    if subdir_within_days is not None:
        print(
            f"Only scanning immediate subdirs of {root} with mtime/ctime within last {subdir_within_days} day(s).",
            file=sys.stderr,
        )

    files = find_docx_files(root, subdir_within_days=subdir_within_days)
    if not files:
        if subdir_within_days is not None:
            print(f"No .docx under {root} in subfolders newer than {subdir_within_days} day(s).")
        else:
            print(f"No .docx files under {root}")
        return 0, 0, 0, 0

    soffice = soffice_override.strip() or find_soffice()

    if dry_run:
        to_run = [f for f in files if should_convert(f, f.with_suffix(".pdf"), overwrite=overwrite)]
        skipped = len(files) - len(to_run)
        print(f"[dry-run] {root}: would convert {len(to_run)} file(s) ({skipped} skipped, PDF current):")
        for f in to_run:
            print(f"  {f}")
        return 0, 0, skipped, len(files)

    docx2pdf_convert = None
    try:
        from docx2pdf import convert as docx2pdf_convert
    except ImportError:
        docx2pdf_convert = None

    docx2pdf_ok, convert_fn, soffice_resolved = resolve_engine(engine, docx2pdf_convert)
    if soffice_override.strip():
        soffice = soffice_override.strip()
    else:
        soffice = soffice_resolved

    ok = 0
    fail = 0
    skipped = 0
    for docx in files:
        pdf = docx.with_suffix(".pdf")
        if not should_convert(docx, pdf, overwrite=overwrite):
            skipped += 1
            print(f"SKIP {docx} (PDF up to date)")
            continue
        try:
            if engine == "libreoffice":
                convert_with_libreoffice(docx, soffice)
            elif engine == "docx2pdf":
                convert_with_docx2pdf(docx, convert_fn)
            else:
                if docx2pdf_ok and convert_fn is not None:
                    try:
                        convert_with_docx2pdf(docx, convert_fn)
                    except Exception as e:
                        print(f"docx2pdf failed for {docx}: {e}", file=sys.stderr)
                        if soffice:
                            print("  Trying LibreOffice...", file=sys.stderr)
                            convert_with_libreoffice(docx, soffice)
                        else:
                            raise
                else:
                    convert_with_libreoffice(docx, soffice)
            if pdf.is_file():
                print(f"OK  {pdf}")
                ok += 1
            else:
                print(f"?   {docx} (converter finished but PDF not found at {pdf})", file=sys.stderr)
                fail += 1
        except Exception as e:
            print(f"ERR {docx}: {e}", file=sys.stderr)
            fail += 1

    print(f"\nDone [{root}]: {ok} ok, {fail} failed, {skipped} skipped, {len(files)} .docx total")
    return ok, fail, skipped, len(files)


def default_watch_roots() -> list[Path]:
    raw = os.environ.get("DOCX_PDF_WATCH_ROOTS", "").strip()
    if raw:
        parts = [p.strip() for p in raw.replace(",", ";").split(";") if p.strip()]
        return [Path(p).expanduser().resolve() if Path(p).is_absolute() else (PROJECT_ROOT / p).resolve() for p in parts]
    return [
        (PROJECT_ROOT / "Resumes_Mohan").resolve(),
        (PROJECT_ROOT / "Resumes").resolve(),
    ]


def watch_loop(
    *,
    roots: list[Path],
    subdir_within_days: float | None,
    overwrite: bool,
    engine: str,
    soffice: str,
    dry_run: bool,
    poll_seconds: int,
    run_once: bool,
) -> int:
    print(
        f"\nDOCX→PDF watch (poll every {poll_seconds}s, Ctrl+C to stop)\n"
        f"Roots: {[str(r) for r in roots]}\n"
        f"subdir_within_days={subdir_within_days!r}, run_once={run_once}\n",
        file=sys.stderr,
    )
    round_no = 0
    try:
        while True:
            round_no += 1
            print(f"\n--- Round {round_no} ---\n", file=sys.stderr)
            any_fail = 0
            for r in roots:
                _ok, fail, _sk, _tot = run_one_root(
                    r,
                    subdir_within_days=subdir_within_days,
                    overwrite=overwrite,
                    engine=engine,
                    soffice_override=soffice,
                    dry_run=dry_run,
                )
                any_fail += fail
            if run_once:
                return 2 if any_fail else 0
            if dry_run:
                return 0
            print(f"\nNext scan in {poll_seconds}s (Ctrl+C to stop).\n", file=sys.stderr)
            time.sleep(poll_seconds)
    except KeyboardInterrupt:
        print("\nStopping watch.", file=sys.stderr)
        return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Convert .docx to .pdf; optional 24/7 watch for Mohan+Jiayong folders.")
    ap.add_argument(
        "root",
        nargs="?",
        default=None,
        help="Root directory (required unless --watch with default roots)",
    )
    ap.add_argument(
        "--watch",
        action="store_true",
        help="Poll repeatedly: scan default roots (Resumes_Mohan + Resumes) or DOCX_PDF_WATCH_ROOTS.",
    )
    ap.add_argument(
        "--engine",
        choices=("auto", "docx2pdf", "libreoffice"),
        default="auto",
        help="Conversion engine (default: try docx2pdf first, then LibreOffice)",
    )
    ap.add_argument("--soffice", type=str, default="", help="Path to soffice.exe (LibreOffice)")
    ap.add_argument("--dry-run", action="store_true", help="List files only")
    ap.add_argument(
        "--overwrite",
        action="store_true",
        help="Always convert every .docx (replace PDFs). Default: convert when no PDF or DOCX is newer than PDF.",
    )
    ap.add_argument(
        "--subdir-within-days",
        type=float,
        default=None,
        metavar="N",
        help=(
            "Only look inside immediate subfolders of root whose mtime/ctime is within the last N days. "
            "For --watch, defaults to DOCX_PDF_SUBDIR_WITHIN_DAYS (default 2) if omitted."
        ),
    )
    ap.add_argument(
        "--run-once",
        action="store_true",
        help="With --watch: one round (all watch roots) then exit. Or set DOCX_PDF_WATCH_RUN_ONCE=1.",
    )
    args = ap.parse_args()

    sub_days = args.subdir_within_days
    if sub_days is not None and sub_days <= 0:
        print("--subdir-within-days must be positive, or omit it to scan all subfolders.", file=sys.stderr)
        return 1

    run_once_flag = (
        args.run_once
        or WATCH_RUN_ONCE
        or os.environ.get("DOCX_PDF_WATCH_RUN_ONCE", "").strip().lower() in ("1", "true", "yes")
    )
    poll = WATCH_POLL_SECONDS

    if args.watch:
        roots = default_watch_roots()
        effective_sub = sub_days if sub_days is not None else WATCH_SUBDIR_DAYS_DEFAULT
        return watch_loop(
            roots=roots,
            subdir_within_days=effective_sub,
            overwrite=args.overwrite,
            engine=args.engine,
            soffice=args.soffice,
            dry_run=args.dry_run,
            poll_seconds=poll,
            run_once=run_once_flag,
        )

    if not args.root:
        print("Usage: pass a root directory, or use --watch for Mohan+Jiayong polling.", file=sys.stderr)
        return 1

    root = Path(args.root).expanduser().resolve()
    ok, fail, _s, _t = run_one_root(
        root,
        subdir_within_days=sub_days,
        overwrite=args.overwrite,
        engine=args.engine,
        soffice_override=args.soffice,
        dry_run=args.dry_run,
    )
    return 0 if fail == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
