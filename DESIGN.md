# JFTSE Item Finder Design System

## Product direction

The finder is an Operate-mode comparison utility, not a marketing landing page or a dashboard.
It presents a bright FantasyLand equipment lab: light court surfaces, cyan signal color, rounded
type, and restrained glow, while putting the player's actual task first: narrow the equipment
pool, then compare the full ranked inventory.

- Light utility shell with compact, readable controls.
- Task-first hierarchy: refinement rail, then dominant result canvas.
- Search, level, enchantment, character, and exclusions are always available.
- Advanced filters and stat ranking use named native disclosures.
- Semantic comparison table on every viewport.
- Authentic JFTSE/Fantasy Tennis artwork only when a reliable mapping exists.
- Honest named fallback tiles when official item art is unavailable.
- No marketing hero, gradient mesh, particles, fabricated logos, or AI-generated production imagery.
- No player-journey stepper and no authenticity badge or cue chrome.

## FantasyLand Equipment Lab

The premium direction is a **FantasyLand Equipment Lab**: a bright match desk where players
find gear, compare real numbers across every eligible candidate, and inspect acquisition
sources before spending AP or Gold. It evolves the utility rather than replacing it.

- The restrained world-stage establishes Fantasy Tennis immediately, then yields to the task.
- The refinement rail remains compact and secondary to the comparison canvas.
- The semantic table remains the canonical comparison surface on every viewport.
- Results keep the complete eligible ranked inventory; ranking never collapses to winner-only
  best or tie subsets.
- Authentic item and gacha sprites are the emotional focal points; interface chrome stays calm.
- Cyan means action, focus, or active state. Gold and AP retain explicit written labels where
  currency appears.
- Premium quality comes from hierarchy, typography, spacing, texture, and state feedback, not
  from continuous effects or decorative feature invention.

### Authentic world visual provenance

The local world-stage image is extracted from the distributed Fantasy Tennis client:

`Res/GuiRes/Main.res :: Main.tex`

The extraction pipeline decodes the first 512×512 DXT5 world frame and emits
`assets/fantasy-tennis-island.webp`. `assets/item-art-map.json` records the exact archive,
entry, dimensions, and output filename under `worldVisual`.

Generated desktop and mobile concept images are **layout inspiration only**. They must never
ship as production imagery, replace item-specific art, imply unsupported map/tracking features,
or override the authentic client sprites and server data.

### Spatial model

- Desktop: 56px app bar, restrained world-stage, sticky 18 to 20rem refinement rail, dominant
  comparison canvas, and wide item dossier.
- Mobile: 48px app bar, compact world-stage, results-first source order, complete modal
  refinement drawer, sticky item identity, table-contained horizontal scrolling, and a
  near-full-height item dossier.
- The first desktop viewport must still expose comparison rows; the world-stage is atmosphere,
  not a landing-page detour.

## Design tokens

All component styles use these tokens. One-off colors, spacing, radii, and shadows are prohibited.

```css
:root {
  color-scheme: light;

  --jf-bg: hsl(194 100% 97%);
  --jf-bg-deep: hsl(191 100% 91%);
  --jf-surface: hsl(48 100% 98%);
  --jf-surface-raised: hsl(191 78% 96%);
  --jf-surface-inset: hsl(195 64% 92%);
  --jf-surface-hover: hsl(187 70% 89%);
  --jf-surface-glass: hsl(48 100% 99% / 94%);

  --jf-text: hsl(194 55% 25%);
  --jf-text-secondary: hsl(193 36% 34%);
  --jf-text-muted: hsl(192 26% 38%);

  --jf-accent: hsl(197 98% 38%);
  --jf-accent-heading: hsl(197 98% 34%);
  --jf-accent-strong: hsl(166 43% 40%);
  --jf-accent-soft: hsl(166 29% 54%);
  --jf-accent-wash: hsl(197 98% 38% / 11%);
  --jf-accent-glow: hsl(197 98% 38% / 16%);
  --jf-world-glow: hsl(190 92% 56% / 24%);
  --jf-court-line: hsl(197 52% 50% / 8%);

  --jf-border: hsl(197 38% 42% / 28%);
  --jf-border-subtle: hsl(197 38% 42% / 16%);
  --jf-border-strong: hsl(197 98% 38%);
  --jf-focus: hsl(197 98% 34%);

  --jf-success: hsl(145 60% 31%);
  --jf-warning: hsl(28 88% 42%);
  --jf-danger: hsl(0 72% 44%);
  --jf-currency-gold: hsl(38 86% 37%);
  --jf-currency-gold-wash: hsl(43 90% 58% / 16%);
  --jf-currency-ap: hsl(278 62% 46%);
  --jf-currency-ap-wash: hsl(278 62% 58% / 14%);
  --jf-source-boss: hsl(14 72% 40%);
  --jf-source-boss-wash: hsl(14 78% 48% / 14%);
  --jf-source-guardian: hsl(166 40% 30%);
  --jf-source-guardian-wash: hsl(166 36% 42% / 14%);
  --jf-text-on-accent: hsl(194 58% 18%);
  --jf-overlay: hsl(194 48% 15% / 64%);

  --jf-space-1: 4px;
  --jf-space-2: 8px;
  --jf-space-3: 12px;
  --jf-space-4: 16px;
  --jf-space-5: 20px;
  --jf-space-6: 24px;
  --jf-space-8: 32px;
  --jf-space-10: 40px;
  --jf-space-12: 48px;

  --jf-shell-max: 1920px;

  --jf-radius-sm: 4px;
  --jf-radius-md: 8px;
  --jf-radius-lg: 12px;
  --jf-radius-xl: 18px;
  --jf-radius-pill: 999px;

  --jf-shadow-panel:
    0 1px 0 hsl(0 0% 100% / 72%) inset,
    0 20px 48px hsl(197 56% 31% / 14%);
  --jf-shadow-overlay: 0 30px 80px hsl(205 50% 10% / 28%);
  --jf-shadow-glow:
    inset 0 0 1px 1px hsl(0 0% 100% / 72%),
    0 0 10px hsl(197 98% 38% / 16%);

  --jf-font-ui: "Nunito Sans", system-ui, sans-serif;
  --jf-font-display: "Fredoka", "Nunito Sans", system-ui, sans-serif;
  --jf-font-data: "IBM Plex Mono", ui-monospace, monospace;

  --jf-type-title: 24px;
  --jf-type-section: 16px;
  --jf-type-body: 14px;
  --jf-type-label: 13px;
  --jf-type-caption: 12px;
  --jf-type-data: 13px;

  --jf-motion-fast: 120ms ease-out;
  --jf-motion-standard: 200ms ease-out;
}
```

## Typography

- Body: UI font, 14px/1.4.
- Page title: display font, 24px, weight 700, uppercase, cyan.
- Panel heading: 16px, weight 600, uppercase, `0.04em` tracking.
- Label: 13px, weight 600.
- Caption: 12px, weight 500, muted secondary text.
- Table number: data font, 13px, tabular numerals.
- No oversized marketing typography.

## Layout

### Desktop (1200px and wider)

- Content maximum width: 1920px; page padding: 24px; app bar: 56px.
- Two-part workspace: `minmax(18rem, 20rem) minmax(0, 1fr)`.
- The refinement rail stacks essential filters and collapsed ranking controls.
- Gap: 20px. Results own the remaining width and always have `min-width: 0`.
- The result header and first comparison rows remain visible in the first viewport at 1440x900.
- Only the labelled table wrapper may scroll horizontally.

### Tablet (880px to 1199px)

- The same two-part workspace holds with a narrower `17rem` refinement rail.
- Advanced filter groups remain collapsed by default.
- Page padding: 16px.

### Mobile (below 880px)

- Single-column flow with page padding 12px and app bar 48px.
- A 44px `Refine results` button controls the complete refinement rail as a modal drawer.
- Inputs and buttons are at least 44px high.
- Results stay a semantic table in a horizontal scroll wrapper.
- The item-name column remains sticky.
- Page-wide horizontal overflow is prohibited.

## Components

### App bar

- One `<header>` containing the JFTSE brand lockup and text title path to the finder.
- Include compact links to the JFTSE home page, account registration, and downloads.
- Use an authentic wordmark only when an approved asset exists.

### Panels

- Use labelled semantic regions or fieldsets.
- Surface, border, radius, padding, and panel shadow come from tokens.
- Loading, disabled, and error states must remain visible and named.
- Disabled controls use the real `disabled` attribute or `aria-disabled`.

### Filter panel

Immediate controls:

1. Item name search.
2. Maximum level slider with visible output.
3. Post-enchantment toggle.
4. Character radios.
5. Excluded items (top-level section, always visible before advanced filters).

The `More filters` native disclosure contains:

1. Item type radios.
2. Parts checkbox tree.
3. Availability checkbox tree.

Exclusions must not live inside the collapsed advanced disclosure. The excluded-items section
stays above `More filters` so restore remains obvious. Each excluded row shows the item name and
a `Restore` button labelled `Restore {item name}` for assistive tech. Empty exclusions read
`No excluded items`. Exclusion IDs persist across reload with the other filter state and rehydrate
before the first results pass.

The rail exposes a visible `Reset filters` action and an `Updates instantly` status. Reset clears
persisted filter state and restores the documented defaults. Live updates remain the only apply
model; never add an Apply button that implies stale results.

Every control has a visible label. The slider label reads `Max level requirement: 100`. The item
mode switch exposes `Equipment` and `Gacha` only. Parent checkboxes expose mixed state.

### Sort priority

- Ranking lives in a separate native disclosure named `Ranking priorities`.
- Its closed summary communicates that movement speed is currently ranked first.
- Rows show rank, drag affordance, and stat label.
- Desktop rows are 32px minimum; mobile rows are 44px minimum.
- Dragging is progressive enhancement. Existing drag/drop behavior is preserved.
- Drop targets use shape/border plus color.

### Results

- Results are the visual anchor: wider, higher contrast, and first in mobile DOM reading order
  after the compact page heading.
- Use `<table>`, `<caption>`, `<thead>`, `<tbody>`, and `<tfoot>` where data permits.
- Caption reads `Matching equipment by slot and selected stat priority`.
- Body rows show the complete eligible inventory for each equipment slot, ordered by the active
  stat priorities. Ranking retains every filtered candidate, including lower ranks and exact ties.
  Never collapse the body to winner-only best items or tie subsets.
- Columns: Item, Art, Character, Part, priority statistics, Level, Source.
- Header: 36px desktop and 44px mobile. Rows: 40px desktop and 44px mobile.
- Name minimum width: 180px. Numeric cells are right aligned, monospace, and nowrap.
- Sticky header; sticky name column within the result scroll region.
- The result scroll region is height-capped so column titles stay pinned while rows scroll.
- Wide tables expose a framed **column pan** control above the grid: a taller mirrored
  horizontal scrollbar. The shell and pan share one surface so dual scrollbars read as one
  comparison tool. The pan is hidden when content fits; first reveal uses a short accent wash
  (disabled under reduced motion). Mobile card layout hides the pan entirely.
- Alternating tokenized rows and subtle accent hover/focus.
- Loading uses `aria-busy` plus polite progress text.
- Empty state reads `No items match these filters.`
- Result count is announced politely.
- Loading and error copy appears inline in this panel; never use an alert dialog for network errors.

#### Single-character footer totals

When exactly one character is represented in the result set, render a `<tfoot>` total row:

- Stat and level totals use the best candidate per equipment slot (`result[0]` after ranking).
- Source / cost totals aggregate acquisition cost for that same best-per-slot set only.
- Body rows still list every eligible ranked candidate above the footer.
- Do not sum cost across the full catalog of lower-ranked alternatives in the footer.

### Source details

- Action controls are real buttons with `aria-haspopup="dialog"`.
- Details open in a labelled native `<dialog>`, dismiss with Escape or Close, and restore focus.
- Generic dialogs and item-details dialogs share one responsive width:
  `width: min(92vw, 1280px)`.
- Gold, AP, gacha, and Guardian sources always retain text labels.

### Gacha acquisition summaries

The source cell identifies every acquisition path without shop economics chrome:

1. **Which gacha?** Coin artwork (when mapped) plus the gacha identity control that opens the
   detailed odds popup.
2. **How can the coin be obtained?** An acquisition channel strip under the name, projected from
   the coin product’s shop and Guardian stage sources (not from a single `priceType` flag alone):
   - **Shop denomination** only when the product is **purchasable** (`enabled` and not
     Shop_Ini3 `Nobuy`): written `Gold` or `AP` pill using `--jf-currency-gold` /
     `--jf-currency-ap`. Currency is never color-only.
   - **Listed but not for sale** (`enabled` + `Nobuy≠0`): written `Not for sale` as a
     **shop-status label** (`.gacha-shop-status--not-for-sale`) — sentence case, muted,
     dashed outline, **not** a currency pill and **not** danger red. Currency chips
     (`Gold` / `AP`) stay reserved for purchasable denominations only. The live shop API
     omits Nobuy; load product indexes from `assets/shop-nobuy-indexes.json` (extracted
     from JFTSE `Shop_Ini3.xml`). Do **not** attach a shop cost or imply Gold/AP can buy
     the coin (Blue Capsule, boss boxes).
   - **Boss stage drops**: one pill per unique map, labelled `Boss · {pretty map}` with a
     trailing `Boss` suffix stripped (for example `Boss · Deva Berg`), using `--jf-source-boss`.
     Sources merge:
     1. `GuardianStages.json` `Rewards` product lists, and
     2. JFTSE `S_Relationships` product→boss placement (`assets/product-stage-drops.json`)
        so coins like Blue Capsule still answer “where do I get this?” when Rewards omit them.
     Multi-stage coins show every unique map chip.
   - **Non-boss Guardian stages**: pill with the pretty map name only (for example `Temple`,
     `Machine City`), using `--jf-source-guardian`.
   - Stage chips open the existing Guardian detail dialog (rewards, boss timer, EXP multiplier).
3. **Is the coin sold right now?**
   - Purchasable → `Gold` / `AP`.
   - Catalog-listed Nobuy → quiet `Not for sale` shop-status (even when stage drops also exist).
   - Disabled catalog **and** no stage path → `Gold · Not available` / `AP · Not available`
     as shop-status (`.gacha-shop-status--not-available`), warning-muted, not a currency fill.
   - Disabled catalog **with** stage paths → stage chips only.
4. **What else is in the pool?** Keep complete pool odds in the existing labelled dialog
   (item, chance, expected pulls).

Pretty map labels split JFTSE CamelCase ids (`MachineCityBoss` → `Machine City Boss`). Boss
status is always written in the label (`Boss · …`), never color-only.

The Gacha mode results table uses the same summary (art, name control, acquisition strip) for
every coin so players can scan shop vs stage origins without opening each popup.

Do not render gacha summary metrics, economics blocks, unit price rows, purchase price chips, or
`Expected spend` copy in the source cell. Do not write coin color labels such as
`Burgundy-gold coin`; accessible coin art names use the gacha name and shape only
(for example `{gacha name} coin artwork`).

### Not currently in the game

Equipment with no enabled shop source, no enabled gacha path, and no Guardian reward is marked
with a written `Not in game` badge next to the item name. The badge uses danger-tinted tokens and
always includes text (never color alone). Turning on `Unavailable items` reveals these rows; the
badge remains so players can tell them apart from live catalog gear.

## Item art policy

The public API has no item-image URL, but the extracted Fantasy Tennis client is authoritative:
`Item_Parts.set` maps every item index to an icon descriptor, `Info_Item_Icon.set` maps
that descriptor to a sprite sheet, and `Res/GuiRes/Item*.res` contains the original pixels.

- Ship the lossless extracted sprite sheets and the generated item-index map.
- Render the exact 100x100 client cell inside a 40x40px result tile.
- Never infer artwork from an item name or fabricate item-specific imagery.
- Never use generated production artwork.
- Unknown or broken mappings use the real item category as a fixed fallback:

```text
HAT
Official art unavailable
```

The fallback is a bordered inset tile with the accessible label
`Official item art unavailable for {item name}`. It must never look like authentic item art.

## First-load lab prep

While equipment data downloads for the first time, the results panel shows a **lab prep**
state — not raw network or XML diagnostics.

- Visual: centered `loading-orb` (accent ring + soft core) plus a determinate progress bar.
- Copy: short phase titles such as “Opening the equipment lab…” / “Checking the live shop…”;
  detail lines describe player-facing work, never filenames, paths, or `.xml` names.
- Motion: ring spin (`900ms` linear) and core pulse (`1400ms` ease-in-out) use only
  `transform` and `opacity`. Under `prefers-reduced-motion: reduce`, both stop; the static
  orb and progress bar remain as the loading cue.
- Errors stay human: “Could not load equipment data” with a connection/reload hint — no
  technical URLs in the label.

## Accessibility and motion

- Use `header`, `main`, and `footer` landmarks and one visible `<h1>`.
- Preserve native inputs. Maintain WCAG AA contrast.
- Use native `<details>/<summary>` for progressive disclosure so keyboard and state semantics are free.
- Focus: visible focus ring using the accent glow token with clear offset.
- Targets: 44x44px mobile and 32x32px desktop.
- Never communicate state by color alone.
- Label the table scroll region `Item comparison results`.
- Use `aria-live="polite"` for loading, errors, and result counts.
- Under `prefers-reduced-motion: reduce`, remove nonessential transitions and transforms;
  the first-load orb becomes a static mark rather than a spinning indicator.

## Prohibited patterns

- Browser-default fieldsets, serif defaults, native-blue focus, `aliceblue`, raw `blue`, or raw `red`.
- Arbitrary spacing/radii/shadows outside tokens.
- Marketing hero, decorative AI imagery, particles, or gradient mesh.
- Player-journey steppers or authenticity cue badges.
- Result cards or accordion rows on mobile.
- Winner-only result bodies that drop lower-ranked eligible items.
- Page-wide horizontal overflow.
- Drag-only priority controls.
- Unlabelled action buttons or href-less action links.
- Coordinate-positioned or keyboard-inaccessible dialogs.
- Divergent widths for generic dialogs vs item-details dialogs.
- Opacity-only disabled states.
- Hidden loading, empty, error, or partial-data states.
- Official-looking fallback art.
- Hover-only information or color-only status.
- Visible developer TODO content.
- Continuous decorative animation.
- Gacha source-cell metrics, economics, unit-price rows, or expected-spend chrome.
- Written coin color wording as the accessibility signal for gacha art.
- Omitting the shop Gold/AP denomination when the coin is **purchasable** in the live shop.
- Showing buyable Gold/AP (or a Gold cost total) for Shop_Ini3 `Nobuy` products such as Blue
  Capsule or boss reward boxes.
- Leaving Nobuy coins with only `Not for sale` when a relationship/Rewards stage path exists
  (players must still see where the coin drops).
- Collapsing multi-stage boss/Guardian drops into a single Gold/AP pill with no stage labels.
- Omitting the `Not in game` text when an equipment row has no live acquisition path.

## Accepted debt

- Priority reordering remains pointer-drag based in this increment; the original keyboard parity
  gap is preserved rather than expanded. The rows remain readable and the ranking disclosure is
  keyboard accessible.
- Item data still depends on live JFTSE and GitHub sources. The local Bun preview supplies a
  same-origin shop proxy and a named inline error state, but it does not cache a full offline copy.
- `projectGachaEconomics` may remain as a pure helper for tests or future work, but the live
  source cell must not surface those figures until product explicitly reintroduces them.
