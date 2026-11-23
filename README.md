# faro-frontend-guidelines

A shared place for the frontend team to write down how we build faro (osb-faro-web): longer guideline write-ups and short, reviewable rules. Nothing here is agreed yet; pages go in once the team agrees on them.

## How it works

Markdown in, static HTML out. No framework, no server in production.

```
docs/*.md, rules/*.md  ──▶  src/build.js  ──▶  dist/  ──▶  GitHub Pages
```

- `docs/`: one Markdown file per guideline page
- `rules/`: one file per rule. Copy `rules/_template.md` to start; the build fails if a required section is missing.
- `src/docs.js`: reads the Markdown and front matter, highlights code at build time
- `src/build.js`: renders every page with the Handlebars templates in `src/views/` and copies `public/` (CSS)
- `src/serve.js`: local dev server for `dist/`

## Running it

```sh
yarn install
yarn dev     # http://localhost:3000, rebuilds on changes
yarn build   # writes dist/
```

## Deploying

Every push to `main` runs `.github/workflows/pages.yml`, which builds the site and publishes `dist/` to GitHub Pages.
