# Engines of Experience

## What This Is

A creative practice and publishing ecosystem for expanding horizons through making. Start with small atomic pieces — creative coding sketches, simple tunes, motion graphics — compose them upward into richer works and web-based playable contraptions, and distribute everything as content across YouTube, Reddit, TikTok, and a dedicated portfolio site. Built for short-burst workflows across desktop, laptop, and mobile, augmented by LLMs for both structural and creative work.

## Core Value

Consistent output of creative atoms that compound into a body of work, tools, and audience — producing results, not consuming time learning tools.

## Requirements

### Validated

- ✓ Atom creation workflow — make creative code, music, and motion pieces in short bursts (10-15 min to 1h) — v1.0
- ✓ Web-based playable contraptions — publish atoms as browser toys anyone can play with — v1.0
- ✓ Portfolio website — dedicated site to host all pieces and serve as home base — v1.0
- ✓ Content pipeline — produce YouTube videos from creative work via video capture — v1.0
- ✓ Multi-platform publishing — distribute to YouTube with manual workflow — v1.0
- ✓ CLI cockpit — terminal-based dashboard with create/dev/build/capture/publish commands — v1.0
- ✓ Publishing — manual workflow validated (pain points documented for v2 automation) — v1.0

### Active

- [ ] Multi-device sync — work seamlessly across desktop, laptop, and mobile (commute with headphones)
- [ ] Batch publishing automation — produce multiple videos from existing atoms
- [ ] LLM augmentation — lighter consoles for in-the-moment creative pair-creation
- [ ] Streaming capability — host live sessions with guests
- [ ] Community features — GitHub organization, Discord, teaching content
- [ ] Advanced creation — Three.js 3D, motion graphics, Blender integration

### Out of Scope

- End-to-end paid creative suites — building own tooling from explored atoms instead
- Native mobile apps — web-based approach, accessible from mobile browser
- Full social media management platform — cockpit is for personal use, not a SaaS product
- Premature automation — no building automation before manual process is proven painful
- Deep tooling rabbit holes — atoms and contraptions first, infrastructure only as needed

## Context

**Research foundation:** Comprehensive research on expanding horizons (research.md) covering cognitive benefits of cross-disciplinary learning, T-shaped development model, risks of over-specialization, and practical methods for broadening knowledge. This research provides the intellectual foundation and content angle for the practice.

**Creative domains:**
- Tech atoms: Creative coding (p5.js, shaders, generative art, Processing-style sketches)
- Media atoms: Music/audio (simple tunes, compositions) + motion/video (animated shapes, motion graphics)
- Composition: Tech + media cross-pollination, increasing complexity over time

**Audience tiers:**
- Creators: Artists and creative coders who use published tools/contraptions
- Consumers: Wider audience of listeners and viewers who enjoy the output
- Participants: Guests in live streams who perform and explain

**Content strategy:** Mix of three angles depending on the piece:
- Output: "Here's what I made" — performances, demos, finished pieces
- Process: "Here's how I made it" — tutorials, breakdowns, techniques
- Journey: "Here's what I'm learning" — growth, experiments, failures

**Work pattern:** Short bursts throughout the day. 1h max focused sessions, 10-15 min micro-sessions (including mobile commute with headphones). Must be able to pick up and put down without friction.

**Existing codebase:** Repository contains games/steppy-scroller (TypeScript, Vite, Playwright) and devvit/steppy-scroller (Reddit Devvit app). Prior work in game development and Reddit platform integration.

## Constraints

- **Workflow**: Short bursts (10-15 min to 1h max) — everything must support pick-up-and-resume
- **Multi-device**: Desktop, laptop, mobile — all synced, all functional
- **Tools**: Mainstream open source for best quality work AND educational content value
- **Infrastructure**: Linux server available for backend/sync/automation
- **Anti-pattern**: No tooling rabbit holes — if a tool takes longer to set up than to create an atom, it's wrong
- **Publishing**: Frictionless distribution — creation-to-published must be short path
- **LLM split**: GSD (Claude Code) for grounded structural work; lighter consoles (local or API, TBD) for in-the-moment creative pair-creation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-based contraptions (not native) | Widest reach, no install friction, works on all devices | — Pending |
| CLI cockpit (not web dashboard) | Fits developer workflow, scriptable, composable | — Pending |
| Open source tools | Quality + educational value + community contribution | — Pending |
| Start manual, automate later | Avoid premature optimization, learn real pain points first | — Pending |
| Build own tooling from atoms | Practice what you preach — the tools ARE the creative output | — Pending |

---
*Last updated: 2026-01-30 after v1.0 milestone completion*
