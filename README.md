# Bookmarklet Script Manager Market

[English](README.md) · [繁體中文](README.zh-TW.md)

This repository contains the **Bookmarklet Launcher Market** website: a catalog of small JavaScript tools that you can import into Bookmarklet Script Manager and run on supported pages. The static website serves the catalog, script files, and animated installation tutorial without a backend. The Market and tutorial support English, Traditional Chinese, Brazilian Portuguese, Spanish, and Japanese.

The separate [Bookmarklet Script Manager browser extension](https://chromewebstore.google.com/detail/bookmarklet-script-manage/eodhedafaheiadegenafmjlkmifojemp) is available on the Chrome Web Store. This repository hosts its [privacy policy](privacy.html), but does not contain the extension source.

Open the website: [Bookmarklet Launcher on GitHub Pages](https://tony92151.github.io/bookmarklet-script-manager-market/).

## What's here

| Path | Purpose |
| --- | --- |
| [`index.html`](index.html) and [`assets/install.js`](assets/install.js) | Five-language Market with tool descriptions, previews, and GitHub links for import. |
| [`assets/locales/index.js`](assets/locales/index.js) and [`assets/language.js`](assets/language.js) | Locale registry, runtime dictionaries, and shared language preference handling. |
| [`install.html`](install.html) and [`install.en.html`](install.en.html) | Installation tutorial entry points using shared JavaScript and tutorial locale dictionaries. |
| [`skill.html`](skill.html) | Five-language guide to using the make-bookmarklet Skill with AI, including copyable prompts and testing steps. |
| [`bookmarklets/catalog.json`](bookmarklets/catalog.json) | Metadata, source paths, and intended URL patterns for the listed tools. |
| [`bookmarklets/`](bookmarklets/) | JavaScript source for each bookmarklet. |
| [`shared/bookmarklet.js`](shared/bookmarklet.js) | Encoding and decoding of `javascript:` bookmark URLs. |
| [`converter/`](converter/) | Browser-based encoder and decoder for bookmarklet URLs. |
| [`privacy.html`](privacy.html) | Privacy policy for the separate browser extension. |

The catalog currently has three tools:

- [Klook Booking Category Labels](bookmarklets/klook-booking-category-label.js) reads category icon filenames and adds category labels beside booking titles, including bookings loaded later by the page.
- [StayMiles Hotel Mileage Rate Helper](bookmarklets/staymiles-rate-helper-zh.js) shows TWD cost per mile or miles per USD beside StayMiles hotel prices.
- [EVA Mileage Hotel Rate Helper](bookmarklets/eva-mileage-hotel-healper-zh.js) provides the same mileage comparison for EVA hotel prices.

## Install and use a tool

See the [animated installation guide](install.en.html). GitHub import requires Bookmarklet Script Manager version **1.2.1 or later**.

1. Install the Bookmarklet Script Manager extension.
2. Open the Market, review a tool's description, intended URL pattern, and source code, then select **Copy GitHub link**.
3. Open the extension's **Manage Scripts** screen, paste the link into the **GitHub** tab, and save it.
4. Visit a supported page and run the saved tool from the extension.

The scripts execute in the current page and can interact with its content. Review a script before importing it. The URL patterns in the catalog describe where a tool is intended to work.

## Website languages

Use the language selector or share a URL such as [`?lang=pt-BR`](https://tony92151.github.io/bookmarklet-script-manager-market/?lang=pt-BR), [`?lang=es`](https://tony92151.github.io/bookmarklet-script-manager-market/?lang=es), or [`?lang=ja`](https://tony92151.github.io/bookmarklet-script-manager-market/?lang=ja). The tutorial accepts the same parameter, for example [`install.html?lang=ja`](install.html?lang=ja).

Language selection follows this priority: a supported URL `lang` value, the saved `bookmarklet-launcher-language` preference, the browser's `navigator.languages`, then English. The legacy tutorial filenames provide a fallback after browser preferences and before the final English default. The website preference is independent of the extension's language storage.

Market strings live in the runtime dictionaries under `assets/locales/`, registered in `assets/locales/index.js`; `assets/language.js` handles shared language selection. The tutorial uses shared JavaScript and separate dictionaries in `assets/tutorial-locales.js`. Catalog names, descriptions, and screenshot alternative text are translated in `bookmarklets/catalog.json`.

Website translations do not automatically translate the tools' own interfaces, screenshot pixels, or the extension. The privacy policy and converter body retain their existing language coverage. Adding website languages does not imply that a new extension release or those languages are available in the Chrome Web Store.

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
2. Add an entry to [`catalog.json`](bookmarklets/catalog.json) with a unique `id`, `name` and `description` in all five locales (`en`, `zh-TW`, `pt-BR`, `es`, `ja`), a `source` under `bookmarklets/`, intended URL patterns in `matches`, `version`, and `updated`. Translate every screenshot's `alt` text into the same five locales when adding previews.
3. Run the tests, import the tool into the extension, and try it on the target page.

The catalog provides a GitHub link for each source file so the extension can import it. See [`skill.md`](skill.md) for the project's bookmarklet authoring guidance.

## Deployment

The [GitHub Pages workflow](.github/workflows/deploy-pages.yml) runs the tests and publishes the static site when `main` is pushed or the workflow is started manually. Configure this repository's Pages source as **GitHub Actions** to use it.

## License

[MIT](LICENSE)
