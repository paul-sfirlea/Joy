# Costing & Profitability — Reference

Sources: Morgenthaler, The Double Strainer, BackBar, Sculpture Hospitality, BinWise, Provi; country data WHO GISAH / Eurostat.

## Formulas (universal, exact)
- `cost/unit = container_cost ÷ container_size` (cost/ml or cost/g; or container_cost if "each").
- `line_cost = cost/unit × qty_used` (after unit conversion).
- `recipe_cost = Σ line_costs + buffer`.
- `pour cost % = (recipe_cost ÷ selling_price) × 100` (price ex-VAT).
- `GP % = 100 − pour cost %`.
- `suggested_price = recipe_cost ÷ (target_pour_cost% ÷ 100)`.
- `cash GP = price − recipe_cost`.

## Targets & buffer
- **Cocktail target pour cost: 18-24%** (default **20-22%**). High-end 15-18%; volume 25-30%; signature loss-leader 30-35%.
- **"spillage/waste" buffer 10%** default — defensible if garnish & homemades are separate lines (which we do). Adjustable 15-20%. Label what it covers (spillage/over-pour/breakage), NOT prep.
- **Ice** isn't itemised per drink (folds into the target). **Dilution** is a recipe/batch matter, not a cost.
- **Garnish & homemades** = explicit lines. Homemade: cost = batch_cost ÷ **real yield**.

## Unit conversions
1 cl = 10 ml · 1 oz = 29.5735 ml · 1 barspoon/spoon ≈ 5 ml · 1 dash ≈ 0.9 ml · "each/leaf" → cost = (qty ÷ container_size) × container_cost.

## Excel layout (full workbook)
**"Ingredient Library" tab** (reused across recipes): Ingredient · Container size · Unit · Container cost (editable; estimates flagged) · Cost/unit (=cost/size) · Source/note · Estimated?
**Per-recipe tab**: Ingredient · Qty · Unit · Cost/unit · **Line cost** · % of cost · **Override** column (takes precedence). Summary block: subtotal · buffer % (10) · **total cost** · target pour cost % (21) · **suggested price** · rounded price (input) · **actual pour cost %** (recalc) · **cash GP** · GP %.
**"Menu Summary" tab**: per recipe (cost, price, pour cost %, cash GP, GP%) + menu-engineering (Stars/Plowhorses/Puzzles/Dogs — by **cash GP**, not %).

**Design rules:** derived cells = **live formulas**, overridable (or an override column). Estimates = distinct style (italic + light fill) + note "Estimated — verify against invoice". Currency in headers. Costs = wholesale, ex-VAT.

## Pricing logic
- `price = cost ÷ target%` (≈ 4-5× markup). Round **up** (0.25/0.50 or charm 11→12), never down. Show raw + rounded + actual pour cost %.
- **Menu engineering**: optimise **cash GP/drink**, not pour cost %.

## Country prices — HONEST
- **Reliable**: the formulas; relative price level & taxes per country (WHO GISAH, Eurostat) → country multiplier; live FX.
- **NOT reliable programmatically**: the exact price of a specific bottle in a country today; the **wholesale** price (private).
- **UX**: pre-fill an estimate = category baseline × country multiplier × FX → **flag it** → **every cell editable** → user's invoice = truth. State that these are estimates with a wide error band.

Sources: jeffreymorgenthaler.com/how-to-price-a-cocktail-menu · thedoublestrainer.com · getbackbar.com/how-to-calculate-pour-cost · sculpturehospitality.com · who.int (GISAH) · eurostat.
