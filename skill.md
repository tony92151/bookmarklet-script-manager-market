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

## UI Pattern Selection

Choose UI patterns according to the bookmarklet's function, information density, and interaction model. Patterns are optional and may be combined. Do not force a large modal onto a bookmarklet that only needs a small inline result.

This skill may be loaded directly from a raw GitHub URL, so do not assume that relative file references will be resolved automatically. When a pattern guide is needed, fetch it from the explicit raw URL listed below before implementing that UI.

### Inline Value Badge

Use for:

- reward multipliers
- points-per-currency or currency-per-point calculations
- cashback percentages
- computed values displayed next to an existing price or reward
- small read-only annotations that do not require user interaction

Keep the result visually close to the source value and match the host page's density where practical. A dedicated pattern guide is not required for this simple case.

### Toast Feedback

Use for:

- copy success
- completion confirmation
- short errors
- one-step actions that need feedback but not a persistent interface

Keep the message brief and non-blocking. A dedicated pattern guide is not required for this simple case.

### Compact Control Panel

Use for:

- bookmarklets with a small number of settings
- start/stop controls
- simple automation controls
- actions that need configuration but do not produce a large dataset

Prefer a small modal or floating panel with only the controls required by the task. Do not introduce data-table patterns unless the bookmarklet actually displays tabular results.

### Dark Data Modal

Use for:

- crawlers and scrapers with many results
- transaction, order, trip, or reward-history viewers
- analytics and statistics tools
- offer or inventory explorers
- tools with search, sorting, filtering, or status views
- CSV/JSON export tools
- management interfaces with persistent datasets

This is a composite pattern that may include a modal shell, underline tabs, progress banner, stats bar, outline filter chips, dense data table, semantic status badges, floating launcher, and diagnostic footer. Use only the components required by the bookmarklet.

Before implementing this pattern, read the full guide:

`https://raw.githubusercontent.com/tony92151/bookmarklet-script-manager-market/refs/heads/main/ui-patterns/dark-data-modal.md`

Repository path: `ui-patterns/dark-data-modal.md`

### Floating Launcher

Use for:

- bookmarklet UI that users may reopen repeatedly
- tools that remain active while the user continues using the page
- background collection or monitoring interfaces
- data tools whose modal can be closed without ending the bookmarklet session

For data-heavy interfaces, follow the Floating Launcher section in the Dark Data Modal guide above. For simple tools, keep the launcher minimal and make repeated bookmarklet execution idempotent.

### Choosing and Combining Patterns

Start with the smallest UI that satisfies the task:

- Inline calculation or annotation → Inline Value Badge
- One-step action with a result → Toast Feedback
- Small configurable action → Compact Control Panel
- Large dataset or analysis workflow → Dark Data Modal
- Persistent/reopenable interface → add Floating Launcher

Patterns can be combined when their responsibilities are distinct. For example, a hotel crawler may use `Dark Data Modal + Floating Launcher`, while a reward calculator may need only an `Inline Value Badge`.

When the user provides a screenshot or an implementation they like, identify the reusable visual and interaction patterns rather than blindly copying the source. Preserve the preferred design language while adapting it to the bookmarklet's actual function.

If additional UI pattern guides are added later, list each one in this section with: its purpose, when to use it, when not to use it, compatible patterns, and an explicit raw GitHub URL. This keeps the main skill usable when it is shared as a single raw `skill.md` URL.

## Workflow

1. Clarify the target site, desired action, and output when the request does not specify them.
2. Inspect a public target page when possible. For a login-only page, work from HTML supplied by the user or explain that selectors need testing on the live page.
3. Choose the smallest appropriate UI pattern from `UI Pattern Selection`. If the selected pattern points to an external guide, fetch and read that guide before implementing the UI.
4. Write the script at `bookmarklets/<kebab-case-name>.js`.
5. Add a record to `bookmarklets/catalog.json` with a unique `id`, English and Traditional Chinese `name` and `description`, a `source` of `bookmarklets/<kebab-case-name>.js`, `matches`, `version`, and `updated`.
6. Verify the script's syntax, catalog JSON, and relevant behavior. Run `node --experimental-default-type=module --test` for the site tests.
7. Tell the user to open the Bookmarklet Launcher site, install the new item from the catalog, visit a matching page, and click the bookmark. Explain the expected result and what to report if it fails.
