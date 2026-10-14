# Motion gap audit — Phase 1.5

Evidence reviewed: all six supplied 1440×900 recordings, tighter half-second workflow/dashboard filmstrips, both previous local walkthroughs, local animation/interaction specifications, and the [developer case study](https://tympanus.net/codrops/2026/10/12/heron-ai/).

**Evidence limit:** recording 03 spends most of its duration in the preloader and ends on a bare floor plan; it does not capture all four phases. Recording 05 captures One View, not all five features. They cannot establish exact timings for the missing stages. Fixes there reconstruct the documented behavior and requested narrative with our existing original geometry. The six source videos remain untouched.

| Section | Reference behavior | Current behavior | Gap | Priority | Planned fix |
| --- | --- | --- | --- | --- | --- |
| Preloader / hero | Drawing grows across the sheet; horizontal ruler; coordinated reveal | Uniform dash treatment, hero already complete behind veil | No handoff or internal entrance | P1 | Draw structural paths in sequence, extend dimensions, reveal material and caption in coordination with veil |
| Hero inspection | Direct pointer selection with anchored annotations | Correct coordinate mapping and selection | Preserve accuracy; entrance must end at exact original coordinates | P1 | Animate drawing layers only during entry, preserve pointer mapping |
| Introduction / problems | Technical editorial language documented; recordings do not show complete section motion | Static diagrams and text | No explanation through motion | P2 | Scroll-controlled text clipping and distinct drawing, separation, targeting, and clock actions; reconstructed timing |
| Model workflow | Case study explicitly describes one persistent model, violation, suggestion, action | Scan line, fading text, small door edit | Little visual continuity between detection and resolution | P0 | Scan reveals layers; frame and leader detect door; reticle moves to edit; door and clearance transform; standards route develops on same drawing |
| Platforms / Why / products | Viewport changes documented; exact layer timing unavailable | CSS transform or instantaneous art replacement | Abrupt context changes | P1 | Persistent art layers, coordinated dimensions and overlay transitions, independent preview-layer entry |
| Dashboard One View | Nested project windows visibly stack in recording 05 | Fixed stack behind a fading panel | Stack has no assembly | P0 | Fan windows from common origin, then reveal metrics and activity rows |
| Approval Queue | Approval UI documented and captured in stills | Static drawing and approval card | No incoming request or model correspondence | P0 | Trace dimensions, open issue area, slide request and reveal detail; retain user-controlled decisions |
| Full History | Timestamped change trail documented | Static list over plan | No temporal development | P0 | Grow timeline spine; reveal events and model door correction in order |
| Team View | Shared decisions documented | Static roster over elevation | No relationship between people and activity | P0 | Connect roster entries; reveal status chips separately; trace associated building layers |
| Firm Standards | Rule application documented | Static fields | No visible application | P0 | Populate fields, propagate room labels through model, draw standard connections, reveal saved state |
| CTA ink | Case study provides displaced, softened mask; aligned sketch/render | Correct geometry; constant edge shape | Improve organic edge and visible range | P1 | Scrub mask plus displacement, tie range to artwork, inspect intermediate states |
| Cursor / footer | Direct pointer with interpolation; lens expansion and collapse | Matching core timing, idle ticker removal | No material motion gap found | P2 | Preserve; record and regression-check movement |
| Navigation | Recording 06 shows geometric reveal between routes | Working Next curtain and cleanup | No proven reason to replace | P2 | Preserve; verify history, cleanup and hero handoff |
| Mobile / reduced motion | Adapted non-pinned narratives specified | Entire scene frozen on narrow screens | Loses product demonstration | P1 | Touch phase controls on persistent model; short unpinned internal feature timelines; static readable reduced-motion states |

No layout redesign, new dependencies, perpetual loops, backend, or proprietary media. Existing interactions and tests remain in scope.

## Outcome

Implemented the planned scene work in the existing components and GSAP contexts. The workflow now has a connected scan → door detection → clearance edit → standards route; all five dashboard features have separate internal timelines. Hero/preloader handoff, platform/Why transitions, supporting diagrams, ink displacement and mobile controls were refined. Cursor, footer lens and Next.js routing were preserved after inspection.

Validation: production build, lint, TypeScript and all 29 Playwright tests pass. The final [motion gallery](artifacts/motion/index.html) includes controlled intermediate-state filmstrips and explicitly labelled reference/local video comparisons. See [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) for the final changes, evidence limits and untested environments.
