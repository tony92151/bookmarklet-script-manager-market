# Bookmarklet Launcher

Static GitHub Pages site for installing bookmarklets, converting bookmarklet URLs, and reading the Bookmarklet Script Manager privacy policy.

## Local preview

Serve this directory with any static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. The catalog and bookmarklet sources are fetched over HTTP, so opening `index.html` as a local file will not load the catalog.

## GitHub Pages

Set this repository’s Pages source to **GitHub Actions**. The workflow publishes `index.html`, `privacy.html`, `assets/`, `converter/`, `shared/`, and `bookmarklets/` at the site root. The public pages are `/`, `/converter/`, and `/privacy.html`.

## Create a bookmarklet

The repository includes [make-bookmarklet](skill.md), a skill for adding a JavaScript source file and catalog entry for the site.

## Tests

```sh
node --experimental-default-type=module --test
```

The Chrome extension is maintained in [bookmarklet-launcher](https://github.com/tony92151/bookmarklet-launcher).

## License

MIT
