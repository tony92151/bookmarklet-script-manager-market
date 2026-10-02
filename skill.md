---
name: make-bookmarklet
description: Use when a user wants to create or modify a bookmarklet, perform a webpage action in one click, or build a lightweight browser-page automation tool.
---

# Create a Bookmarklet

Turn the user's webpage task into a practical bookmarklet. The skill is designed to work both in a normal ChatGPT conversation and, when repository access is available, with the Bookmarklet Launcher repository.

Treat the user's current request as the requirements. If essential details are missing, ask only for the information needed to proceed, such as the target page, desired action, expected output, or relevant DOM/API evidence.

## Execution Environment

A bookmarklet runs as ordinary JavaScript in the current webpage when the user clicks its bookmark. It can access the page DOM and page-accessible globals, but not extension APIs such as `chrome.*`. It may be limited by the browser, cross-origin restrictions, or the page's Content Security Policy, and it cannot run on restricted browser pages such as `chrome://` or extension pages.

A bookmarklet is a one-time executable JavaScript program, not a module. Do not use `import` or `export` unless the user is explicitly building something other than a bookmarklet.

## Core Writing Guidelines

1. Wrap the script in an IIFE such as `(() => { ... })();` to avoid leaking globals and redeclaration errors on repeated runs. Use an async IIFE when needed.
2. Make repeated execution safe. Reuse, reopen, refresh, or replace previously injected UI instead of creating uncontrolled duplicates.
3. Give visible feedback on completion or failure. If a required element is missing, explain what page, state, or element is expected.
4. Use defensive DOM selection. Prefer stable attributes, semantic relationships, and structural anchors over fragile generated class names when possible.
5. For SPA navigation or delayed content, use bounded polling or observation with a timeout and clean up timers and observers.
6. For downloads, use a Blob and a temporary `<a download>` element. For clipboard access, handle failures and provide a fallback when practical.
7. Keep comments concise and useful to someone modifying the script later.
8. Do not assume a DOM-only approach is always best. When the page itself uses a same-origin JSON/API endpoint that is available from the current authenticated page context, it may be more reliable to use that endpoint. Do not bypass authentication, access controls, or browser security boundaries.
9. When the user provides DevTools output, HTML, screenshots, network requests, or existing code, treat that evidence as the primary implementation reference. Do not invent selectors, endpoints, or response fields that the evidence does not support.

## When Page Information Is Insufficient

If the user has not provided enough information to identify reliable selectors or data sources, ask for targeted evidence instead of guessing. Useful evidence includes:

- a screenshot showing the relevant page area
- copied HTML for the target element
- DevTools Elements output
- a Network request copied as cURL or fetch
- a sample JSON response
- console output from a small inspection snippet

For login-only or dynamic pages, user-supplied DevTools evidence is often more useful than attempting to infer the implementation from a public landing page.

## UI Pattern Selection

Choose UI patterns according to the bookmarklet's function, information density, and interaction model. Patterns are optional and may be combined. Do not force a large modal onto a bookmarklet that only needs a small inline result.

This skill may be loaded directly from a raw GitHub URL. Do not assume relative repository paths can be resolved automatically. When a pattern guide is required, fetch and read the explicit raw URL listed below before implementing that UI.

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
- Persistent or reopenable interface → add Floating Launcher

Patterns can be combined when their responsibilities are distinct. For example, a hotel crawler may use `Dark Data Modal + Floating Launcher`, while a reward calculator may need only an `Inline Value Badge`.

When the user provides a screenshot or an implementation they like, identify the reusable visual and interaction patterns rather than blindly copying the source. Preserve the preferred design language while adapting it to the bookmarklet's actual function.

If additional UI pattern guides are added later, list each one in this section with its purpose, when to use it, when not to use it, compatible patterns, and an explicit raw GitHub URL. This keeps the main skill usable when shared as a single raw `skill.md` URL.

## Output Format

By default, output readable and maintainable multi-line JavaScript source code.

- Use normal indentation and line breaks.
- Prefer clarity and maintainability over minification.
- Do not compress the bookmarklet into one line unless the user explicitly asks for a one-line or directly pasteable bookmarklet.
- Do not add the `javascript:` prefix unless the user explicitly asks for a directly installable bookmarklet URL.
- When the user asks for both readable source and a pasteable bookmarklet, provide the readable source first, then provide a separate one-line `javascript:` version.
- Repository source files must remain readable raw JavaScript unless the project itself requires another format.

## General Workflow

1. Understand the target site or page state, desired action, and expected output.
2. Inspect the available evidence. For a public page, inspect it when useful. For a login-only or dynamic page, prefer HTML, screenshots, DevTools output, or network evidence supplied by the user.
3. Decide whether the task is best solved through DOM interaction, page-observed data, a same-origin page API, or a combination of these approaches.
4. Choose the smallest appropriate UI pattern from `UI Pattern Selection`. If the selected pattern points to an external guide, fetch and read that guide before implementing the UI.
5. Implement the bookmarklet defensively and make repeated execution safe.
6. Verify syntax and, when possible, test the relevant parsing, calculations, selectors, and state transitions against the supplied evidence.
7. Deliver readable, well-formatted multi-line JavaScript by default. Only provide a one-line `javascript:` bookmarklet URL when the user explicitly asks for a directly pasteable or installable bookmarklet.
8. Explain the expected behavior and what evidence the user should provide if the bookmarklet does not work on the live page.

## Repository Integration

Apply this section only when working in `tony92151/bookmarklet-script-manager-market`, when repository access is available, or when the user explicitly asks to publish the bookmarklet to that project.

Do not assume that every user of this skill is working inside the repository. Repository-specific steps such as editing `bookmarklets/catalog.json`, creating files under `bookmarklets/`, or running repository tests are not required for a normal bookmarklet request.

When repository integration is requested:

1. Save readable raw JavaScript without a `javascript:` prefix or percent encoding at `bookmarklets/<kebab-case-name>.js`.
2. Add or update a record in `bookmarklets/catalog.json` with a unique `id`, English and Traditional Chinese `name` and `description`, a `source` of `bookmarklets/<kebab-case-name>.js`, `matches`, `version`, and `updated`.
3. The Bookmarklet Launcher reads `bookmarklets/catalog.json`, fetches each record's `source`, and converts the raw JavaScript into an encoded `javascript:` URL with `shared/bookmarklet.js`. Keep catalog source paths within `bookmarklets/`.
4. If useful, inspect `bookmarklets/klook-booking-category-label.js` and its catalog record as a repository-specific reference example rather than as a universal requirement.
5. Verify the script syntax, catalog JSON, and relevant behavior. Run `node --experimental-default-type=module --test` when the repository test environment is available.
6. Tell the user how to install and test the new item from the Bookmarklet Launcher catalog.
