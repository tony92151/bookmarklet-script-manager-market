# Bookmarklet Market alternative design

Run `python3 -m http.server 8000` from the repository root, then open http://localhost:8000/redesign/.

The original homepage remains at `/`. The Pages workflow includes this directory, so publishing the repository also exposes `/redesign/`. This change does not itself publish or push anything.

This is a Traditional Chinese product-introduction and market variant. The homepage introduces Bookmarklet Script Manager and offers three selectable use cases: calculations, content labels, and custom scripts. Without JavaScript all three descriptions remain readable. The language link opens the existing multilingual market. Four script entries reference the real GitHub source files; the catalog is a static snapshot of `bookmarklets/catalog.json`, so update its text and versions when the catalog changes. Copy falls back to a selectable dialog if clipboard access is unavailable. The standalone mileage calculator has been removed from the homepage.

The user-selected palette is light grey-white with violet actions. Desktop market entries use two columns, and each screenshot pair is inside its corresponding tool card.
Four original screenshots are referenced from `../bookmarklets_screenshot/`; none are stock photos. Existing guides, privacy policy and converter are linked. Fonts are locally hosted Stack Sans Headline (300) and Stack Sans Text (400/500), with system CJK fallbacks. Font license files are in `fonts/`.

Design record and screenshot reports: `.taste-skill/brief.md`, `.taste-skill/critique.md`, `.taste-skill/before/`, `.taste-skill/after/`.

Approved visual taste: [Light Violet Tech guidelines](../docs/brand-guidelines.md), including reusable tokens and fixed reference screenshots. Consult this before future visual changes.
