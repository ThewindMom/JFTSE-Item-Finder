# JFTSE Item Finder Design System

## Product direction

The finder is an Operate-mode comparison utility, not a marketing landing page or a dashboard.
It borrows the live JFTSE site's dark indigo surfaces, cyan signal color, condensed type, and
restrained glow while putting the player's actual task first: narrow the equipment pool, then
compare the best matches.

- Dark utility shell with compact, readable controls.
- Task-first hierarchy: refinement rail, then dominant result canvas.
- Search, level, enchantment, and character are always available.
- Advanced filters and stat ranking use named native disclosures.
- Semantic comparison table on every viewport.
- Authentic JFTSE/Fantasy Tennis artwork only when a reliable mapping exists.
- Honest named fallback tiles when official item art is unavailable.
- No marketing hero, gradient mesh, particles, fabricated logos, or AI-generated production imagery.

## Night Court Equipment Lab

The premium direction is a **Night Court Equipment Lab**: a quiet, cinematic match desk
where players find gear, compare real numbers, and understand acquisition costs before
spending AP or Gold. It evolves the utility rather than replacing it.

- The restrained world-stage establishes Fantasy Tennis immediately, then yields to the task.
- The visible player journey is `Find` → `Compare` → `Acquire`.
- The refinement rail remains compact and secondary to the comparison canvas.
- The semantic table remains the canonical comparison surface on every viewport.
- Authentic item and gacha sprites are the emotional focal points; interface chrome stays calm.
- Cyan means action, focus, or active state. Gold and AP retain explicit written labels.
- Premium quality comes from hierarchy, typography, spacing, texture, and state feedback—not
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

- Desktop: 56px app bar, restrained world-stage, sticky 18–20rem refinement rail, dominant
  comparison canvas, and centered item dossier.
- Mobile: 48px app bar, compact world-stage, results-first source order, complete modal
  refinement drawer, sticky item identity, table-contained horizontal scrolling, and a
  near-full-height item dossier.
- The first desktop viewport must still expose comparison rows; the world-stage is atmosphere,
  not a landing-page detour.

## Design tokens

All component styles use these tokens. One-off colors, spacing, radii, and shadows are prohibited.

```css
:root {
  color-scheme: dark;

  --jf-bg: hsl(231 30% 9%);
  --jf-surface: hsl(248 26% 17%);
  --jf-surface-raised: hsl(231 29% 14%);
  --jf-surface-inset: hsl(0 0% 10%);

  --jf-text: hsl(0 0% 100%);
  --jf-text-secondary: hsl(46 19% 73%);
  --jf-text-muted: hsl(46 19% 78%);

  --jf-accent: hsl(190 87% 44%);
  --jf-accent-heading: hsl(190 87% 49%);
  --jf-accent-strong: hsl(182 81% 56%);
  --jf-accent-soft: hsl(175 25% 63%);

  --jf-border: hsl(175 25% 63% / 28%);
  --jf-border-strong: hsl(190 87% 44%);
  --jf-focus: hsl(182 81% 61%);

  --jf-success: hsl(120 67% 37%);
  --jf-warning: hsl(30 90% 60%);
  --jf-danger: hsl(0 100% 60%);
  --jf-text-on-accent: hsl(231 30% 9%);

  --jf-space-1: 4px;
  --jf-space-2: 8px;
  --jf-space-3: 12px;
  --jf-space-4: 16px;
  --jf-space-5: 20px;
  --jf-space-6: 24px;
  --jf-space-8: 32px;
  --jf-space-10: 40px;
  --jf-space-12: 48px;

  --jf-radius-sm: 4px;
  --jf-radius-md: 8px;
  --jf-radius-lg: 12px;

  --jf-shadow-panel: 0 4px 8px rgb(0 0 0 / 30%);
  --jf-shadow-overlay: 0 18px 44px rgb(0 0 0 / 50%);
  --jf-shadow-glow:
    inset 0 0 1px 1px rgb(0 0 0 / 44%),
    0 0 10px hsl(175 25% 63% / 22%);

  --jf-font-ui: "Barlow Semi Condensed", "Roboto", system-ui, sans-serif;
  --jf-font-display: "Barlow Condensed", "Roboto", system-ui, sans-serif;
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
- Caption: 12px, weight 500, muted beige.
- Table number: data font, 13px, tabular numerals.
- No oversized marketing typography.

## Layout

### Desktop (1200px and wider)

- Content maximum width: 1440px; page padding: 24px; app bar: 56px.
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

- One `<header>` containing text fallback `JFTSE // ITEM FINDER`.
- Include compact links to the JFTSE home page, account registration, and downloads.
- Use an authentic wordmark only when an approved asset exists.

### Panels

- Use labelled semantic regions or fieldsets.
- Surface, border, 8px radius, 16px padding, and panel shadow come from tokens.
- Loading, disabled, and error states must remain visible and named.
- Disabled controls use the real `disabled` attribute or `aria-disabled`.

### Filter panel

Immediate controls:

1. Item name search.
2. Maximum level slider with visible output.
3. Post-enchantment toggle.
4. Character radios.

The `More filters` native disclosure contains:

1. Item type radios.
2. Parts checkbox tree.
3. Availability checkbox tree.
4. Excluded items.

The rail exposes a visible `Reset filters` action and an `Updates instantly` status. Reset clears
persisted filter state and restores the documented defaults. Live updates remain the only apply
model; never add an Apply button that implies stale results.

Every control has a visible label. The slider label reads `Max level requirement: 100`. “Other
items” is disabled and not focusable. Parent checkboxes expose mixed state. Empty exclusions read
`No excluded items`; removal buttons are labelled `Remove {item name} from exclusions`.

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
- Columns: Item, Art, Character, Part, priority statistics, Level, Source.
- Header: 36px desktop and 44px mobile. Rows: 40px desktop and 44px mobile.
- Name minimum width: 180px. Numeric cells are right aligned, monospace, and nowrap.
- Sticky header; sticky name column within the result scroll region.
- Alternating tokenized rows and subtle accent hover/focus.
- Loading uses `aria-busy` plus polite progress text.
- Empty state reads `No items match these filters.`
- Result count is announced politely.
- Loading and error copy appears inline in this panel; never use an alert dialog for network errors.

### Source details

- Action controls are real buttons with `aria-haspopup="dialog"`.
- Details open in a labelled native `<dialog>`, dismiss with Escape or Close, and restore focus.
- Gold, AP, gacha, and Guardian sources always retain text labels.

### Gacha acquisition summaries

The source cell answers the player's decisions in this order:

1. **Which coin?** Authentic extracted coin art, exact coin name, and a textual color/shape label.
2. **Can I buy it?** `Gold`, `AP`, or `Not directly purchasable` is always written out.
3. **What does one pull cost?** Show the unit price beside the denomination.
4. **How likely is this item?** Show the per-pull percentage before expected-value figures.
5. **How much effort should I expect?** Show expected pulls and expected total spend.
6. **What else is in the pool?** Keep complete pool odds in the existing labelled dialog.

The summary uses one compact coin row and one metrics row, not a sentence assembled from
unlabelled numbers. Gold uses a warm semantic chip and AP uses a cool semantic chip, but
both retain explicit text; color is never the only denomination signal. Coin color is also
written (`Burgundy-gold coin`, `Blue cube`, and so on) because the artwork alone is not
accessible evidence. At narrow widths the metrics wrap within the Source cell while the
table remains its own horizontal scroll region.

If a coin has no enabled direct shop source, never infer a price or denomination. Show
`Not directly purchasable` and preserve the nested alternative acquisition path.

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

## Accessibility and motion

- Use `header`, `main`, and `footer` landmarks and one visible `<h1>`.
- Preserve native inputs. Maintain WCAG AA contrast.
- Use native `<details>/<summary>` for progressive disclosure so keyboard and state semantics are free.
- Focus: `outline: 3px solid var(--jf-focus); outline-offset: 2px`.
- Targets: 44x44px mobile and 32x32px desktop.
- Never communicate state by color alone.
- Label the table scroll region `Item comparison results`.
- Use `aria-live="polite"` for loading, errors, and result counts.
- Under `prefers-reduced-motion: reduce`, remove nonessential transitions and transforms.

## Prohibited patterns

- Browser-default fieldsets, serif defaults, native-blue focus, `aliceblue`, raw `blue`, or raw `red`.
- Arbitrary spacing/radii/shadows outside tokens.
- Marketing hero, decorative AI imagery, particles, or gradient mesh.
- Result cards or accordion rows on mobile.
- Page-wide horizontal overflow.
- Drag-only priority controls.
- Unlabelled `X` buttons or href-less action links.
- Coordinate-positioned or keyboard-inaccessible dialogs.
- Opacity-only disabled states.
- Hidden loading, empty, error, or partial-data states.
- Official-looking fallback art.
- Hover-only information or color-only status.
- Visible developer TODO content.
- Continuous decorative animation.

## Accepted debt

- Priority reordering remains pointer-drag based in this increment; the original keyboard parity
  gap is preserved rather than expanded. The rows remain readable and the ranking disclosure is
  keyboard accessible.
- Item data still depends on live JFTSE and GitHub sources. The local Bun preview supplies a
  same-origin shop proxy and a named inline error state, but it does not cache a full offline copy.
