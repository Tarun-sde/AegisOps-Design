# Heron AI frontend implementation report

## Phase 1.5 — motion overhaul (current implementation)

The page composition, typography, colors, navigation, original artwork and existing approval/inspection controls remain intact. This pass changes the scene choreography and adds mobile model controls. The Phase 1 notes below remain as historical implementation details; this section supersedes their motion and validation descriptions.

### What changed

- **Entrances:** the preloader now hands off to the hero drawing. Structural strokes, material fill, clipped geometry, dimensions, annotations and the headline enter in a coordinated sequence. Drawing coordinates settle at their original positions before inspection. Dashboard terrain, activity rows and pending requests enter as separate layers. Session revisits and route changes start their entrances without repeating the preloader; reduced motion skips them. The initial stylesheet shows the curtain before hydration; a small head script skips it for returning sessions and a noscript style preserves a readable JavaScript-disabled page. This addresses the initial flash found by reviewing the first encoded video frame, which a post-load DOM assertion alone did not catch.
- **Persistent workflow:** one floor plan reveals its furniture under a scan, detects a specific door-clearance problem, draws an issue frame and leader, moves an editing reticle, transforms the actual door path and clearance region, retains a faint before-state during the edit, and traces the resulting standard through three model locations. All stages share one reversible timeline. The alert was repositioned after frame review so it does not cover the door.
- **Five dashboard scenes:** nested project windows fan into place, metrics and activities develop, a request enters over its highlighted model area, history grows along a spine while the door changes, team members and their statuses arrive in sequence, and firm standards replace room labels on the drawing. These internal timelines are nested in the existing parent ScrollTrigger. Incoming and outgoing headings are staggered independently so their text does not overlap during the scene change. Approval decisions remain explicit user actions; scrolling does not approve anything.
- **Supporting scenes:** introduction typography uses a scroll-controlled clip; problem diagrams have distinct drawing, separation, targeting and time motions; platform tabs coordinate dimensions, labels and highlights with the existing viewport transform; Why Heron retains its drawing layers and transitions them while correcting the same door; product previews reveal their own UI layers; the pavilion progressively reveals.
- **Ink:** the aligned sketch and render still use the same geometry. Scroll now drives both the mask path and displacement strength. The trigger range follows the illustration itself so the ragged intermediate edge is visible on screen.
- **Responsive behavior:** desktop keeps the existing reserved scroll lengths. On mobile, four touch/keyboard controls scrub the same workflow model through short transitions above the stacked copy. Dashboard internals use short, unpinned scroll ranges and the feature navigation follows the visible scene. Reduced motion exposes static dashboard content and allows instantaneous workflow phase selection.
- **Lifecycle and performance:** no new dependencies, animation loops or React frame updates. Scenes run on the existing GSAP/Lenis clock; scroll scanning uses a transform. Rich secondary previews initialize near the viewport and are captured in a context that reverts on navigation/media changes. Existing cursor sleep behavior, footer lens and Next.js curtain/history remain in place.

### Evidence and fidelity limits

See [MOTION_GAP_AUDIT.md](MOTION_GAP_AUDIT.md) for the pre-implementation section audit. All six supplied videos were sampled; the workflow and dashboard recordings were also inspected at half-second intervals and in consecutive-frame strips around their entrance transitions. Both older implementation videos were reviewed before editing.

The evidence is narrower than the filenames suggest: recording 03 shows the preloader and an initial plan, without a complete four-stage workflow; recording 05 shows One View without all five feature scenes. Consequently, missing-stage choreography reconstructs the requested behavior and the [developer's persistent-model explanation](https://tympanus.net/codrops/2026/10/12/heron-ai/), rather than claiming an exact measured reproduction. Supporting section timings are likewise reconstructed where the recordings do not cover them. The existing dark preloader/footer and vector artwork remain intentional visual differences.

Final capture assets live in `artifacts/motion/`; open [the motion gallery](artifacts/motion/index.html). The final production capture produced 66 frames and seven raw local recordings, with no page errors, console warnings or observed horizontal overflow. The gallery contains 13 filmstrips and six side-by-side videos. Raw local recordings retain their actual capture timing. Side-by-side reference/local WebM clips normalize each clip to twelve seconds, and comparison filmstrips explicitly label normalized **video time**, not equivalent scroll progress. Separate local workflow, ink and five-feature filmstrips show controlled 0/25/50/75/100% progression. Boundary frames intentionally retain the outgoing phase before the next phase develops. These comparisons show internal geometry and layer motion; passing interaction tests alone is not treated as evidence of motion fidelity.

Chromium review includes 1440×900, 1440×700, 1920×1080, and touch-emulated 390×844. Safari, Firefox, physical mobile hardware, screen readers, heap profiling and sustained frame-rate measurements remain untested. No motion-perfect or guaranteed 60fps claim is made.

### Phase 1.5 validation

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Passed | `artifacts/motion/typecheck.log` |
| `npm run lint` | Passed | `artifacts/motion/lint.log` |
| `npm run build` | Passed; both routes statically rendered | `artifacts/motion/build.log` |
| `TEST_BASE_URL=http://localhost:3011 npm test` | **29 passed in 43.1 seconds** | `artifacts/motion/playwright-production.log` |

All 18 existing tests remain enabled and unchanged. Eleven additional tests verify intermediate SVG geometry, forward/reverse model editing, actual internal movement in each of the five dashboard scenes, five distinct ink-mask states and reversal, resize and pin release, mobile model controls, reduced-motion behavior, cleanup through route navigation and browser history, and first-load curtain visibility before hydration with a script-free fallback. Transform reversal comparisons allow 0.02 units of interpolation error; one initial exact-string assertion differed by 0.0009 pixels and was corrected rather than changing the animation.

The first development run overlapped edits/hot reloads and had two interaction failures; both passed in isolated production checks and in the final full run. Final browser capture and visual review are documented in the motion gallery. Reviewed frames include the staged hero entrance, exposed door issue, intermediate and completed correction, standards propagation, each dashboard feature at five progress points, ink edge, footer lens, and both routes at short, wide and mobile sizes. `artifacts/motion/browser-findings.json` also records path data, SVG attributes and computed transforms at each captured state.

### Reproduce the motion evidence

```sh
npm run build
npm run start -- --port 3011
TEST_BASE_URL=http://localhost:3011 npm test
TEST_BASE_URL=http://localhost:3011 node scripts/capture-motion.mjs
python scripts/compare-motion.py
```

The comparison script uses system FFmpeg and Pillow; it adds no application dependency. It does not alter any supplied reference files.

---

## Phase 1 result

Implemented the two requested public pages in this repository using Next.js App Router, React, strict TypeScript, Tailwind CSS, custom CSS tokens, GSAP, ScrollTrigger, `@gsap/react`, Lenis, SVG, and Canvas 2D. Both routes are statically prerendered by the production build.

This is a functional visual recreation with original artwork, not a pixel-identical copy. Important differences and verification limits are recorded below. No backend, authentication, database, external application API, deployment, commit, or push was added. `ASTRA_START_HERE.md`, `references/`, and the existing research documents were preserved.

## Routes and sections

| Route | Completed sections |
| --- | --- |
| `/` | Architectural preloader; interactive elevation hero; editorial introduction; practice strip; four problem cards; pinned Observe → Advise → Act → Learn narrative; Revit/Rhino/ArchiCAD/SketchUp tabs; chat-widget and dashboard product previews; Why Heron interactive feature panels; eight use-case accordions; sketch-to-render CTA; interactive footer |
| `/heron-dashboard` | Split editorial/product hero; practice strip; five scroll-controlled features (One View, Approval Queue, Full History, Team View, Firm Standards); three-step oversight workflow; five-question FAQ; shared CTA and footer |

Shared navigation includes a mouse-hover/keyboard-operable product dropdown, a native mobile modal with focus containment and Escape dismissal, internal page navigation, and external links for out-of-scope pricing, contact, and chat-widget pages. Demo links open the original contact page; no nonfunctional local booking form is presented.

## Design and original assets

- Central paper, charcoal, red, border, typography, spacing, and viewport tokens in `app/globals.css`.
- Measured paper `#e0e0da`, ink `#282828`, issue red `#fa3600`, and border `#b3b3af`.
- Locally bundled Inter and Geist Mono; SIL Open Font License notices in `public/licenses/`. No proprietary font files or remote font requests.
- Original building elevation with glazing, mullions, stairs, rails, concrete hatching, technical dimensions, and recursively drawn trees.
- Original floor plan with wall weights, rooms, furniture, door swings, stair details, dimensions, and warning pins.
- Aligned sketch and shaded variants from the same SVG geometry.
- Original perspective pavilion/plaza illustration, geometric mark, terrain backdrop, target and clock diagrams.
- Semantic HTML product previews for project activity, approvals, history, team activity, and standards; approval/rejection/reset controls change local preview state.
- No research screenshots, recorded reference videos, or proprietary CDN imagery are served by the application.

## Interactions and motion

- **Preloader:** 2.2-second percentage counter, line drawing, ruler, and curtain exit. Skipped after completion in the same browser session and under reduced motion.
- **Hero inspection:** SVG-local pointer coordinates account for aspect-ratio letterboxing. Bidirectional drags use bounding-box intersection; only intersected issue markers activate. Selection-gradient direction follows the drag. Touch users can tap markers or inspect all; keyboard users can focus markers and press Enter/Space.
- **Motion clock:** Lenis runs from GSAP's ticker and updates ScrollTrigger. Canvas cursor also uses that ticker; its callback detaches after the pointer settles. Pointer coordinates do not continuously update React state.
- **Cursor:** 9px square, velocity trail, pressed reticle, contrast change over dark surfaces. Hidden and inactive on coarse pointers and under reduced motion.
- **Model narrative:** reserved approximately seven viewport heights (`700dvh`) in total, including the pinned viewport. Four reversible phases reveal issues, change an actual SVG door swing, and show a learned standard. Direct phase buttons use Lenis's immediate scroll API.
- **Dashboard sequence:** approximately five viewport heights in total, with five reversible panels and feature navigation.
- **Ink reveal:** SVG turbulence, displacement, blur, and contrast shape a scroll-driven mask between perfectly aligned sketch and render geometry. Its final timing was adjusted so the artwork is visible during the transition.
- **Footer lens:** 160 CSS-pixel reveal radius, smoothed mask center and secondary ring, entrance expansion, exit collapse. Touch/reduced-motion users receive a static visible wordmark.
- **Page transitions:** coordinated outgoing/incoming GSAP curtain on the primary Home/Dashboard links; normal Next.js navigation for section-anchor links.
- Mobile and reduced-motion layouts expose the narratives as normal stacked content without scroll pinning. Reduced motion disables cursor trails and decorative transition motion.
- GSAP contexts, media-query contexts, ticker callbacks, Lenis instances, and DOM listeners have cleanup. Route tests confirm that pin wrappers do not accumulate.

## Validation and fixes

| Check | Actual result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | Passed | `artifacts/typecheck.log` |
| `npm run lint` | Passed, no errors or warnings | `artifacts/lint.log` |
| `npm run build` | Passed; both requested routes statically prerendered | `artifacts/build.log` |
| Playwright against development server | 18 passed | `artifacts/playwright-dev.log` |
| Playwright against production server | 18 passed in 29.3s | `artifacts/playwright-production.log` |
| Browser errors | No page errors in tested routes/viewports | `artifacts/browser-errors.json`, Playwright viewport tests |
| Horizontal overflow | None at all four required sizes on both routes | `artifacts/visual-findings.json` |
| Runtime dependency audit | 0 vulnerabilities with `npm audit --omit=dev` | Audit executed during implementation |
| Full dependency audit | 5 high-severity development-only dependency findings remain | `artifacts/npm-audit.json`; details below |

The test suite covers reversed selection math and letterboxing; both routes at 1440×900, 1920×1080, 390×844, and 1440×700; pointer selection; keyboard inspection; platform keyboard tabs; use-case toggling; forward/reverse phase changes and door geometry; route transitions and pin teardown; all-feature navigation; approve/reject/reset; keyboard FAQ behavior; footer lens movement and exit; reduced motion; touch navigation; modal Escape; and one-time preloader completion.

Failures discovered and fixed during validation:

1. Dashboard FAQ columns plus their gap created a two-pixel horizontal overflow.
2. A hidden desktop line break removed a needed space in the mobile hero headline.
3. React development effect replay prematurely marked the preloader complete; session state is now recorded only after completion.
4. Direct native scroll calls competed with Lenis; phase controls now use the shared Lenis instance.
5. Pin spacing added during hydration shifted early navigation destinations; CSS now reserves the complete scroll tracks before hydration.
6. Phase-button destinations initially landed partway through a fade; they now land in the settled portion of each phase.
7. A dashboard metric preview extended beyond its clipping container; the inset and width were corrected.
8. The first terrain treatment reused the elevation; it was replaced with original terrain artwork for the dashboard composition.
9. Final typography was adjusted toward the measured heading size and tracking.
10. The ink-mask scroll range was refined after visual review to keep the transition on screen.

After the last ink-timing-only adjustment, the production build, TypeScript, and lint passed again, and the interaction capture script was rerun against the rebuilt production server. The full 18-test production run immediately precedes that timing-only adjustment.

## Visual review and evidence

The local inventory, design tokens, layout/typography/responsive documentation, interaction specification, animation guidance, asset recreation guide, fidelity checklist, all three supplied contact sheets, individual captures, and sampled frames from all six reference recordings informed the implementation. The live homepage was consulted narrowly to resolve the inconsistent hero references; research was not repeated wholesale.

`artifacts/reference-review/` contains six sampled recording contact sheets, separate from the original research. `artifacts/screenshots/` contains 50 PNG captures, including initial-pass evidence, final viewport captures, major desktop/mobile sections, all four workflow phases, all five dashboard features, inspection markers, ink states, expanded FAQ, and footer lens. Initial/debug captures are clearly named and are not the final comparison baselines.

Final comparison artifacts:

- `artifacts/comparisons/home-implementation-contact-sheet.jpg`
- `artifacts/comparisons/dashboard-implementation-contact-sheet.jpg`
- `artifacts/comparisons/reference-vs-implementation.jpg`
- `artifacts/interaction-video/`: browser-recorded walkthroughs of the implemented state changes.

Actual visual inspection covered hero framing at all four required viewport sizes; desktop/mobile editorial sections, product previews, workflows, use cases, FAQ, CTA and footer; and settled interaction states. Side-by-side comparisons were reviewed visually, not scored only by image similarity.

## Remaining visual differences and limitations

- The supplied package is internally inconsistent. Several files labelled hero/intro/problem show the preloader. A recording shows the completed homepage as a large elevation above a bottom caption, contrary to the written side-by-side floor-plan hero. The implementation follows the completed recording for this composition.
- The reference captures use a noticeably lighter paper appearance than the measured `#e0e0da` token. This implementation retains the explicit measured token.
- The written specification requests a dark preloader and footer, while recordings show light versions. This implementation follows the dark written treatment for those surfaces. The CTA remains a light drawing sheet, following the captures.
- Original vectors preserve the architectural subject matter and proportions, but do not reproduce the source's textured/photorealistic building, landscape, mountains, or exact geometry. The pavilion's decorative forms stay neutral under the brief's rule restricting red to alerts. The geometric mark and illustrative practice identities are original substitutes.
- Inter is an approved open-source substitute; its letterforms and some line wraps differ from BT Grotesk.
- The dashboard feature heading remains above the pinned feature controls throughout the sequence; in some reference captures it has scrolled away. Panel pacing, the three-step section height, and some section spacing are approximations.
- The four workflow phases are substantive and reversible, but their timing and explanatory copy are reconstructed; the recordings do not provide an unambiguous complete state-by-state target. The Why Heron section additionally uses click-controlled disclosure panels.
- Platform tabs change the original drawing presentation and viewport label; they are not full reconstructions of four proprietary software interfaces.
- Approval decisions, example project statistics, team entries, and standards are illustrative client state. They do not edit a model or persist across reloads.
- A newsletter submission, legal-policy replicas, cookie banner, and out-of-scope site routes were not added. There are no tracking cookies or submission service to support those flows.
- Testing used Chromium, including touch emulation. Safari/WebKit, Firefox, physical mobile devices, screen-reader usage, formal WCAG auditing, measured 60fps, and heap-leak profiling were not performed. Listener cleanup and repeated navigation were checked in code and browser tests; that is not a proof of zero memory leaks.
- Full audit flags `braces <=3.0.3` and its four dependent packages through Next's ESLint toolchain. The registry's latest `braces` was still 3.0.3. The suggested automatic remedy downgraded Next's lint configuration to a different major version, so it was not applied. These findings are in development tooling; the production-only audit is clean. Recheck upstream before processing untrusted glob patterns or updating the toolchain.
- The in-app visible browser was unavailable. Real-browser screenshots, video, and interaction tests used the installed Playwright Chromium instead.

## Run locally

```sh
npm ci
npm run dev
```

Open the Local URL printed in the terminal. During implementation the existing development server used `http://localhost:3002` because port 3000 was occupied.

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

For production preview:

```sh
npm run start -- --port 3011
TEST_BASE_URL=http://localhost:3011 npm test
TEST_BASE_URL=http://localhost:3011 node scripts/visual-review.mjs
TEST_BASE_URL=http://localhost:3011 node scripts/capture-states.mjs
```

No deployment or repository commit was performed.
