---
name: make-bookmarklet
description: Use when a user wants a bookmarklet for the Bookmarklet Launcher site, asks to perform a webpage action in one click, or describes a browser-page automation task.
---

# Create a Bookmarklet

Turn the user's one-click webpage task into a standalone JavaScript file that can be installed from this repository's Bookmarklet Launcher site.

If `$ARGUMENTS` has content, treat it as the requirements description. If it is empty, ask the user what they want the bookmarklet to do.

## Execution Environment

A bookmarklet runs as ordinary JavaScript in the current webpage when the user clicks its bookmark. It can access the page DOM and globals, but not extension APIs such as `chrome.*`. It may be limited by the browser or the page's Content Security Policy, and it cannot run on restricted browser pages such as `chrome://` or extension pages. It is a one-time executable code string, not a module: do not use `import` or `export`.

The site reads `bookmarklets/catalog.json`, fetches each record's `source`, and converts the fetched JavaScript into an encoded `javascript:` URL with `shared/bookmarklet.js`. Keep source paths within `bookmarklets/`.

## Writing Guidelines

1. Wrap the script in an IIFE, such as `(() => { ... })();`, to avoid leaking globals and redeclaration errors on repeated runs. Use an async IIFE when needed.
2. Save raw JavaScript, without a `javascript:` prefix or percent encoding. The site creates the bookmarklet URL.
3. Give visible feedback on completion or failure. If a required element is missing, explain which page or element is expected.
4. Use defensive DOM selection. For waits or SPA navigation, bound polling or observation with a timeout and clean up timers and observers.
5. For downloads, use a Blob and a temporary `<a download>` element. For clipboard access, handle failures and offer a way to copy manually.
6. Keep comments concise and useful to someone modifying the script later.

See `bookmarklets/klook-booking-category-label.js` and its record in `bookmarklets/catalog.json` for the repository's existing pattern.

## UI Design Patterns

Treat these patterns as a reusable design library, not a mandatory template. Choose only the patterns that fit the bookmarklet's purpose. A small inline calculator or one-value annotation should stay lightweight; a crawler, tracker, data explorer, or management tool can use the richer modal patterns below.

### Dark Data Modal

Use this pattern for data-heavy tools such as crawlers, transaction/order viewers, analytics tools, and management interfaces.

Suggested design tokens:

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

Build the interface as a fixed fullscreen translucent overlay with a centered modal. A good starting point is `width: 92%`, `max-width: 960px`, `max-height: 82vh`, an 8px radius, a subtle border, and a deep shadow. Use an extremely high z-index so the bookmarklet stays above the host page.

Prefer hierarchy through spacing, borders, and small changes in background brightness rather than many unrelated colors. For a full data tool, a useful information hierarchy is:

`Header → Tabs → Progress/Loading → Stats → Filters → Data Table → Footer`

### Underline Tabs

Use underline tabs for switching between major modes or views. Keep inactive tabs transparent with muted text. Give the active tab normal text and a 2px accent-colored bottom border. Avoid turning major navigation tabs into large filled buttons unless the host task specifically calls for that visual weight.

### Outline Filter Chips

Use compact outlined controls for filtering the current dataset rather than for primary navigation. Keep inactive chips transparent with a subtle border and muted text. For the active filter, use the accent border and only a very subtle tinted background.

Include useful counts when available, for example: `All (821)`, `With Amount (44)`, `Tracked (87)`.

### Dense Data Table

For large datasets:

- Prefer `table-layout: fixed` and explicit column widths, such as a `<colgroup>`, so long values do not constantly reflow the table.
- Keep the table header sticky while the data region scrolls.
- Left-align descriptive text, right-align monetary/numeric values, and center short status/date/boolean columns when appropriate.
- Use `font-variant-numeric: tabular-nums` for columns containing numbers.
- Use subtle zebra striping and a restrained row hover state.
- Avoid excessive vertical borders; spacing and horizontal separators are usually enough.
- Let the table body/container scroll while important controls such as the header, tabs, stats, filters, and footer remain stable when practical.

### Semantic Outline Status

For statuses, prefer restrained outlined badges over high-saturation filled pills. Use a transparent background, semantic text color, and a subtle border derived from the same color.

Suggested semantics:

- Completed / success: green (`--bml-positive`)
- Pending / waiting / attention: amber (`--bml-attention`)
- Active / adjusted / informational: blue (`--bml-accent`)
- Canceled / error: red (`--bml-negative`)

Do not use semantic colors decoratively; reserve them for information that benefits from the meaning.

### Floating Launcher

For bookmarklets that users may reopen while staying on the page, consider a small floating action button in the lower-right corner. A useful baseline is 44×44px, 20px from the bottom/right, with a dark background, subtle border, high z-index, and an optional count badge.

Make repeated execution idempotent: if the bookmarklet UI already exists, reopen or focus it instead of injecting a duplicate interface.

### Host-Safe Bookmarklet CSS

Bookmarklet UI runs inside an unknown host page, so isolation is part of the design:

1. Give every injected ID and class a bookmarklet-specific prefix such as `#bml-overlay`, `#bml-modal`, `.bml-tab`, and `.bml-status`. For larger tools, use an even more specific prefix to reduce collisions.
2. Scope design tokens to the bookmarklet's root elements rather than `:root`.
3. Avoid generic selectors such as `.button`, `.modal`, `.table`, or `.active` on their own.
4. Using `!important` is acceptable for injected bookmarklet UI when needed to defend against host-page styles; keep it scoped to bookmarklet selectors.
5. Use a sufficiently high z-index for overlays and floating launchers.
6. Do not reset or modify global host-page styles unless the task explicitly requires changing the page itself.
7. Remove injected elements, listeners, timers, and observers when the UI has a true teardown action.

### Pattern Selection

Do not apply every pattern to every bookmarklet. Start from the task's information density and interaction model:

- Inline calculation or annotation: prefer a small badge/label near the source data.
- Simple one-step action: prefer lightweight feedback such as a toast or compact panel.
- Configurable action: use a small modal or popover with only the necessary controls.
- Data crawler, tracker, explorer, or manager: consider the full Dark Data Modal with stats, filters, and a dense table.

When the user provides a UI screenshot or an existing implementation they like, identify the reusable visual and interaction patterns rather than blindly copying the source. Preserve the user's preferred design language while adapting it to the new bookmarklet's actual function.

## Workflow

1. Clarify the target site, desired action, and output when the request does not specify them.
2. Inspect a public target page when possible. For a login-only page, work from HTML supplied by the user or explain that selectors need testing on the live page.
3. Write the script at `bookmarklets/<kebab-case-name>.js`.
4. Add a record to `bookmarklets/catalog.json` with a unique `id`, English and Traditional Chinese `name` and `description`, a `source` of `bookmarklets/<kebab-case-name>.js`, `matches`, `version`, and `updated`.
5. Verify the script's syntax, catalog JSON, and relevant behavior. Run `node --experimental-default-type=module --test` for the site tests.
6. Tell the user to open the Bookmarklet Launcher site, install the new item from the catalog, visit a matching page, and click the bookmark. Explain the expected result and what to report if it fails.
