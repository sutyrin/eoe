# v1.1 Research Summary: Mobile Sync + LLM Integration

**Project:** Engines of Experience v1.1
**Domain:** Creative coding workflow with distributed sync and AI assistance
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

v1.1 adds two historically brittle capabilities to the proven v1.0 system: mobile-first workflow with P2P sync, and LLM-assisted sketch variation generation. Research reveals these are not "add a library and ship" features — they require architectural discipline to avoid data loss, cost explosions, and battery drain.

**The core recommendation:** Hybrid sync architecture where Syncthing handles desktop/server file movement (proven P2P, block-level efficiency), PouchDB/CouchDB manages mobile metadata (offline-first, battle-tested), and a bridge daemon reconciles the two worlds. LLM invocations run server-side with aggressive prompt caching (90% cost reduction), DeepSeek fallback for simple variations, and hard budget caps to prevent runaway spending. Mobile workflow focuses on ideation and variation exploration — not full code editing — with manual sync triggers and selective asset downloading to preserve battery and bandwidth.

**Critical risks and mitigations:** Last-write-wins data loss (use CRDTs for structured data, explicit conflict UI for code), video sync bandwidth explosion (selective sync by device type, Wi-Fi-only for large files), LLM cost explosion (20 requests/month free tier, prompt optimization, semantic caching), sync loops (event source tagging, causal tracking, circuit breakers), mobile storage exhaustion (metadata-only default, LRU eviction, storage monitoring), battery drain (manual sync default, exponential backoff, push notifications instead of polling), prompt injection (input sanitization, output validation, sandboxed execution), offline edits lost (transactional sync, optimistic UI with pessimistic persistence), binary merge conflicts (content-addressable storage for assets), and mobile OS background restrictions (realistic expectations, foreground sync while app open).

## Key Findings

### Recommended Stack

**The hybrid sync strategy solves the fundamental tension:** desktops need version control (Git), mobile needs offline-first databases (PouchDB), and both need real-time file propagation (Syncthing). Trying to force one solution (Git LFS on mobile, or PouchDB everywhere) creates complexity that research shows leads to production failures.

**Core technologies:**

- **Syncthing v1.x** (desktop/server sync) — Open-source P2P file sync with block-level transfer, built-in encryption, and no licensing costs. Handles atom directories, videos, source code. Wins over Resilio Sync (proprietary, licensing) and Dropbox API (rate limits, vendor lock-in). Proven in production for 10+ years, active community, extensive documentation.

- **PouchDB + CouchDB** (mobile/server sync) — Offline-first database with automatic replication, revision-based conflict detection, and native browser support (IndexedDB). Syncs atom metadata, NOTES.md content, config parameters (not videos or source code). Wins over file-based mobile sync (iOS PWA filesystem access limitations) and custom sync protocol (years of development, CRDT complexity). Battle-tested since 2012.

- **Claude API (Sonnet 4.5 primary)** — Server-side LLM invocations for sketch variation generation with 200K token context window and 90% cost reduction via prompt caching. Pricing: Sonnet 4.5 at $3 input / $15 output per million tokens (balanced), Haiku 4.5 at $1 input / $5 output per million tokens (simple variations). Wins over client-side invocation (API key exposure, no cost control) and Ollama-only approach (quality gap on creative coding, setup complexity). DeepSeek fallback ($0.48/1M tokens) for cost-sensitive operations.

- **SQLite (sync metadata)** — Device-local database tracking file hashes, sync timestamps, conflict state, and publishing status. Schema includes devices table (registry), file_sync_state (per-file hashes), atom_metadata (publishing URLs), conflicts log, and sync_events (observability). Separate database per device avoids sync complexity. Lightweight, single-file, crash-safe with WAL mode.

- **Node.js + chokidar** (filesystem watcher) — Desktop/server daemon that detects Syncthing file changes, updates SQLite metadata, identifies conflicts, and triggers notifications. Not always-running (on-demand activation), minimal resource footprint. Integrates via new CLI commands (eoe sync, eoe ai).

**Version-specific requirements:**
- Syncthing: v1.x minimum (stable block exchange protocol)
- PouchDB: v9.0.0+ (modern IndexedDB adapter)
- Claude API: Sonnet 4.5 model (1M context in beta, 200K production)
- SQLite: better-sqlite3 v9.x (Node.js binding with WAL support)
- Node.js: v20 LTS minimum (async/await, top-level await)

### Expected Features

**Mobile workflow is fundamentally different from desktop:** research shows p5.js sketches run at ~30 FPS on modern phones (acceptable for preview), but code editing on mobile is painful (keyboard friction, screen real estate). The proven pattern is ideation capture (voice notes, parameter tweaks, variation selection) on mobile, with refinement on desktop.

**Must have (table stakes for v1.1):**

- **Atom viewing in mobile browser** — Portfolio site already responsive, verify touch-friendly controls (lil-gui supports touch, validate hit targets). Offline viewing via service worker cache. Users expect to review work anywhere.

- **Desktop/server Syncthing sync** — File-based P2P sync for atoms/, videos/masters/, .planning/. Selective sync rules exclude videos/encoded/, node_modules/, dist/. Conflict resolution via manual review (.sync-conflict files). Users need multi-device workflow.

- **Parameter variation generation** — LLM reads config.json, generates 5 variations with different values (bgHue, rotationSpeed, etc.). Stored as Git branches (variations/v1, variations/v2, variations/v3). User reviews via git checkout, merges favorite. Users expect AI assistance for exploration.

- **Mobile sync via PouchDB/CouchDB** — Metadata-only sync (atom titles, dates, stages, NOTES.md content, thumbnails). Manual sync trigger (not continuous background). Last-write-wins with timestamp tiebreaker for config conflicts, explicit resolution UI for code. Users need mobile note-taking and curation.

- **LLM cost controls** — Hard budget limits (20 variations/month free, $5/month paid tier), prompt optimization (2K token input cap), semantic caching (73% cost reduction on repeated requests), rate limiting (5 variations/hour per user). Users need protection from surprise bills.

**Should have (competitive differentiators):**

- **Color scheme variations** — LLM generates 5 palettes (complementary, triadic, analogous, monochrome, random) from current sketch. Side-by-side gallery view for comparison. High confidence: color theory is well-documented, LLM can apply principles.

- **Voice note integration** — Capture ideas during commute, transcribe to NOTES.md, optionally scaffold atom from description. Medium confidence: transcription quality varies, scaffolding needs validation.

- **Publishing queue (metadata entry on mobile)** — User fills title/description/tags on phone, queues publish request, desktop executes YouTube upload. LLM-assisted metadata generation. Users want to utilize commute time productively.

- **Variation rating/promotion** — Star favorite variations, promote to main atom, regenerate based on feedback (--like=var2 --avoid=var5). Users need curation tools for exploration.

**Defer (v2+):**

- **Algorithm variations** — Structurally different code approaches (grid vs. spiral vs. noise). Medium confidence: LLM code generation quality varies, needs extensive validation. Complexity high, defer until parameter variations proven.

- **Native mobile app** — PWA sufficient for v1.1, defer native until user demand validated. Avoids app store friction, development overhead, platform lock-in.

- **Direct mobile video upload** — Phone storage/battery/bandwidth constraints make this impractical. Queue-based workflow is realistic. Defer until user requests justify complexity.

- **Ollama local LLM** — Quality gap vs. Claude for creative coding, setup complexity (GPU, Docker, 5-10GB models). Break-even at ~10K generations (unrealistic for solo dev). Defer until privacy/offline requests justify.

### Architecture Approach

**Integration strategy is orthogonal and additive:** sync and LLM are independent features, both integrate via CLI surface (eoe sync, eoe ai), both store state outside repo (~/.eoe/), both are opt-in (user must run init to activate), and both leverage existing infrastructure (Git for version control, filesystem for file storage). Zero changes to v1.0 atom structure, CLI commands, build pipeline, or publishing workflow.

**The hybrid source of truth model eliminates complexity:** Git remains authoritative for code/config/docs (text files merge cleanly), Syncthing handles real-time file propagation (binary assets, build artifacts), and SQLite tracks device-local metadata (sync state, publishing status). Separation prevents sync complexity from polluting Git history and enables independent failure recovery (delete SQLite, re-initialize from filesystem).

**Major components:**

1. **Sync daemon (desktop/server only)** — Node.js process with chokidar filesystem watcher. Detects Syncthing file changes, updates SQLite (file hashes, timestamps, conflict state), identifies .sync-conflict files, notifies user via eoe sync status. Not always-running (on-demand activation), minimal resource footprint. CLI commands: eoe sync status, eoe sync resolve, eoe sync init.

2. **LLM client (desktop CLI-triggered)** — Anthropic SDK wrapper with prompt caching, semantic caching, model routing (Haiku for simple, Sonnet for complex), cost tracking (~/.eoe/llm-costs.json), and Git branch storage for variations. Context window capped at 20K tokens input (prevents runaway costs). CLI commands: eoe ai sketch, eoe ai variations, eoe ai caption, eoe ai explain.

3. **Mobile PWA (future Phase 6+)** — Astro portfolio becomes offline-capable PWA. PouchDB stores atom metadata locally (IndexedDB), syncs to CouchDB on server when online. Manual sync trigger (not background). Selective download for videos (opt-in, not default). Deferred to Phase 6+ until core sync proven.

4. **File watcher → CouchDB bridge (server)** — Node.js daemon watches atoms/ directory (Syncthing syncs here from desktops), parses atom metadata (NOTES.md, config.json), updates CouchDB when files change. Bridges file-based desktop workflow with database-based mobile workflow. Single source of truth: files on server, CouchDB mirrors metadata.

**Data flow:** Mobile edits metadata → PouchDB (local) → CouchDB (server) → Bridge daemon detects change → Updates files → Syncthing propagates to desktop. Desktop creates atom → Git commit → Syncthing syncs to server → Bridge daemon extracts metadata → CouchDB updates → PouchDB replicates to mobile. Conflicts detected via content hashing (not timestamps), resolved via explicit UI (no silent overwrites).

### Critical Pitfalls

Research identified 10 production failure modes observed in real systems (Syncthing conflicts, AWS Lambda recursion bills, mobile data loss). Top 5 by severity:

1. **Last-write-wins data loss** — Timestamp-based conflict resolution silently overwrites concurrent edits. Prevention: CRDT-based merge for config.json/NOTES.md (field-level preservation), explicit conflict UI for sketch.js (user chooses version), content-addressable storage for videos (both versions coexist with hash-based names). Detected via user reports of "my changes disappeared" or .sync-conflict files appearing. Phase 1 must implement CRDT layer before multi-device testing.

2. **Video sync bandwidth explosion** — 2.4GB of video files syncing to mobile on cellular incurs $50 overage or throttling. Prevention: Selective sync by device type (desktop syncs everything, mobile syncs metadata + code only), Wi-Fi-only enforcement for files >10MB, progressive download (stream from server, download only on explicit user request), bandwidth monitoring with user prompts ("23 videos, 1.2GB, download on Wi-Fi?"). Phase 1 implements selective sync, Phase 3 adds mobile controls.

3. **LLM cost explosion** — 50 variation requests × 15K tokens × $0.015/1K = $225/month runaway spending. Prevention: Hard budget limits (20 variations/month free tier), prompt optimization (2K token input cap, strip comments/whitespace), semantic caching (LangCache 73% cost reduction), model routing (70% of requests use Haiku at $0.25/1M instead of Sonnet at $3/1M), rate limiting (5 requests/hour), circuit breaker (pause at $10/hour spike). Phase 4 implements routing and caching, Phase 5 adds budget dashboards.

4. **Sync loop (infinite recursion)** — Desktop syncs atom → Server triggers LLM variation → Variation syncs to desktop → Desktop detects "new file" → Triggers local variation → Loop until rate limit/budget exhausted. AWS Lambda recursive loops cost thousands before detection added (stops after ~16 cycles). Prevention: Event source tagging (user/sync/llm/build origins), causal context tracking (generation counter, max depth 5), breadcrumb trails (UUID-based visited set), rate limiting across stack (10 variations per atom lifetime), circuit breakers (pause at >50 files/minute). Phase 1 implements event tagging, Phase 4 adds generation limits.

5. **Mobile storage exhaustion** — 50 atoms × 240MB video each = 12GB download on 64GB phone with 45GB used. iOS kills app, corrupts IndexedDB. Prevention: Storage quota monitoring (navigator.storage.estimate() before sync), selective sync enforcement (metadata-only default, user opt-in for videos), progressive eviction (LRU cache, delete oldest videos when <500MB free), compression (gzip source code 60-70%, WebP thumbnails 30-50% smaller), graceful degradation (in-memory cache if quota exceeded, warn user). Phase 3 implements monitoring and eviction.

**Additional critical pitfalls:** Battery drain from background sync (manual sync default, exponential backoff, push notifications instead of polling), prompt injection (input sanitization, output validation, sandboxed iframe execution), offline edits lost during network partition (transactional sync, optimistic UI with pessimistic queue persistence), binary merge conflicts (content-addressable storage, Git LFS with custom merge driver), mobile OS background task restrictions (realistic expectations, foreground sync while app open, BGAppRefreshTask ~1/hour).

## Implications for Roadmap

Research suggests 3-phase delivery for v1.1, prioritizing sync foundation (avoids data loss pitfalls) before LLM integration (cost control easier once sync proven). Phase ordering prevents dependency conflicts and allows iterative validation.

### Phase 4: Mobile Sync Foundation

**Rationale:** Establishes data sync infrastructure before adding LLM complexity. Desktop/server Syncthing sync validates hybrid model without mobile constraints. CouchDB setup provides future mobile backend. Testing conflict resolution early prevents data loss in later phases.

**Delivers:**
- Desktop ↔ Server Syncthing P2P sync (atoms/, videos/masters/, .planning/)
- Selective sync rules (.stignore for videos/encoded/, node_modules/, dist/)
- CouchDB installation on server (database ready for mobile)
- File watcher → CouchDB bridge daemon (syncs atom metadata to database)
- CLI command: eoe sync status (shows sync health, device list, conflicts)
- CLI command: eoe sync resolve (interactive conflict resolution)
- Conflict detection via content hashing (not timestamps)
- SQLite metadata database schema (~/.eoe/sync.db)

**Addresses features:**
- Desktop/server sync (table stakes)
- Atom metadata in CouchDB (enables future mobile sync)

**Avoids pitfalls:**
- Last-write-wins data loss (content hashing detects true conflicts)
- Sync loop (event source tagging implemented)
- Binary merge conflicts (content-addressable storage for videos)

**Duration estimate:** 2-3 weeks

**Research flags:** Standard Syncthing patterns, skip research-phase. Official docs comprehensive, active community. Minor unknowns in file watcher → CouchDB bridge (custom code, not off-the-shelf).

### Phase 5: Mobile PWA Sync

**Rationale:** Builds on Phase 4's proven sync infrastructure. Mobile-only constraints (battery, bandwidth, storage) tested in isolation before LLM added. Validates selective sync and manual triggers before complex features.

**Delivers:**
- Mobile PWA with PouchDB + CouchDB replication (metadata-only sync)
- Atom list view (thumbnails, titles, stages, offline-capable)
- NOTES.md editor (markdown, syncs to CouchDB)
- Manual sync trigger (prominent "Sync now" button)
- Offline indicator (shows last sync time, pending changes)
- Selective sync enforcement (videos opt-in, not default)
- Storage quota monitoring (navigator.storage.estimate())
- Testing on iOS Safari + Android Chrome

**Addresses features:**
- Mobile sync (table stakes)
- Mobile note editing (table stakes)
- Atom viewing in mobile browser (table stakes)

**Avoids pitfalls:**
- Video bandwidth explosion (metadata-only default)
- Mobile storage exhaustion (storage monitoring, selective sync)
- Battery drain (manual sync, no background polling)
- Mobile OS background restrictions (foreground sync while app open)

**Duration estimate:** 3-4 weeks

**Research flags:** Needs research-phase for iOS PWA limitations and IndexedDB quota handling (documented but nuanced). PouchDB/CouchDB sync patterns are standard, but mobile-specific constraints need validation.

### Phase 6: LLM Variation Generation

**Rationale:** Sync proven in Phases 4-5, so LLM-generated variations can safely propagate across devices. Cost control mechanisms validated before user-facing features. Server-side invocation architecture prevents API key exposure.

**Delivers:**
- Express server with /api/llm/variation endpoint (Anthropic SDK integration)
- Prompt caching (90% cost reduction on p5.js docs context)
- Rate limiting (20 requests/hour per user via express-rate-limit)
- Budget tracking (SQLite database, monthly $10 cap)
- CLI command: eoe ai variations (generates parameter/color variations)
- CLI command: eoe ai caption (generates YouTube metadata)
- Git branch storage (variations/v1, variations/v2, variations/v3)
- Code validation (syntax check, API reference check)
- Cost monitoring dashboard (eoe ai costs shows spending)

**Addresses features:**
- Parameter variation generation (table stakes)
- Color scheme variations (differentiator)
- Publishing metadata generation (differentiator)

**Avoids pitfalls:**
- LLM cost explosion (budget limits, prompt optimization, semantic caching)
- Prompt injection (input sanitization, output validation)
- Sync loop (LLM-generated files tagged, max 5 variations per atom)

**Duration estimate:** 3-4 weeks

**Research flags:** Standard Claude API integration, skip research-phase. Prompt engineering for p5.js variations needs experimentation (not research). Cost control patterns well-documented.

**Dependencies:**
- Phase 4 complete (variations must sync across devices)
- Phase 5 optional (LLM works without mobile, but mobile can review variations)

### Phase Ordering Rationale

**Why sync before LLM:**
1. Sync is foundation — LLM-generated variations need multi-device propagation
2. Sync pitfalls cause data loss (unrecoverable) — LLM pitfalls cause cost overruns (recoverable)
3. Sync testing requires multiple devices (time-consuming) — LLM testing is desktop-only (faster iteration)
4. Sync conflicts rare but catastrophic — LLM errors frequent but fixable
5. User can use desktop sync without LLM (standalone value) — LLM without sync is weaker (variations don't propagate)

**Why desktop/server sync before mobile sync:**
1. Validates hybrid model (Git + Syncthing + SQLite) without mobile constraints
2. Conflict resolution patterns proven on desktop (manual review, Git merge tools) before adapting to mobile (limited UI)
3. Desktop-only allows fast iteration (no app store, no device testing matrix)
4. Server infrastructure (CouchDB, bridge daemon) tested with desktop before mobile introduced

**How this avoids pitfalls:**
- Phase 4 addresses top 3 data loss pitfalls (last-write-wins, sync loop, binary conflicts) before user-facing features
- Phase 5 addresses mobile-specific pitfalls (bandwidth, storage, battery) in isolation
- Phase 6 addresses cost pitfalls (LLM explosion) with proven sync infrastructure underneath
- Sequential delivery prevents cascading failures (sync + LLM bugs compounding)

### Research Flags

**Phases needing research-phase during planning:**

- **Phase 5 (Mobile PWA Sync):** iOS PWA limitations are well-documented but nuanced. Research needed for IndexedDB quota handling (varies by browser/OS version), service worker lifecycle (iOS restrictions on background sync), and PouchDB performance on mobile (large datasets, battery impact). Estimated 2-4 hours research.

**Phases with standard patterns (skip research-phase):**

- **Phase 4 (Desktop/Server Sync):** Syncthing patterns well-documented, official docs comprehensive, active community. File watcher + SQLite patterns standard. Estimated 0 hours research (use current research).

- **Phase 6 (LLM Integration):** Claude API integration standard, prompt caching documented, cost control patterns established. Prompt engineering for p5.js variations needs experimentation (not research). Estimated 0 hours research (use current research).

**Additional research needed during implementation:**

- **Prompt templates for variation types:** Not research, but trial-and-error iteration. Budget 1 week for prompt engineering experiments (generate, review, refine).

- **Mobile performance benchmarks:** Test p5.js sketch FPS on target devices (iPhone 15, Pixel 8, older phones). Budget 2-3 days for device testing matrix.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Syncthing architecture** | HIGH | Production-proven (10+ years), extensive documentation, active community. Official docs + real-world case studies validate block-level sync, conflict handling, and P2P architecture. |
| **PouchDB/CouchDB sync** | HIGH | Battle-tested since 2012, designed for offline-first, official docs comprehensive. Revision-based conflict detection is proven pattern. IndexedDB performance on mobile validated by community. |
| **iOS PWA limitations** | HIGH | Well-documented restrictions (background sync, filesystem access, cache limits) consistent across sources. Apple's official guidelines + community reports align. |
| **Claude API pricing/features** | HIGH | Official Anthropic documentation, verified 2026 rates. Prompt caching feature GA (not beta). Rate limits and context windows confirmed. |
| **Prompt caching cost reduction** | MEDIUM | Official feature with documented savings (90% reduction), but actual savings depend on usage patterns (cache hit rate, prompt structure). Research shows 73-90% range in production. |
| **LLM code generation quality** | MEDIUM | Research (Pail IDE study) shows p5.js well-represented in training data, but variation quality varies by prompt. Needs experimentation to validate scaffolding accuracy. |
| **Cost control efficacy** | MEDIUM | Patterns proven (rate limiting, budget caps, semantic caching) but edge cases exist (malicious users, bugs). Multi-layer defense reduces risk but doesn't eliminate. |
| **Conflict resolution UX** | LOW | User behavior unpredictable in conflict scenarios. Research shows patterns (three-way merge, last-write-wins, CRDT) but actual user tolerance/comprehension needs validation. Manual resolution burden unknown. |

**Overall confidence:** HIGH for technology choices and architecture patterns, MEDIUM for cost/quality predictions, LOW for user behavior assumptions.

### Gaps to Address

**During Phase 4 planning:**
- **File watcher → CouchDB bridge implementation:** No off-the-shelf tool found. Custom Node.js code required. Plan for edge cases: partial file writes, rapid file changes (debouncing), CouchDB connection failures. Validate during implementation with stress testing (1000 file changes/minute).

**During Phase 5 planning:**
- **iOS PWA cache limits:** 50MB Cache Storage limit documented, but actual eviction behavior varies by iOS version. Validate with real device testing (fill cache, background app, check persistence). Plan fallback: warn user when approaching limit, offer "clear cache" option.

**During Phase 6 planning:**
- **Prompt templates effectiveness:** Research shows p5.js in LLM training data, but optimal prompt structure for variations unknown. Plan experimentation budget (1 week) to iterate on templates. Success metric: >60% of variations rated "worth exploring" by user.

**During implementation (all phases):**
- **Conflict resolution UX validation:** User testing needed to validate "choose version" UI vs. "auto-merge with notification" approaches. Plan usability study (5-10 users, simulate conflicts, observe resolution behavior). Adjust conflict strategy based on findings.

- **Cost model validation:** LLM spending predictions assume 70% cheap model routing, 30% cache hit rate. Track actual usage during beta, adjust budget limits if predictions off by >20%. Plan monitoring dashboard for real-time cost tracking.

## Sources

### Primary (HIGH confidence)

**Syncthing / Sync Architecture:**
- [Syncthing Official Documentation](https://docs.syncthing.net/users/syncing.html) — Block Exchange Protocol, conflict handling, versioning
- [Syncthing vs Resilio Sync Comparison](https://stackshare.io/stackups/resilio-vs-syncthing/) — Feature comparison, cost analysis
- [Block Exchange Protocol v1](https://docs.syncthing.net/specs/bep-v1.html) — Technical specification, checksum verification
- [Syncthing Battery Optimization (Android)](https://github.com/Catfriend1/syncthing-android/blob/main/wiki/Info-on-battery-optimization-and-settings-affecting-battery-usage.md) — Battery impact analysis

**PouchDB / CouchDB:**
- [PouchDB Official Site](https://pouchdb.com/) — Offline-first design principles, replication protocol
- [PouchDB/CouchDB Tutorial](https://terreii.github.io/use-pouchdb/docs/introduction/pouchdb_couchdb) — Integration patterns, conflict resolution
- [SQLite Sync Conflict Resolution](https://www.sqliteforum.com/p/building-offline-first-applications) — Offline-first schema patterns
- [PWA on iOS Limitations](https://brainhub.eu/library/pwa-on-ios) — Background sync restrictions, cache limits

**LLM Integration:**
- [Anthropic Claude API Pricing 2026](https://platform.claude.com/docs/en/about-claude/pricing) — Official pricing, prompt caching costs
- [Claude API Rate Limits](https://platform.claude.com/docs/en/api/rate-limits) — Token bucket algorithm, tier limits
- [Prompt Caching Cost Reduction (ngrok)](https://ngrok.com/blog/prompt-caching/) — 90% cost reduction case study
- [Semantic Caching vs Prompt Caching (Redis)](https://redis.io/blog/prompt-caching-vs-semantic-caching/) — Caching strategy comparison
- [OWASP LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) — Security best practices

**Mobile Architecture:**
- [Offline-First Architecture: Designing for Reality](https://medium.com/@jusuftopic/offline-first-architecture-designing-for-reality-not-just-the-cloud-e5fd18e50a79) — Offline-first principles
- [The Complete Guide to Offline-First Architecture in Android](https://www.droidcon.com/2025/12/16/the-complete-guide-to-offline-first-architecture-in-android/) — Mobile patterns
- [Background optimization - Android](https://developer.android.com/topic/performance/background-optimization) — Battery, task restrictions

### Secondary (MEDIUM confidence)

**p5.js Performance:**
- [Optimizing p5.js Code for Performance](https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance) — Mobile performance, canvas size impact
- [p5.js mobile performance issues](https://github.com/processing/p5.js/issues/4469) — Community reports of 30 FPS ceiling

**LLM Code Quality:**
- [Pail: LLM-Supported p5.js IDE](https://dl.acm.org/doi/10.1145/3706598.3714154) — Research showing p5.js in training data
- [Claude Code + Ollama Comparison](https://blog.codeminer42.com/claude-code-ollama-stress-testing-opus-4-5-vs-glm-4-7/) — Quality benchmarks

**Cost Control:**
- [LLM Pricing Comparison 2026](https://pricepertoken.com/) — Cross-model pricing
- [LLM Context Management Guide](https://eval.16x.engineer/blog/llm-context-management-guide) — Context optimization strategies

### Tertiary (LOW confidence, needs validation)

**Voice Note Workflows:**
- [Voice note creative workflow 2026](https://www.kimklassen.com/blog/voice-note-idea-workflow) — Ideation capture patterns (blog post, not peer-reviewed)
- [Wispr Flow AI voice keyboard](https://wisprflow.ai/post/best-voice-typing-app-android) — Transcription quality claims (vendor site)

**Conflict Resolution UX:**
- [Offline vs. Real-Time Sync: Managing Data Conflicts](https://www.adalo.com/posts/offline-vs-real-time-sync-managing-data-conflicts) — Conflict strategy patterns (vendor blog)

---

**Research completed:** 2026-01-31
**Ready for roadmap:** Yes

**Recommended next step:** Proceed to roadmap creation with 3-phase structure (Phase 4: Desktop/Server Sync, Phase 5: Mobile PWA, Phase 6: LLM Variations). Phase 4 can start immediately (high confidence, standard patterns). Phase 5 needs minor research-phase for iOS PWA validation (2-4 hours). Phase 6 needs prompt template experimentation (1 week, not research).
