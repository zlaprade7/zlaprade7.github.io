#!/usr/bin/env python3
"""Make the public portfolio demo from the Pi's dashboard.

    python3 tools/publish_demo.py demo-index.html out/demo/index.html

demo-index.html IS the Pi's templates/dashboard.html, and its comments are
build notes written for the Pi, which sits behind a login. They do not belong
in the View Source of a public page, so the published copy has every comment
removed -- HTML, CSS and JS -- and nothing else changed apart from FIXUPS
below. The demo data in the file is synthetic already; this only takes away
the notes around it.

The JS pass is a real scanner, not a regex: a `//` inside "https://" or inside a
regex literal is not a comment, a template literal can hold `${ code }` that has
its own strings and comments, and deleting a block comment that spans lines must
leave a newline behind or automatic semicolon insertion changes the program.

Check the result by rendering both files, not by reading this one.
"""
import re
import sys

REGEX_AFTER = set("(,=:[!&|?{};+-*%<>~^")
REGEX_WORDS = {"return", "typeof", "case", "do", "else", "in", "of", "new",
               "delete", "void", "throw", "yield", "await", "instanceof"}


def strip_js(src):
    out, i = _code(src, 0, False)
    return out


def _code(src, i, in_template_expr):
    """Scan JS from i. If in_template_expr, stop at the `}` closing a ${...}."""
    out = []
    n = len(src)
    prev = ""        # last significant character emitted
    word = ""        # last identifier emitted, for `return /re/`
    depth = 0        # braces opened inside a ${ } expression
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""

        if in_template_expr:
            if c == "{":
                depth += 1
            elif c == "}":
                if depth == 0:
                    return "".join(out), i      # caller emits the brace
                depth -= 1

        # comments
        if c == "/" and nxt == "/":
            j = src.find("\n", i)
            i = n if j < 0 else j               # keep the newline itself
            continue
        if c == "/" and nxt == "*":
            j = src.find("*/", i + 2)
            if j < 0:
                raise ValueError(f"unterminated block comment at {i}")
            out.append("\n" if "\n" in src[i:j] else " ")
            i = j + 2
            continue

        # strings
        if c in "\"'":
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == "\\":
                    j += 1
                elif src[j] == "\n":
                    raise ValueError(f"newline in string at {i}")
                j += 1
            out.append(src[i:j + 1])
            i = j + 1
            prev, word = "a", ""
            continue

        # template literals, with ${ } holding real code
        if c == "`":
            out.append("`")
            j = i + 1
            while j < n:
                ch = src[j]
                if ch == "\\":
                    out.append(src[j:j + 2]); j += 2; continue
                if ch == "`":
                    out.append("`"); j += 1; break
                if ch == "$" and j + 1 < n and src[j + 1] == "{":
                    out.append("${")
                    inner, j = _code(src, j + 2, True)
                    out.append(inner)
                    out.append("}")
                    j += 1
                    continue
                out.append(ch); j += 1
            else:
                raise ValueError(f"unterminated template at {i}")
            i = j
            prev, word = "a", ""
            continue

        # regex literals
        if c == "/" and (prev == "" or prev in REGEX_AFTER or word in REGEX_WORDS):
            j = i + 1
            in_class = False
            while j < n:
                ch = src[j]
                if ch == "\\":
                    j += 2; continue
                if ch == "\n":
                    raise ValueError(f"newline in regex at {i}")
                if ch == "[":
                    in_class = True
                elif ch == "]":
                    in_class = False
                elif ch == "/" and not in_class:
                    break
                j += 1
            j += 1
            while j < n and (src[j].isalnum() or src[j] in "_$"):
                j += 1                           # flags
            out.append(src[i:j])
            i = j
            prev, word = "a", ""
            continue

        # identifiers and numbers
        if c.isalnum() or c in "_$":
            j = i
            while j < n and (src[j].isalnum() or src[j] in "_$."):
                j += 1
            tok = src[i:j]
            out.append(tok)
            i = j
            prev = "a"
            word = tok.rsplit(".", 1)[-1]
            continue

        out.append(c)
        if not c.isspace():
            prev, word = c, ""
        i += 1

    if in_template_expr:
        raise ValueError("unterminated ${ } expression")
    return "".join(out), i


def strip_css(src):
    out, i, n = [], 0, len(src)
    while i < n:
        c = src[i]
        if c in "\"'":
            j = src.index(c, i + 1)
            out.append(src[i:j + 1]); i = j + 1; continue
        if src.startswith("/*", i):
            i = src.index("*/", i + 2) + 2
            out.append(" ")
            continue
        out.append(c); i += 1
    return "".join(out)


def strip_html(doc):
    parts = re.split(r"(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)",
                     doc, flags=re.S | re.I)
    out = []
    for p in parts:
        m = re.match(r"(<(script|style)\b[^>]*>)(.*?)(</\2>)\Z", p, re.S | re.I)
        if m:
            body = strip_js(m.group(3)) if m.group(2).lower() == "script" \
                else strip_css(m.group(3))
            out.append(m.group(1) + body + m.group(4))
        else:
            out.append(re.sub(r"<!--.*?-->", "", p, flags=re.S))
    text = "".join(out)
    return re.sub(r"\n[ \t]*\n(?:[ \t]*\n)+", "\n\n", text)   # tidy blank runs


# Things that only make sense on the Pi. Each is a fixed string so a change in
# the dashboard fails loudly here instead of quietly publishing something.
FIXUPS = [
    # The job watch is private and lives at /jobs on the Pi. On GitHub Pages
    # that is a 404, and the pill and the drawer row both link to it.
    ("</style>", "#jobsBtn,#jobsSec{display:none!important}</style>"),
    # The demo is a page, not an installable app; this 404s on Pages.
    ('<link rel="manifest" href="/manifest.webmanifest">', ""),
    # Root-absolute icons 404 on Pages; the portfolio has its own.
    ('href="/static/moncoeur-180.png"', 'href="../images/icon-180.png"'),
    ('href="/static/moncoeur-512.png"', 'href="../images/icon-512.png"'),
]


def fixup(text):
    for a, b in FIXUPS:
        if a not in text:
            raise SystemExit(f"publish_demo: expected to find {a!r} -- the "
                             "dashboard changed; update FIXUPS before publishing")
        text = text.replace(a, b, 1)
    return text


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src = open(sys.argv[1], encoding="utf-8").read()
    res = fixup(strip_html(src))
    open(sys.argv[2], "w", encoding="utf-8").write(res)
    print(f"{len(src)//1024} KB -> {len(res)//1024} KB")
