# Dark Data Modal UI Pattern

Use this pattern for data-heavy bookmarklets such as crawlers, transaction or order viewers, analytics tools, offer explorers, and management interfaces.

This is a composite pattern. Use only the components the bookmarklet actually needs.

## Design Tokens

A restrained dark palette works well for dense data because semantic colors can remain meaningful without competing with the background.

```css
--bml-bg: #17181a;
--bml-bg-elevated: #1e2023;
--bml-bg-hover: #26292d;
--bml-border: #2d3138;
--bml-border-strong: #3a3f47;
--bml-text: #e6e8eb;
--bml-text-muted: #9ca0a5;
--bml-text-dim: #6b7076;
--bml-accent: #61afef;
--bml-positive: #7ec27a;
--bml-attention: #e5c07b;
--bml-negative: #e06c75;
```

Scope these tokens to the bookmarklet root instead of `:root` so they do not affect the host page.

## Modal Shell

Build the interface as a fixed fullscreen translucent overlay with a centered modal. A useful starting point is:

- `width: 92%`
- `max-width: 960px`
- `max-height: 82vh`
- `border-radius: 8px`
- subtle border
- deep but restrained shadow
- extremely high z-index

Prefer hierarchy through spacing, borders, typography, and small changes in background brightness rather than many unrelated colors.

For a full data tool, a useful hierarchy is:

`Header → Tabs → Progress/Loading → Stats → Filters → Data Table → Footer`

Do not add sections that the tool does not need.

## Underline Tabs

Use underline tabs when the modal contains multiple major modes or datasets.

Inactive tabs should have a transparent background, muted text, and a transparent bottom border. The active tab should use normal text and a 2px accent-colored bottom border.

Tabs represent primary view changes. Do not use this treatment for ordinary dataset filters.

## Progress Banner

For crawlers, paginated API walkers, or long-running operations, place a compact progress region below the tabs and above the data content. Show concrete progress when available, such as pages loaded, records found, or the current phase.

Keep the progress indicator visually secondary to the data. Avoid blocking the entire modal unless the current operation truly prevents interaction.

## Stats Bar

Use a compact stats row for high-value summary counts such as total records, tracked records, records with values, failures, or completed items.

Use an elevated background and subtle divider to separate the summary from filters and table content. Use tabular numerals for counts when practical.

## Outline Filter Chips

Use compact outlined controls for filtering the current dataset.

Inactive chips should use a transparent background, subtle border, and muted text. The active chip can use an accent border with a very subtle tinted background.

Include useful counts when available, for example:

`All (821)` · `With Amount (44)` · `Tracked (87)`

Do not style these like primary navigation tabs; filters and navigation should remain visually distinct.

## Dense Data Table

For large datasets:

- Prefer `table-layout: fixed` and explicit column widths, such as a `<colgroup>`, so long values do not constantly reflow the table.
- Keep the table header sticky while the data region scrolls.
- Left-align descriptive text.
- Right-align monetary and numeric values.
- Center short status, date, or boolean columns when appropriate.
- Use `font-variant-numeric: tabular-nums` for numeric columns.
- Use subtle zebra striping and a restrained row hover state.
- Avoid excessive vertical borders; spacing and horizontal separators are usually enough.
- Let the table body or table container scroll while important controls remain stable when practical.

For long text such as exclusions or notes, truncate by default and provide an explicit expand/collapse control when the full value is useful.

## Semantic Outline Status

Prefer restrained outlined status badges over high-saturation filled pills. Use a transparent background, semantic text color, and a subtle border derived from the same color.

Suggested semantics:

- Completed / success: green (`--bml-positive`)
- Pending / waiting / attention: amber (`--bml-attention`)
- Active / adjusted / informational: blue (`--bml-accent`)
- Canceled / error: red (`--bml-negative`)

Reserve semantic colors for information that benefits from the meaning. Do not use them decoratively.

## Floating Launcher

For bookmarklets that users may reopen while remaining on the page, consider a small floating action button in the lower-right corner.

A useful baseline is:

- 44×44px
- 20px from the bottom and right
- dark background
- subtle border
- high z-index
- optional count badge

Repeated execution should be idempotent. If the bookmarklet UI already exists, reopen or focus it instead of injecting another copy.

## Footer and Raw Data

Secondary actions and debugging information belong in a visually quiet footer. If raw JSON is useful for diagnostics, place it behind a collapsed disclosure rather than showing it alongside primary data.

## Host-Safe Bookmarklet CSS

Bookmarklet UI runs inside an unknown host page, so isolation is part of the design:

1. Give every injected ID and class a bookmarklet-specific prefix such as `#bml-overlay`, `#bml-modal`, `.bml-tab`, and `.bml-status`. For larger tools, use an even more specific prefix to reduce collisions.
2. Scope design tokens to the bookmarklet root elements rather than `:root`.
3. Avoid generic selectors such as `.button`, `.modal`, `.table`, or `.active` on their own.
4. Using `!important` is acceptable for injected bookmarklet UI when needed to defend against host-page styles; keep it scoped to bookmarklet selectors.
5. Use a sufficiently high z-index for overlays and floating launchers.
6. Do not reset or modify global host-page styles unless the task explicitly requires changing the page itself.
7. Remove injected elements, listeners, timers, and observers when the UI has a true teardown action.

## Composition Examples

A hotel crawler might use:

`Modal Shell + Progress Banner + Stats Bar + Filter Chips + Dense Data Table`

A transaction tracker might use:

`Modal Shell + Underline Tabs + Stats Bar + Dense Data Table + Semantic Status`

A multi-mode management tool might use:

`Floating Launcher + Modal Shell + Underline Tabs + Progress Banner + Data Table`

The pattern is a design vocabulary, not a fixed template.