# faro-frontend-guidelines

Frontend guidelines and rules for faro (osb-faro-web), published as a static site on GitHub Pages.

- `docs/`: longer guideline write-ups, one Markdown file per page
- `rules/`: short, reviewable rules. Copy `rules/_template.md` to start one; the build fails if a required section is missing.

## Running it

```sh
yarn install
yarn dev     # builds and serves on http://localhost:3000, rebuilding on changes
yarn build   # writes the static site to dist/
```

Every push to `main` deploys the site through `.github/workflows/pages.yml`.
