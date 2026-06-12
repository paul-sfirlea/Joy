# Diageo Cocktail Collection — Format & Voice

Source: Diageo Cocktail Collection Spring/Summer 18 (a bar sales tool). Two card types — replicate both + our add-ons.

## Card A — STANDARD RECIPE (default)
Field order, exactly:
1. **NAME** — uppercase, large; the brand is often in the name (e.g. "BULLEIT BOURBON OLD FASHIONED").
2. **GLASS** — Highball / Old Fashioned / Martini / Coupe / Wine-Copa / Flute.
3. **GARNISH** — e.g. "Lemon wedge", "3 coffee beans", "Orange slice / Mint sprig".
4. **ICE** — controlled vocabulary: **Cubed / Crushed / Straight up** (= no ice, served up).
5. **INGREDIENTS** — one line per ingredient: `<measure>ml <ingredient>`. Metric `ml`. **Hero brand on the first line.** Non-liquids counted ("2 dashes Angostura", "6-8 Mint leaves"). Lengthener as its own line: "Top with Soda/Tonic".
6. **METHOD** — short imperative steps: "Add all ingredients to a … glass full with ice" → "Stir/Shake to mix" → "Double strain into a …" → almost always closes with **"Garnish and serve"**.
7. **UK UNITS** — small number (e.g. "1.9 UK UNITS"). Optional.
8. Category strap + **"STANDARD RECIPE"** badge.

## Card B — SERVE PRIORITIES (brand pages) = Card A +
9. **MENU DESCRIPTION** — 1-3 sentences of menu copy (see voice). **The only place with marketing copy.**
10. **Season tag** — (ALL SEASONS) / (SPRING/SUMMER) / (SUMMER) / (AUTUMN/WINTER).

## OUR add-ons (not in Diageo — added value)
- **flavour_tag** (2-3 words: Refreshing · Smoky · Complex…) · **batch** (×N + dilution note) · **cost / pour cost %** (from Excel) · **name + concept + story**.

## The MENU-DESCRIPTION voice (to encode)
- **13-45 words**, 1-2 sentences, **in the user's language**.
- Lead with either (a) a **flavour cascade** ("a perfect blend of subtle juniper and botanical flavours…") or (b) an **origin/heritage** hook ("Created by bartender Dick Bradsell in 1984…").
- **Always name the hero brand.**
- Sensory adjective set: *subtle, smooth, zesty, crisp, fresh, invigorating, balanced, bitter, sweet, sharp*.
- Close on a flourish. No price / calories / ABV in the copy.

### Verbatim examples (reference tone)
- **G&T (Gordon's):** "One of the world's most famous mixes, a perfect blend of subtle juniper and botanical flavours of Gordon's London Dry Gin with the slightly bitter tonic."
- **Tom Collins:** "Gin botanicals, citrus fruit sweetness and a touch of sourness, bubbled up with soda water – the Tom Collins is one of the simplest long drinks, such a classic that it's had a glass named after it."
- **Bramble:** "Created by bartender Dick Bradsell in 1984 at Fred's Club in Soho, London, this cocktail with the unusual addition of blackberry has become a modern classic."

## Brand → epicure primitive map (for find_pairings)
Tanqueray / Gordon's / Jinzu → `gin` · Ketel One / Cîroc / Smirnoff → `vodka` · Captain Morgan / Zacapa → `rum` · Don Julio → `tequila` · Casamigos Mezcal → `mezcal` · Bulleit → `bourbon`/`whiskey` · Johnnie Walker / Bell's / Singleton / Talisker / Lagavulin / Oban → `whiskey`/`scotch` · Baileys → `cream liqueur` · Pimm's → `bitter`. Non-Diageo: Campari/Aperol → `bitter orange` · St-Germain → `elderflower` · Cointreau/triple sec → `orange liqueur`.
