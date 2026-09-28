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

## Workflow

1. Clarify the target site, desired action, and output when the request does not specify them.
2. Inspect a public target page when possible. For a login-only page, work from HTML supplied by the user or explain that selectors need testing on the live page.
3. Write the script at `bookmarklets/<kebab-case-name>.js`.
4. Add a record to `bookmarklets/catalog.json` with a unique `id`, English and Traditional Chinese `name` and `description`, a `source` of `bookmarklets/<kebab-case-name>.js`, `matches`, `version`, and `updated`.
5. Verify the script's syntax, catalog JSON, and relevant behavior. Run `node --experimental-default-type=module --test` for the site tests.
6. Tell the user to open the Bookmarklet Launcher site, install the new item from the catalog, visit a matching page, and click the bookmark. Explain the expected result and what to report if it fails.
