import re
import sys
import zipfile
from collections import Counter


def _read_xml(z: zipfile.ZipFile, path: str) -> str:
    try:
        return z.read(path).decode("utf-8", errors="ignore")
    except KeyError:
        return ""


def analyze_docx(docx_path: str) -> dict:
    with zipfile.ZipFile(docx_path) as z:
        names = set(z.namelist())
        doc = _read_xml(z, "word/document.xml")
        styles = _read_xml(z, "word/styles.xml")

    placeholders = sorted(set(re.findall(r"\{[^\}]{1,80}\}", doc)))
    paragraph_count = doc.count("<w:p")

    style_pairs = re.findall(
        r'<w:style[^>]*w:styleId="([^"]+)"[\s\S]*?<w:name[^>]*w:val="([^"]+)"',
        styles,
    )
    style_id_to_name = {sid: name for sid, name in style_pairs}

    p_styles = re.findall(r'<w:pStyle[^>]*w:val="([^"]+)"', doc)
    p_style_counts = Counter(p_styles)
    top_paragraph_styles = [
        {"styleId": sid, "count": p_style_counts[sid], "name": style_id_to_name.get(sid, "")}
        for sid in p_style_counts
    ]
    top_paragraph_styles.sort(key=lambda x: (-x["count"], x["styleId"]))

    fonts = re.findall(r'<w:rFonts[^>]*w:ascii="([^"]+)"', doc)
    top_fonts = Counter(fonts).most_common(10)

    return {
        "path": docx_path,
        "parts": {
            "word/document.xml": "word/document.xml" in names,
            "word/styles.xml": "word/styles.xml" in names,
            "word/numbering.xml": "word/numbering.xml" in names,
        },
        "paragraphs": paragraph_count,
        "placeholders": placeholders,
        "topParagraphStyles": top_paragraph_styles[:12],
        "topFonts": top_fonts,
    }


def print_analysis(a: dict) -> None:
    print(f"\n=== {a['path']} ===")
    print(f"paragraphs: {a['paragraphs']}")
    parts = a["parts"]
    print(
        "xml parts:",
        "document" if parts.get("word/document.xml") else "-",
        "styles" if parts.get("word/styles.xml") else "-",
        "numbering" if parts.get("word/numbering.xml") else "-",
    )
    print("placeholders:", a["placeholders"] if a["placeholders"] else ["(none found)"])
    print("top paragraph styles (styleId, count, name):")
    for s in a["topParagraphStyles"]:
        name = f" ({s['name']})" if s["name"] else ""
        print(f"  {s['styleId']} {s['count']}{name}")
    print("top fonts:", a["topFonts"] if a["topFonts"] else [("unknown", 0)])


def main() -> None:
    default_current = r"C:\career-scrum-bot_eu\Resumes\Templates\Jiayong Lin.docx"
    default_other = r"C:\career-scrum-bot_eu\Mohan Sha.docx"
    current_path = sys.argv[1] if len(sys.argv) > 1 else default_current
    other_path = sys.argv[2] if len(sys.argv) > 2 else default_other

    current = analyze_docx(current_path)
    mohan = analyze_docx(other_path)

    print_analysis(current)
    print_analysis(mohan)

    print("\n=== DIFF HIGHLIGHTS ===")
    cur_ph = set(current["placeholders"])
    moh_ph = set(mohan["placeholders"])
    print("placeholder only in current:", sorted(cur_ph - moh_ph)[:80] or ["(none)"])
    print("placeholder only in Mohan:", sorted(moh_ph - cur_ph)[:80] or ["(none)"])
    print("paragraph count delta (mohan - current):", mohan["paragraphs"] - current["paragraphs"])


if __name__ == "__main__":
    main()

