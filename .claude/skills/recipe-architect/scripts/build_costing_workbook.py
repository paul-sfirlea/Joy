#!/usr/bin/env python3
"""
build_costing_workbook.py

Turn a recipe BUNDLE (JSON) into an editable cocktail/food costing workbook (.xlsx).

DESIGN PHILOSOPHY (redesign):
  * SINGLE SOURCE OF TRUTH. The first sheet, "Ingredient Library", lists every
    UNIQUE ingredient across all recipes (homemades included, priced per ml of
    batch). It holds the ONLY editable cost input: the container cost. Every
    recipe sheet PULLS its cost/unit FROM the Library via direct cell-reference
    formulas (e.g. ='Ingredient Library'!$E$7). Editing one Library cost
    cascades to every recipe sheet AND the Menu Summary automatically.
  * NO "###". Amount columns are widened (>=15) and use a thousands-separated
    number format so even very large numbers never collapse to "###".
  * NO CURRENCY SYMBOL IN CELLS. Amounts are plain numeric ("#,##0.00"). A single
    clearly-labelled "Currency:" input cell carries the unit, echoed on the
    Menu Summary. Percentages use "0.0%".
  * PROFESSIONAL DESIGN. Title + subtitle per sheet, dark header band with white
    bold text, thin borders, banded rows, an accent-highlighted summary block,
    estimated cells flagged (italic + light-yellow + comment), frozen headers.

Sheets produced:
  1. "Ingredient Library"  - Currency input + one deduped row per ingredient.
  2. one sheet per recipe   - line costing (Library-linked) + pricing summary.
  3. "Menu Summary"         - one row per recipe, pulled live from recipe sheets.

Usage:
    python3 build_costing_workbook.py --input <bundle.json> --out <workbook.xlsx>

Dependencies: openpyxl  (pip3 install --quiet openpyxl)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Any, Dict, List, Optional, Tuple

try:
    from openpyxl import Workbook
    from openpyxl.comments import Comment
    from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
    from openpyxl.utils import get_column_letter
    from openpyxl.worksheet.datavalidation import DataValidation
except ImportError:  # pragma: no cover - exercised only when openpyxl is missing
    sys.stderr.write(
        "openpyxl is required. Install it with:\n"
        "    pip3 install --quiet openpyxl\n"
    )
    raise


# ---------------------------------------------------------------------------
# Unit handling
# ---------------------------------------------------------------------------
# Volume units expressed in millilitres.
ML_PER_UNIT: Dict[str, float] = {
    "ml": 1.0,
    "cl": 10.0,
    "oz": 29.5735,
    "dash": 0.9,
    "barspoon": 5.0,
    "spoon": 5.0,
}
# Mass units expressed in grams.
G_PER_UNIT: Dict[str, float] = {
    "g": 1.0,
}
# "Countable" units priced per piece.
COUNT_UNITS = {"each", "leaf"}

VALID_RECIPE_UNITS = set(ML_PER_UNIT) | set(G_PER_UNIT) | COUNT_UNITS
VALID_CONTAINER_UNITS = {"ml", "g", "each"}


def conversion_factor(qty_unit: str, container_unit: str) -> float:
    """
    Return the multiplier that converts a quantity expressed in ``qty_unit`` into
    the ``container_unit`` in which the ingredient is purchased/priced.

    cost_per_unit in the library is expressed as (container_cost / container_size),
    i.e. cost per ONE container_unit (per ml, per g, or per each). So:

        line_cost = qty * conversion_factor(qty_unit, container_unit) * cost_per_unit

    Examples:
        50 ml  -> ml   : factor 1     (50 * 1 * cost_per_ml)
        5  cl  -> ml   : factor 10    (5  * 10 * cost_per_ml)
        1  oz  -> ml   : factor 29.5735
        2  dash-> ml   : factor 0.9
        1  each-> each : factor 1
        2  leaf-> each : factor 1     (priced per piece)
    """
    qty_unit = (qty_unit or "").strip().lower()
    container_unit = (container_unit or "").strip().lower()

    # Countable goods: qty is already a count of pieces; price is per piece.
    if qty_unit in COUNT_UNITS or container_unit == "each":
        return 1.0

    if container_unit == "ml":
        if qty_unit in ML_PER_UNIT:
            return ML_PER_UNIT[qty_unit]
        # Fallback: treat unknown volume-ish unit as ml.
        return 1.0

    if container_unit == "g":
        if qty_unit in G_PER_UNIT:
            return G_PER_UNIT[qty_unit]
        # If a volume unit is paired with a gram container, assume 1:1 (ml~=g).
        if qty_unit in ML_PER_UNIT:
            return ML_PER_UNIT[qty_unit]
        return 1.0

    # Unknown container unit: best-effort 1:1.
    return 1.0


# ---------------------------------------------------------------------------
# Palette & styling
# ---------------------------------------------------------------------------
# Cohesive professional palette.
HEADER_HEX = "1F2A33"        # dark slate (header band)
ACCENT_HEX = "C9A35B"        # warm gold (totals / suggested price)
BAND_HEX = "F2F4F6"          # very light grey (banded rows)
ESTIMATED_HEX = "FFF6D6"     # light yellow (estimated cost cells)
INPUT_HEX = "E4EFE2"         # light green (editable inputs)
SUBTLE_TEXT_HEX = "5A6672"   # muted grey text
TITLE_HEX = "1F2A33"

HEADER_FILL = PatternFill("solid", fgColor=HEADER_HEX)
HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
TITLE_FONT = Font(bold=True, size=16, color=TITLE_HEX)
SUBTITLE_FONT = Font(italic=True, size=10, color=SUBTLE_TEXT_HEX)
SECTION_FONT = Font(bold=True, size=12, color=TITLE_HEX)
NOTE_FONT = Font(italic=True, size=9, color=SUBTLE_TEXT_HEX)

ESTIMATED_FILL = PatternFill("solid", fgColor=ESTIMATED_HEX)
INPUT_FILL = PatternFill("solid", fgColor=INPUT_HEX)
ACCENT_FILL = PatternFill("solid", fgColor=ACCENT_HEX)
BAND_FILL = PatternFill("solid", fgColor=BAND_HEX)

ITALIC_FONT = Font(italic=True)
BOLD_FONT = Font(bold=True)
ACCENT_LABEL_FONT = Font(bold=True, size=11, color=TITLE_HEX)
ACCENT_VALUE_FONT = Font(bold=True, size=11, color=TITLE_HEX)

_THIN = Side(style="thin", color="D0D5DA")
BORDER = Border(left=_THIN, right=_THIN, top=_THIN, bottom=_THIN)

CENTER = Alignment(horizontal="center", vertical="center")
LEFT = Alignment(horizontal="left", vertical="center")
RIGHT = Alignment(horizontal="right", vertical="center")
WRAP = Alignment(horizontal="left", vertical="center", wrap_text=True)

# Number formats. CRITICAL: amounts are PLAIN numeric with a thousands separator
# (no currency symbol) so big numbers never render as "###" and no €/symbol leaks.
MONEY_FMT = "#,##0.00"
UNIT_COST_FMT = "#,##0.0000"   # cost-per-unit needs more precision
PCT_FMT = "0.0%"               # value STORED as a fraction (0.21 -> 21.0%)

AUTHOR = "recipe-architect"


def style_header_row(ws, row: int, first_col: int, last_col: int) -> None:
    for col in range(first_col, last_col + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = CENTER
        cell.border = BORDER


def mark_input(cell, comment: Optional[str] = None) -> None:
    """Visually flag a cell as an editable input (light-green fill)."""
    cell.fill = INPUT_FILL
    if comment:
        cell.comment = Comment(comment, AUTHOR)


# ---------------------------------------------------------------------------
# Sheet-name sanitising / uniqueness
# ---------------------------------------------------------------------------
_INVALID_SHEET_CHARS = re.compile(r"[\\/?*\[\]:]")


def quote_sheet(name: str) -> str:
    """
    Wrap a sheet name for use in a cross-sheet formula reference, following
    Excel's grammar: the name is single-quoted and any literal apostrophe inside
    it is escaped by DOUBLING it. e.g.  Tommy's Margarita -> 'Tommy''s Margarita'

    Without the doubling, Excel produces a malformed reference ("'Tommy's
    Margarita'!A1") that some readers silently repair and others reject — so we
    always emit the strictly-correct form.
    """
    return "'" + str(name).replace("'", "''") + "'"


def sanitize_sheet_name(name: str, used: set) -> str:
    """Make an Excel-legal (<=31 char), unique sheet name."""
    clean = _INVALID_SHEET_CHARS.sub(" ", str(name or "Recipe")).strip()
    clean = re.sub(r"\s+", " ", clean)
    if not clean:
        clean = "Recipe"
    clean = clean[:31]

    candidate = clean
    i = 2
    while candidate.lower() in used:
        suffix = f" ({i})"
        candidate = clean[: 31 - len(suffix)].rstrip() + suffix
        i += 1
    used.add(candidate.lower())
    return candidate


# ---------------------------------------------------------------------------
# Ingredient de-duplication / library collection
# ---------------------------------------------------------------------------
def norm_key(name: str) -> str:
    return re.sub(r"\s+", " ", str(name or "").strip().lower())


def homemade_key(name: str) -> str:
    """Distinct namespace for homemades so they never collide with a bought item."""
    return "homemade::" + norm_key(name)


def collect_ingredient_library(
    recipes: List[dict],
) -> Tuple[List[dict], Dict[str, int]]:
    """
    Walk every recipe and build a de-duplicated ingredient library that ALSO
    contains homemade/batched components (priced per ml of batch).

    Returns:
        (library_rows, key_to_index)
        library_rows: list of dicts with keys:
            kind ("bought" | "homemade"), name, key,
            container_size, container_unit, container_cost,
            cost_estimated, note, is_garnish
        key_to_index: maps the dedupe key -> position in library_rows (0-based)
    """
    library: List[dict] = []
    index: Dict[str, int] = {}

    # 1) Bought ingredients.
    for recipe in recipes:
        for ing in recipe.get("ingredients", []) or []:
            name = ing.get("name", "")
            key = norm_key(name)
            if not key:
                continue
            if key not in index:
                index[key] = len(library)
                library.append(
                    {
                        "kind": "bought",
                        "name": name,
                        "key": key,
                        "container_size": ing.get("container_size"),
                        "container_unit": (ing.get("container_unit") or "").strip().lower(),
                        "container_cost": ing.get("container_cost"),
                        "cost_estimated": bool(ing.get("cost_estimated", False)),
                        "note": ing.get("note", ""),
                        "is_garnish": bool(ing.get("is_garnish", False)),
                    }
                )
            else:
                # Merge: prefer real (non-blank, non-estimated) data seen later.
                existing = library[index[key]]
                if existing.get("container_cost") in (None, "") and ing.get("container_cost") not in (None, ""):
                    existing["container_cost"] = ing.get("container_cost")
                    existing["container_size"] = ing.get("container_size")
                    existing["container_unit"] = (ing.get("container_unit") or "").strip().lower()
                if existing.get("container_size") in (None, "") and ing.get("container_size") not in (None, ""):
                    existing["container_size"] = ing.get("container_size")
                if not bool(ing.get("cost_estimated", False)):
                    existing["cost_estimated"] = False

    # 2) Homemades (batched). Priced per ml: container_size = batch_yield_ml,
    #    container_cost = batch_cost, container_unit = "ml".
    for recipe in recipes:
        for hm in recipe.get("homemades", []) or []:
            name = hm.get("name", "")
            key = homemade_key(name)
            if not norm_key(name):
                continue
            if key not in index:
                index[key] = len(library)
                library.append(
                    {
                        "kind": "homemade",
                        "name": name,
                        "key": key,
                        "container_size": hm.get("batch_yield_ml"),
                        "container_unit": "ml",
                        "container_cost": hm.get("batch_cost"),
                        "cost_estimated": bool(hm.get("cost_estimated", False)),
                        "note": "Homemade batch — cost per ml = batch cost / batch yield.",
                        "is_garnish": False,
                    }
                )
            else:
                existing = library[index[key]]
                if existing.get("container_cost") in (None, "") and hm.get("batch_cost") not in (None, ""):
                    existing["container_cost"] = hm.get("batch_cost")
                if existing.get("container_size") in (None, "") and hm.get("batch_yield_ml") not in (None, ""):
                    existing["container_size"] = hm.get("batch_yield_ml")

    return library, index


# ---------------------------------------------------------------------------
# Workbook construction
# ---------------------------------------------------------------------------
class WorkbookBuilder:
    # Ingredient Library column layout (1-based).
    LIB_COL = {
        "name": 1,
        "container_size": 2,
        "unit": 3,
        "container_cost": 4,   # EDITABLE input (the only place costs are typed)
        "cost_per_unit": 5,    # =cost/size  (referenced by every recipe sheet)
        "estimated": 6,
        "note": 7,
    }
    LIB_HEADER_ROW = 6         # rows 1-5 host title/currency/notes
    LIB_FIRST_DATA_ROW = 7
    CURRENCY_CELL = "B3"       # the single Currency input cell

    def __init__(self, bundle: dict):
        self.bundle = bundle
        self.meta = bundle.get("meta", {}) or {}
        self.recipes = bundle.get("recipes", []) or []
        self.currency = self.meta.get("currency", "") or ""
        self.wb = Workbook()
        # Remove the default sheet; we add our own in order.
        self.wb.remove(self.wb.active)

        self.lib_sheet_name = "Ingredient Library"
        self.lib_row_for_key: Dict[str, int] = {}
        self.recipe_sheet_meta: List[dict] = []  # for Menu Summary
        self._used_sheet_names: set = set()

    # -- public ----------------------------------------------------------
    def build(self) -> Workbook:
        library, index = collect_ingredient_library(self.recipes)
        self._build_ingredient_library(library)
        for recipe in self.recipes:
            self._build_recipe_sheet(recipe)
        self._build_menu_summary()
        return self.wb

    # -- ingredient library ---------------------------------------------
    def _build_ingredient_library(self, library: List[dict]) -> None:
        ws = self.wb.create_sheet(self.lib_sheet_name)
        self._used_sheet_names.add(self.lib_sheet_name.lower())
        C = self.LIB_COL

        # --- Title + currency input + notes (rows 1-5) ---
        ws.cell(row=1, column=1, value="Ingredient Library").font = TITLE_FONT
        ws.cell(
            row=2, column=1,
            value=self._location_subtitle(
                extra="The ONLY place you type costs. Edit a container cost and "
                      "every recipe + the Menu Summary update automatically."
            ),
        ).font = SUBTITLE_FONT

        # Currency input cell (row 3). Prefilled with meta.currency or left blank.
        cur_label = ws.cell(row=3, column=1, value="Currency:")
        cur_label.font = BOLD_FONT
        cur_label.alignment = RIGHT
        cur_cell = ws.cell(row=3, column=2, value=(self.currency or None))
        cur_cell.alignment = LEFT
        mark_input(
            cur_cell,
            "Type the currency code you work in (e.g. RON, EUR, USD). "
            "All amounts in this workbook are in THIS currency.",
        )
        cur_cell.border = BORDER

        # Currency dropdown — pick the code for this country (NO hard-coded EUR default).
        codes = ["RON", "EUR", "USD", "GBP", "CHF", "PLN", "HUF", "CZK", "BGN",
                 "RSD", "MKD", "ALL", "TRY", "UAH", "MDL", "AED", "SAR", "QAR", "GEL"]
        cur = (self.currency or "").strip()
        if cur and cur.upper() not in [x.upper() for x in codes]:
            codes.insert(0, cur)
        dv = DataValidation(type="list", formula1='"' + ",".join(codes) + '"',
                            allow_blank=True, showDropDown=False)  # False = arrow IS shown
        dv.promptTitle = "Currency"
        dv.prompt = "Pick the currency you work in (or type your own code)."
        ws.add_data_validation(dv)
        dv.add(cur_cell)

        ws.cell(
            row=4, column=1,
            value="All amounts ex-VAT / wholesale, in the currency above.",
        ).font = NOTE_FONT

        # --- Header row (row 6) ---
        header_row = self.LIB_HEADER_ROW
        headers = [
            "Ingredient",
            "Container size",
            "Unit",
            "Container cost",      # EDITABLE
            "Cost per unit",       # formula
            "Estimated?",
            "Note",
        ]
        for i, text in enumerate(headers, start=1):
            ws.cell(row=header_row, column=i, value=text)
        style_header_row(ws, header_row, 1, len(headers))

        data_row = self.LIB_FIRST_DATA_ROW
        for i, item in enumerate(library):
            r = data_row + i
            self.lib_row_for_key[item["key"]] = r
            banded = (i % 2 == 1)

            label = item["name"]
            if item["kind"] == "homemade":
                label = f"{item['name']} (homemade)"
            name_cell = ws.cell(row=r, column=C["name"], value=label)
            name_cell.alignment = LEFT
            if item["kind"] == "homemade" or item.get("is_garnish"):
                name_cell.font = ITALIC_FONT

            ws.cell(row=r, column=C["container_size"], value=item["container_size"]).alignment = RIGHT
            ws.cell(row=r, column=C["unit"], value=item["container_unit"]).alignment = CENTER

            cost_cell = ws.cell(row=r, column=C["container_cost"], value=_num_or_none(item["container_cost"]))
            cost_cell.number_format = MONEY_FMT
            cost_cell.alignment = RIGHT
            mark_input(cost_cell)  # editable input (light green)

            # Cost per unit = container_cost / container_size (live formula).
            size_ref = f"{get_column_letter(C['container_size'])}{r}"
            cost_ref = f"{get_column_letter(C['container_cost'])}{r}"
            cpu = ws.cell(
                row=r,
                column=C["cost_per_unit"],
                value=f"=IF(N({size_ref})=0,0,{cost_ref}/{size_ref})",
            )
            cpu.number_format = UNIT_COST_FMT
            cpu.alignment = RIGHT

            est_cell = ws.cell(
                row=r, column=C["estimated"],
                value="Yes" if item["cost_estimated"] else "No",
            )
            est_cell.alignment = CENTER

            note_cell = ws.cell(row=r, column=C["note"], value=item.get("note") or "")
            note_cell.alignment = WRAP

            # Banded background for the whole row (applied before estimated override).
            if banded:
                for col in range(1, len(headers) + 1):
                    ws.cell(row=r, column=col).fill = BAND_FILL
                cost_cell.fill = INPUT_FILL  # keep the editable cue visible

            # Estimated rows: italic + light-yellow + comment on the cost cell.
            if item["cost_estimated"]:
                for col in range(1, len(headers) + 1):
                    c = ws.cell(row=r, column=col)
                    c.fill = ESTIMATED_FILL
                    if c.font is None or not c.font.italic:
                        c.font = ITALIC_FONT
                cost_cell.fill = ESTIMATED_FILL
                cost_cell.font = ITALIC_FONT
                cost_cell.comment = Comment("Estimated — verify against invoice", AUTHOR)

            for col in range(1, len(headers) + 1):
                ws.cell(row=r, column=col).border = BORDER

        if not library:
            ws.cell(
                row=data_row, column=1, value="(no ingredients found in bundle)"
            ).font = ITALIC_FONT

        self._finish_sheet(
            ws,
            widths={"A": 36, "B": 16, "C": 10, "D": 18, "E": 18, "F": 12, "G": 44},
            freeze=f"A{self.LIB_FIRST_DATA_ROW}",
        )

    @property
    def currency_global_ref(self) -> str:
        """Absolute reference to the single Currency cell, for cross-sheet echo."""
        sheet = quote_sheet(self.lib_sheet_name)
        return f"{sheet}!${self.CURRENCY_CELL[0]}${self.CURRENCY_CELL[1:]}"

    def lib_cpu_ref(self, key: str) -> Optional[str]:
        """Absolute cross-sheet reference to an ingredient's Cost-per-unit cell."""
        lib_row = self.lib_row_for_key.get(key)
        if lib_row is None:
            return None
        col = get_column_letter(self.LIB_COL["cost_per_unit"])
        return f"{quote_sheet(self.lib_sheet_name)}!${col}${lib_row}"

    # -- recipe sheet ----------------------------------------------------
    def _build_recipe_sheet(self, recipe: dict) -> None:
        name = recipe.get("name", "Recipe")
        sheet_name = sanitize_sheet_name(name, self._used_sheet_names)
        ws = self.wb.create_sheet(sheet_name)

        # Title block.
        ws.cell(row=1, column=1, value=name).font = TITLE_FONT
        hero = recipe.get("hero_brand")
        sub_bits = []
        if hero:
            sub_bits.append(f"Hero: {hero}")
        loc = self._location_subtitle()
        if loc:
            sub_bits.append(loc)
        ws.cell(row=2, column=1, value="   |   ".join(sub_bits)).font = SUBTITLE_FONT
        ws.cell(
            row=3, column=1,
            value="Costs pull live from the Ingredient Library — do not type costs here.",
        ).font = NOTE_FONT

        # Column layout for line items.
        # Ingredient | Qty | Unit | Cost/unit (LIBRARY formula) | Line cost | % of cost
        col = {"name": 1, "qty": 2, "unit": 3, "cpu": 4, "line": 5, "pct": 6}
        header_row = 5
        headers = [
            "Ingredient", "Qty", "Unit",
            "Cost / unit", "Line cost", "% of cost",
        ]
        for i, text in enumerate(headers, start=1):
            ws.cell(row=header_row, column=i, value=text)
        style_header_row(ws, header_row, 1, len(headers))

        ingredients = recipe.get("ingredients", []) or []
        homemades = recipe.get("homemades", []) or []

        first_data_row = header_row + 1
        r = first_data_row
        line_cost_refs: List[str] = []

        cpu_L = get_column_letter(col["cpu"])
        qty_L = get_column_letter(col["qty"])
        line_L = get_column_letter(col["line"])

        band_toggle = 0

        def band_row(row_idx: int):
            nonlocal band_toggle
            if band_toggle % 2 == 1:
                for c in range(1, len(headers) + 1):
                    ws.cell(row=row_idx, column=c).fill = BAND_FILL
            band_toggle += 1

        # --- purchased ingredients ---
        for ing in ingredients:
            key = norm_key(ing.get("name", ""))
            qty = ing.get("qty")
            qty_unit = (ing.get("unit") or "").strip().lower()
            container_unit = (ing.get("container_unit") or "").strip().lower()
            factor = conversion_factor(qty_unit, container_unit)
            is_garnish = bool(ing.get("is_garnish", False))

            name_cell = ws.cell(row=r, column=col["name"], value=ing.get("name", ""))
            name_cell.alignment = LEFT
            if is_garnish:
                name_cell.font = ITALIC_FONT

            ws.cell(row=r, column=col["qty"], value=_num_or_none(qty)).alignment = CENTER
            ws.cell(row=r, column=col["unit"], value=qty_unit).alignment = CENTER

            # Cost per unit: DIRECT cross-sheet reference to the Library.
            cpu_ref = self.lib_cpu_ref(key)
            if cpu_ref is not None:
                cpu_cell = ws.cell(row=r, column=col["cpu"], value=f"={cpu_ref}")
            else:
                cpu_cell = ws.cell(row=r, column=col["cpu"], value=0)
            cpu_cell.number_format = UNIT_COST_FMT
            cpu_cell.alignment = RIGHT

            # Line cost = qty * conversion_factor * cost_per_unit (Library-linked).
            factor_lit = _fmt_factor(factor)
            line_cell = ws.cell(
                row=r, column=col["line"],
                value=f"=N({qty_L}{r})*{factor_lit}*{cpu_L}{r}",
            )
            line_cell.number_format = MONEY_FMT
            line_cell.alignment = RIGHT
            line_cost_refs.append(f"{line_L}{r}")

            band_row(r)
            for c in range(1, len(headers) + 1):
                ws.cell(row=r, column=c).border = BORDER
            r += 1

        # --- homemade / batched components (also Library-linked, per ml) ---
        for hm in homemades:
            name_hm = hm.get("name", "")
            key = homemade_key(name_hm)
            qty = hm.get("qty")
            qty_unit = (hm.get("unit") or "ml").strip().lower()
            factor = conversion_factor(qty_unit, "ml")

            name_cell = ws.cell(row=r, column=col["name"], value=f"{name_hm} (homemade)")
            name_cell.alignment = LEFT
            name_cell.font = ITALIC_FONT

            ws.cell(row=r, column=col["qty"], value=_num_or_none(qty)).alignment = CENTER
            ws.cell(row=r, column=col["unit"], value=qty_unit).alignment = CENTER

            cpu_ref = self.lib_cpu_ref(key)
            if cpu_ref is not None:
                cpu_cell = ws.cell(row=r, column=col["cpu"], value=f"={cpu_ref}")
            else:
                cpu_cell = ws.cell(row=r, column=col["cpu"], value=0)
            cpu_cell.number_format = UNIT_COST_FMT
            cpu_cell.alignment = RIGHT
            cpu_cell.comment = Comment(
                "Homemade cost/ml pulls from the Ingredient Library "
                "(batch cost / batch yield).",
                AUTHOR,
            )

            factor_lit = _fmt_factor(factor)
            line_cell = ws.cell(
                row=r, column=col["line"],
                value=f"=N({qty_L}{r})*{factor_lit}*{cpu_L}{r}",
            )
            line_cell.number_format = MONEY_FMT
            line_cell.alignment = RIGHT
            line_cost_refs.append(f"{line_L}{r}")

            band_row(r)
            for c in range(1, len(headers) + 1):
                ws.cell(row=r, column=c).border = BORDER
            r += 1

        last_data_row = r - 1
        if last_data_row < first_data_row:
            ws.cell(
                row=first_data_row, column=col["name"], value="(no ingredients)"
            ).font = ITALIC_FONT
            last_data_row = first_data_row

        sum_range = f"{line_L}{first_data_row}:{line_L}{last_data_row}"

        # ---- Summary / pricing block (all formulas) ----
        gap = last_data_row + 2
        label_col = 1
        value_col = 2

        ws.cell(row=gap, column=label_col, value="COST & PRICING").font = SECTION_FONT

        putter = {"row": gap + 1}

        def put(row_label, formula_or_value, *, fmt=None, input_cell=False,
                comment=None, accent=False, bold=False):
            row = putter["row"]
            lc = ws.cell(row=row, column=label_col, value=row_label)
            lc.alignment = LEFT
            vc = ws.cell(row=row, column=value_col, value=formula_or_value)
            if fmt:
                vc.number_format = fmt
            vc.alignment = RIGHT
            if accent:
                lc.fill = ACCENT_FILL
                vc.fill = ACCENT_FILL
                lc.font = ACCENT_LABEL_FONT
                vc.font = ACCENT_VALUE_FONT
            elif bold:
                lc.font = BOLD_FONT
                vc.font = BOLD_FONT
            if input_cell:
                mark_input(vc, comment)
            elif comment:
                vc.comment = Comment(comment, AUTHOR)
            lc.border = BORDER
            vc.border = BORDER
            ref = f"{get_column_letter(value_col)}{row}"
            putter["row"] += 1
            return ref

        # Subtotal of line costs.
        subtotal_ref = put(
            "Subtotal (ingredient cost)", f"=SUM({sum_range})", fmt=MONEY_FMT
        )

        # Buffer % (input). Stored as a FRACTION so PCT_FMT renders it correctly.
        buffer_pct = _pct_fraction(self.meta.get("hidden_buffer_pct", 0))
        buffer_label = self.meta.get("buffer_label", "buffer") or "buffer"
        buffer_pct_ref = put(
            f"Buffer % ({buffer_label})",
            buffer_pct,
            fmt=PCT_FMT,
            input_cell=True,
            comment=f"Hidden buffer for {buffer_label}. Edit to taste.",
        )
        buffer_amt_ref = put(
            "Buffer amount", f"={subtotal_ref}*{buffer_pct_ref}", fmt=MONEY_FMT
        )

        # TOTAL recipe cost (accent-highlighted).
        total_ref = put(
            "TOTAL recipe cost",
            f"={subtotal_ref}+{buffer_amt_ref}",
            fmt=MONEY_FMT,
            accent=True,
        )

        # Target pour cost % (input, fraction).
        target_pct = _pct_fraction(self.meta.get("target_pour_cost_pct", 0))
        target_ref = put(
            "Target pour cost %",
            target_pct,
            fmt=PCT_FMT,
            input_cell=True,
            comment="Your target cost-of-goods as a % of selling price.",
        )

        # Suggested price = TOTAL / target%  (accent-highlighted).
        suggested_ref = put(
            "Suggested price",
            f"=IF({target_ref}=0,0,{total_ref}/{target_ref})",
            fmt=MONEY_FMT,
            accent=True,
        )

        # Rounded menu price (INPUT, may be blank).
        rounded_ref = put(
            "Rounded menu price",
            None,
            fmt=MONEY_FMT,
            input_cell=True,
            comment="Type the price you will actually charge (leave blank to use "
                    "the suggested price). Drives pour cost %, cash GP and GP %.",
            bold=True,
        )

        # Effective price = rounded if entered, else suggested.
        eff_price = f'IF(N({rounded_ref})=0,{suggested_ref},{rounded_ref})'

        # Actual pour cost % = TOTAL / effective price (fraction for PCT_FMT).
        actual_pct_ref = put(
            "Actual pour cost %",
            f"=IF(({eff_price})=0,0,{total_ref}/({eff_price}))",
            fmt=PCT_FMT,
            bold=True,
        )
        # Cash GP = effective price - TOTAL.
        cash_gp_ref = put(
            "Cash gross profit",
            f"=({eff_price})-{total_ref}",
            fmt=MONEY_FMT,
            bold=True,
        )
        # GP % = 1 - pour cost %.
        gp_pct_ref = put(
            "Gross profit %", f"=1-{actual_pct_ref}", fmt=PCT_FMT, bold=True
        )

        # Fill "% of cost" per line (line / subtotal) as a fraction.
        for ref in line_cost_refs:
            row_idx = int(re.sub(r"[A-Z]", "", ref))
            pc = ws.cell(
                row=row_idx, column=col["pct"],
                value=f"=IF({subtotal_ref}=0,0,{line_L}{row_idx}/{subtotal_ref})",
            )
            pc.number_format = PCT_FMT
            pc.alignment = RIGHT

        # Stash references for the Menu Summary sheet.
        self.recipe_sheet_meta.append(
            {
                "name": name,
                "sheet": sheet_name,
                "total_ref": total_ref,
                "suggested_ref": suggested_ref,
                "rounded_ref": rounded_ref,
                "actual_pct_ref": actual_pct_ref,
                "cash_gp_ref": cash_gp_ref,
                "gp_pct_ref": gp_pct_ref,
            }
        )

        self._finish_sheet(
            ws,
            widths={"A": 36, "B": 17, "C": 10, "D": 18, "E": 18, "F": 15},
            freeze=f"A{first_data_row}",
        )

    # -- menu summary ----------------------------------------------------
    def _build_menu_summary(self) -> None:
        ws = self.wb.create_sheet("Menu Summary")

        ws.cell(row=1, column=1, value="Menu Summary").font = TITLE_FONT
        ws.cell(
            row=2, column=1,
            value=self._location_subtitle(
                extra="All figures pull live from each recipe sheet."
            ),
        ).font = SUBTITLE_FONT

        # Currency echo (read live from the Library's currency cell).
        cur_label = ws.cell(row=3, column=1, value="Currency:")
        cur_label.font = BOLD_FONT
        cur_label.alignment = RIGHT
        cur_echo = ws.cell(row=3, column=2, value=f"={self.currency_global_ref}")
        cur_echo.alignment = LEFT
        cur_echo.comment = Comment(
            "Set in the Ingredient Library. All amounts are in this currency.",
            AUTHOR,
        )
        cur_echo.border = BORDER
        ws.cell(
            row=4, column=1,
            value="All amounts ex-VAT / wholesale, in the currency above.",
        ).font = NOTE_FONT

        header_row = 6
        headers = [
            "Recipe", "Total cost", "Suggested price", "Rounded price",
            "Pour cost %", "Cash GP", "GP %", "Menu class",
        ]
        for i, text in enumerate(headers, start=1):
            ws.cell(row=header_row, column=i, value=text)
        style_header_row(ws, header_row, 1, len(headers))

        r = header_row + 1
        for i, m in enumerate(self.recipe_sheet_meta):
            q = f"{quote_sheet(m['sheet'])}!"
            banded = (i % 2 == 1)

            ws.cell(row=r, column=1, value=m["name"]).alignment = LEFT

            specs = [
                (2, f"={q}{m['total_ref']}", MONEY_FMT),
                (3, f"={q}{m['suggested_ref']}", MONEY_FMT),
                (4, f"={q}{m['rounded_ref']}", MONEY_FMT),
                (5, f"={q}{m['actual_pct_ref']}", PCT_FMT),
                (6, f"={q}{m['cash_gp_ref']}", MONEY_FMT),
                (7, f"={q}{m['gp_pct_ref']}", PCT_FMT),
            ]
            for c, formula, fmt in specs:
                cell = ws.cell(row=r, column=c, value=formula)
                cell.number_format = fmt
                cell.alignment = RIGHT

            cls = ws.cell(row=r, column=8, value="")
            cls.alignment = LEFT
            cls.comment = Comment(
                "Menu engineering class = CASH GROSS PROFIT x POPULARITY. "
                "Add your sales/popularity, then classify: high GP + high "
                "popularity = Star; low GP + high popularity = Plowhorse; "
                "high GP + low popularity = Puzzle; low GP + low popularity = Dog.",
                AUTHOR,
            )

            if banded:
                for c in range(1, len(headers) + 1):
                    ws.cell(row=r, column=c).fill = BAND_FILL
            for c in range(1, len(headers) + 1):
                ws.cell(row=r, column=c).border = BORDER
            r += 1

        if not self.recipe_sheet_meta:
            ws.cell(
                row=header_row + 1, column=1, value="(no recipes in bundle)"
            ).font = ITALIC_FONT

        # Legend / menu-engineering note below the table.
        note_row = r + 1
        ws.cell(
            row=note_row, column=1,
            value="Menu engineering — classify each item by Cash GP (value axis) "
                  "x Popularity (sales axis):",
        ).font = SECTION_FONT
        legend = [
            "Star      = high Cash GP + high popularity  (promote, protect).",
            "Plowhorse = low Cash GP + high popularity   (re-engineer cost or price).",
            "Puzzle    = high Cash GP + low popularity   (reposition / push).",
            "Dog       = low Cash GP + low popularity    (consider cutting).",
        ]
        for j, line in enumerate(legend, start=1):
            ws.cell(row=note_row + j, column=1, value=line).font = NOTE_FONT

        self._finish_sheet(
            ws,
            widths={
                "A": 30, "B": 16, "C": 18, "D": 16,
                "E": 15, "F": 16, "G": 15, "H": 16,
            },
            freeze=f"A{header_row + 1}",
        )

    # -- shared finishing -----------------------------------------------
    def _finish_sheet(self, ws, widths: Dict[str, float], freeze: str) -> None:
        for col_letter, width in widths.items():
            ws.column_dimensions[col_letter].width = width
        ws.freeze_panes = freeze
        ws.sheet_view.showGridLines = False

    def _location_subtitle(self, extra: str = "") -> str:
        loc = self.meta.get("location", "")
        country = self.meta.get("country", "")
        date = self.meta.get("date", "")
        bits = []
        head = " · ".join(b for b in [loc, country] if b)
        if head:
            bits.append(head)
        if date:
            bits.append(f"As of {date}")
        if extra:
            bits.append(extra)
        return "   |   ".join(bits)


# ---------------------------------------------------------------------------
# Small formatting / coercion helpers
# ---------------------------------------------------------------------------
def _num_or_none(value: Any):
    """Coerce to a float for the cell, or None so the cell stays truly blank."""
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return value  # leave non-numeric strings as-is


def _pct_fraction(value: Any) -> float:
    """
    Normalise a percentage input to a FRACTION for Excel's percent format.

    Bundles express percentages as whole numbers (e.g. 21 for 21%). Excel's
    "0.0%" format multiplies the stored value by 100, so we store 0.21.
    Values already <= 1 are assumed to be fractions and passed through.
    """
    try:
        f = float(value)
    except (TypeError, ValueError):
        return 0.0
    if f == 0:
        return 0.0
    return f / 100.0 if f > 1 else f


def _fmt_factor(value: float) -> str:
    """Render a conversion factor compactly for a formula literal."""
    if value == int(value):
        return str(int(value))
    return repr(round(value, 6))


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate_bundle(bundle: dict) -> List[str]:
    """Return a list of human-readable warnings (non-fatal)."""
    warnings: List[str] = []
    if not isinstance(bundle, dict):
        raise ValueError("Bundle root must be a JSON object.")
    if "recipes" not in bundle or not isinstance(bundle["recipes"], list):
        raise ValueError("Bundle must contain a 'recipes' array.")

    for ri, recipe in enumerate(bundle.get("recipes", [])):
        rname = recipe.get("name", f"recipe[{ri}]")
        for ing in recipe.get("ingredients", []) or []:
            u = (ing.get("unit") or "").strip().lower()
            cu = (ing.get("container_unit") or "").strip().lower()
            if u and u not in VALID_RECIPE_UNITS:
                warnings.append(f"{rname}: unknown unit '{u}' on '{ing.get('name')}' (treated as ml).")
            if cu and cu not in VALID_CONTAINER_UNITS:
                warnings.append(
                    f"{rname}: unknown container_unit '{cu}' on '{ing.get('name')}' (best-effort)."
                )
    return warnings


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Build an editable cocktail/food costing workbook from a recipe bundle JSON."
    )
    parser.add_argument("--input", required=True, help="Path to the bundle JSON file.")
    parser.add_argument("--out", required=True, help="Path for the output .xlsx workbook.")
    args = parser.parse_args(argv)

    try:
        with open(args.input, "r", encoding="utf-8") as fh:
            bundle = json.load(fh)
    except FileNotFoundError:
        sys.stderr.write(f"Input file not found: {args.input}\n")
        return 2
    except json.JSONDecodeError as exc:
        sys.stderr.write(f"Invalid JSON in {args.input}: {exc}\n")
        return 2

    try:
        warnings = validate_bundle(bundle)
    except ValueError as exc:
        sys.stderr.write(f"Bundle validation error: {exc}\n")
        return 2

    for w in warnings:
        sys.stderr.write(f"[warning] {w}\n")

    builder = WorkbookBuilder(bundle)
    wb = builder.build()
    try:
        wb.save(args.out)
    except Exception as exc:  # pragma: no cover
        sys.stderr.write(f"Failed to write workbook: {exc}\n")
        return 1

    n_recipes = len(builder.recipe_sheet_meta)
    print(
        f"Wrote {args.out}: "
        f"1 Ingredient Library + {n_recipes} recipe sheet(s) + 1 Menu Summary."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
