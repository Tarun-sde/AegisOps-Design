# Heron AI — architectural frontend

A local, frontend-only Next.js recreation of the Heron AI public website experience, with original SVG architecture and HTML product previews. The source reference package is preserved in `references/`.

## Run

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js. Routes: `/` and `/heron-dashboard`.

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

Playwright uses port 3002 and starts a development server if none is running. To test an existing production server:

```sh
npm run start -- --port 3011
TEST_BASE_URL=http://localhost:3011 npm test
```

## Visual evidence

`artifacts/screenshots/` contains desktop, mobile, short-viewport, and interaction-state captures. The capture scripts accept `TEST_BASE_URL` and default to `http://localhost:3002`:

```sh
node scripts/visual-review.mjs
node scripts/capture-states.mjs
```

The Phase 1.5 motion gallery is `artifacts/motion/index.html`. Recreate its recordings and comparisons with:

```sh
TEST_BASE_URL=http://localhost:3011 node scripts/capture-motion.mjs
python scripts/compare-motion.py
```

The second script uses system FFmpeg and Pillow. The gallery labels time-normalized comparisons separately from controlled scroll-progress samples.

See `IMPLEMENTATION_REPORT.md` for results, remaining visual differences, dependency advisories, and verification limits.

## Scope and assets

All displayed project data and approval actions are local illustrations. No backend, account, BIM integration, or submission service is included. Demo, pricing, and chat-widget links open their original external pages. All architectural drawings and the geometric mark are original implementation artwork; no research screenshot or proprietary font binary is served. Inter and Geist Mono are bundled locally under the SIL Open Font License; notices are in `public/licenses/`.
