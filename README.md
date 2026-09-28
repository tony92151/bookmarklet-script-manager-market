# Bookmarklet Script Manager Market

[English](README.md) · [繁體中文](README.zh-TW.md)

This repository contains the **Bookmarklet Launcher** website: a catalog of small JavaScript tools that you can save to your browser's bookmarks bar. Clicking a saved bookmark runs its script on the page you are viewing. The website is static; it serves the catalog and script files without a backend or an extension.

The separate [Bookmarklet Script Manager browser extension](https://chromewebstore.google.com/detail/bookmarklet-script-manage/eodhedafaheiadegenafmjlkmifojemp) is available on the Chrome Web Store. This repository hosts its [privacy policy](privacy.html), but does not contain the extension source.

Open the website: [Bookmarklet Launcher on GitHub Pages](https://tony92151.github.io/bookmarklet-script-manager-market/).

## What's here

| Path | Purpose |
| --- | --- |
| [`index.html`](index.html) and [`assets/install.js`](assets/install.js) | Bilingual catalog page that loads scripts and provides install and copy controls. |
| [`bookmarklets/catalog.json`](bookmarklets/catalog.json) | Metadata, source paths, and intended URL patterns for the listed tools. |
| [`bookmarklets/`](bookmarklets/) | JavaScript source for each bookmarklet. |
| [`shared/bookmarklet.js`](shared/bookmarklet.js) | Encoding and decoding of `javascript:` bookmark URLs. |
| [`converter/`](converter/) | Browser-based encoder and decoder for bookmarklet URLs. |
| [`privacy.html`](privacy.html) | Privacy policy for the separate browser extension. |

The catalog currently has one tool: [Klook Booking Category Labels](bookmarklets/klook-booking-category-label.js). On a supported Klook bookings page, it reads category icon filenames and adds category labels beside booking titles, including bookings loaded later by the page.

## Install and use a tool

See the [animated installation guide](install.en.html). Version 1.2.1 is now available in the Chrome Web Store; GitHub import requires version 1.2.1 or later.

1. Open the website and review a tool's description, intended URL pattern, and source code.
2. Drag **Install** to your bookmarks bar, or right-click it and save the link as a bookmark. **Copy code** lets you paste the full `javascript:` URL into a bookmark manually.
3. Visit a supported page and click the saved bookmark.

Bookmarklets execute in the current page and can interact with its content. Review a script before installing it. The URL patterns in the catalog describe where a tool is intended to work; they do not restrict where a browser lets you click the bookmark.

## Run locally

Serve the repository over HTTP from its root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/>. The catalog page fetches JSON and JavaScript files, so opening `index.html` as a `file://` URL will not work as intended.

Run the tests with Node.js:

```sh
node --experimental-default-type=module --test
```

## Add a bookmarklet

1. Add a raw JavaScript file to `bookmarklets/`. Do not include a `javascript:` prefix or pre-encode it. An IIFE keeps variables out of the page's global scope.
2. Add an entry to [`catalog.json`](bookmarklets/catalog.json) with a unique `id`, English and Traditional Chinese `name` and `description`, a `source` under `bookmarklets/`, intended URL patterns in `matches`, `version`, and `updated`.
3. Run the tests and try the installed bookmark on the target page.

The catalog page fetches each source file and turns it into an installable `javascript:` URL in the browser. See [`skill.md`](skill.md) for the project's bookmarklet authoring guidance.

## Deployment

The [GitHub Pages workflow](.github/workflows/deploy-pages.yml) runs the tests and publishes the static site when `main` is pushed or the workflow is started manually. Configure this repository's Pages source as **GitHub Actions** to use it.

## License

[MIT](LICENSE)
