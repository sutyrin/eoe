# Pitfalls Research: Engines of Experience

## Critical Pitfalls

### 1. The Tooling Trap (THE PRIMARY RISK)

**What it is:** Getting sucked into endless learning, setup, configuration, and experimentation instead of producing actual creative output. This is the explicit anti-pattern identified by the user as the number one threat to this project.

**Warning signs:**
- Spending days/weeks researching "the perfect stack"
- Constant framework/tool switching before shipping anything
- More time in documentation than in creation
- Building elaborate development environments instead of simple prototypes
- "Just one more tutorial" syndrome before starting real work
- Obsessing over optimal workflows before establishing basic ones
- Collecting tools and resources without using them

**How it manifests in this project:**
- Researching audio production tools for weeks without creating a single track
- Building the perfect multi-platform publishing pipeline before having content to publish
- Setting up complex creative coding environments instead of making simple sketches
- Optimizing multi-device sync before establishing what needs syncing
- Learning every LLM integration pattern before solving a single real problem

**Prevention strategies:**
- **Start manual, automate pain points** (from project constraints) - Do it the hard way first, only automate when pain is felt
- **Output-first mentality** - Every tool/learning session must directly lead to shipped output within 24-48 hours
- **Time-box exploration** - 1 hour research max, then 4+ hours creation
- **"Ship or Skip" rule** - If a tool/technique doesn't lead to output this week, defer it
- **Track creation hours vs. setup hours** - Setup should never exceed 20% of total time
- **Embrace "good enough"** - Working prototype beats perfect plan
- **Weekly output quota** - Must ship something (sketch, track, post, code) every 7 days minimum

**Phase mapping:**
- **Phase 0 (Foundations):** Establish the bare minimum tooling - terminal, editor, git, one creative tool per domain
- **Phase 1 (Manual workflows):** Do everything manually, document what hurts
- **Phase 2+ (Automation):** Only then build automation based on real pain

---

### 2. Scope Creep and Burnout Spiral (Solo Developer Death Trap)

**What it is:** For solo developers, [scope creep leads to burnout, and burnout leads to project failure](https://www.wayline.io/blog/scope-creep-solo-indie-game-development). When scope spirals out of control, you work longer and harder, pressure mounts, and the fun disappears.

**Warning signs:**
- "Just one more feature" before launch
- Moving the MVP finish line repeatedly
- Working on multiple features simultaneously without finishing any
- Saying yes to every new idea that emerges
- Feeling overwhelmed by the project's size
- Loss of excitement about the work
- Skipping breaks and rest days
- The project feels more like an obligation than a creative practice

**How it manifests in this project:**
- Starting with "simple portfolio" that becomes a full CMS
- "Quick creative coding sketch" expanding to a full framework
- Publishing automation that tries to handle every edge case
- Building features for hypothetical future needs
- Trying to support every platform/device/format from day one

**Prevention strategies:**
- **Establish MVP ruthlessly** - [Define minimal viable product and focus only on what truly matters](https://www.wayline.io/blog/solo-dev-roadmap-building-games-without-burning-out)
- **Parking lot for ideas** - [Maintain a separate list for future features to keep current scope tight](https://www.codecks.io/blog/2025/how-to-avoid-scope-creep-in-game-development/)
- **Learn to say "no"** - [Saying yes to every request is a recipe for burnout](https://www.wayline.io/blog/solo-dev-survival-guide-avoiding-common-pitfalls)
- **Time-box features** - If it takes more than 1-2 short bursts (2-4 hours), it's too big
- **One feature at a time** - Finish and ship before starting the next
- **Regular breaks mandatory** - [Mental health is as important as code](https://www.wayline.io/blog/solo-dev-roadmap-building-games-without-burning-out)
- **Scope audit weekly** - Every 7 days, review if current work aligns with original MVP

**Phase mapping:**
- **All phases:** Constant vigilance required - scope creep can strike at any phase
- **Phase 0-1:** Define core loop and stick to it religiously
- **Phase 2+:** New features only after core is shipped and validated

---

### 3. The T-Shaped Paradox (Meta-Risk)

**What it is:** The project embodies T-shaped development philosophy (deep expertise + broad knowledge), but this creates a meta-risk of over-expanding into too many domains simultaneously, essentially becoming I-shaped (all breadth, no depth) or creating multiple shallow T's instead of one deep T with broad horizontals.

**Warning signs from research.md:**
- **Intellectual isolation** - Difficulty communicating about the work
- **Context blindness** - Not seeing how pieces fit together
- **Vulnerability to paradigm shifts** - Knowledge becomes outdated quickly
- **Difficulty adapting** - Can't pivot when needed
- **Overspecialization weakness** - "Slow death" as noted in Ghost in the Shell quote

**But ALSO the opposite risk:**
- Spreading too thin across creative coding + audio + video + web + streaming + community
- Surface-level understanding of many tools without mastery of any
- Unable to produce professional-quality work in any single domain
- Constant context-switching preventing flow states
- Never reaching the "vertical" depth that makes the breadth valuable

**How it manifests:**
- Learning 5 creative coding frameworks simultaneously without shipping anything
- Touching audio production, video editing, 3D, generative art all in the same week
- Building elaborate integrations before mastering individual tools
- Following every trend instead of developing a signature style
- Consuming more content about techniques than creating actual work

**Prevention strategies:**
- **Define the vertical first** - Choose ONE primary creative domain to develop deep expertise (per research.md: 50-60% of time on depth)
- **Limit horizontal domains to 3-4 initially** - Don't try to learn everything at once
- **Seasonal focus** - Dedicate months to specific domains, not days
- **Cross-pollination not parallel paths** - Use breadth to inform depth, not compete with it
- **Ship depth first** - Demonstrate mastery in vertical before expanding horizontals
- **Integration over accumulation** - Connect learnings rather than collecting them
- **Signature over versatility** - Build a recognizable style before diversifying

**Recommended balance (from research.md):**
- 50-60% time on vertical (deep creative specialty)
- 40-50% time on horizontal (supporting skills and exploration)
- In this project: Perhaps generative/creative coding as vertical, with audio/publishing/community as horizontals

**Phase mapping:**
- **Phase 0:** Identify and commit to the vertical
- **Phase 1:** Establish depth in vertical while exploring horizontals
- **Phase 2+:** Integrate horizontals to enhance vertical, not replace it

---

## Domain-Specific Pitfalls

### Creative Coding

**Pitfall: Over-engineering before creating**
- Building elaborate frameworks instead of making sketches
- [Studying architecture patterns instead of drawing on canvas](https://vocal.media/futurism/8-ai-code-generation-mistakes-devs-must-fix-to-win-2026)
- Optimizing performance of non-existent projects
- **Prevention:** Start with p5.js sketch or single HTML file, add complexity only when needed
- **Phase:** 0-1, establish simple creation loop first

**Pitfall: Perfectionism killing iteration**
- Tweaking one piece endlessly instead of creating volume
- Waiting for the "perfect" composition before sharing
- **Prevention:** Adopt daily/weekly sketch practice, ship rough work regularly
- **Phase:** All phases - build habit of consistent output over perfect pieces

**Pitfall: Ignoring the expressive goal**
- Focusing on technical complexity instead of [creating something expressive rather than functional](https://www.codenewbie.org/podcast/what-is-creative-coding-and-generative-art)
- Making it work technically but not emotionally
- **Prevention:** Start each piece with "what feeling/idea?" not "what technique?"
- **Phase:** All phases - anchor every project in expressive intent

**Pitfall: Tutorial purgatory**
- Following endless tutorials without developing personal style
- Copy-pasting examples without understanding principles
- [Relying on AI suggestions without understanding underlying logic](https://learn.ryzlabs.com/ai-coding-assistants/10-common-mistakes-developers-make-with-ai-code-assistants-and-how-to-avoid-them)
- **Prevention:** After each tutorial, create original variation immediately
- **Phase:** 0-1, break tutorial dependence early

---

### Audio/Music Production

**Pitfall: Gear obsession over skill development**
- [Focusing on gear over skills - easier to buy equipment than practice](https://hyperbits.com/103-music-production-tips/)
- Waiting for "the right microphone/plugin" before recording
- **Prevention:** Record with phone/basic tools first, upgrade only when hitting real limitations
- **Phase:** 0-1, prove need before buying

**Pitfall: Plugin overload**
- [Inserting way more plugins than needed without understanding reasoning behind decisions](https://www.supremetracks.com/7-amateur-music-production-mistakes/)
- Layering effects hoping to "find the sound"
- **Prevention:** One plugin at a time, understand what each does and why
- **Phase:** 1-2, learn restraint early

**Pitfall: Skipping fundamentals**
- [Trying to jump into technical production without mastering music theory fundamentals](https://www.mi.edu/in-the-know/5-mistakes-avoid-music-production/)
- Not understanding rhythm, melody, harmony basics
- **Prevention:** Dedicate time to basics - scales, rhythm, arrangement fundamentals
- **Phase:** 0, establish foundation

**Pitfall: Mixing in isolation**
- [Mixing tracks in isolation rather than making all ingredients work together](https://www.productionmusiclive.com/blogs/news/10-music-production-mistakes-to-avoid-1)
- Not considering the full mix context
- **Prevention:** Always reference in context, use AB comparison with professional tracks
- **Phase:** 1-2

**Pitfall: Over-layering**
- [Adding more and more layers attempting huge sound, getting pile of sounds instead](https://upayasound.com/5-mistakes-of-music-production/)
- Cluttered productions with no space
- **Prevention:** Start minimal, add only what serves the piece
- **Phase:** 1-2, learn less is more

**Pitfall: Genre jumping**
- [Trying to produce too many different genres, slowing progress](https://micahsmithsound.com/article/common-music-production-mistakes/)
- Never developing signature sound
- **Prevention:** Focus on one genre/style for 3-6 months minimum
- **Phase:** 0-1, establish identity

---

### Content Publishing

**Pitfall: Building perfect pipeline before creating content**
- Waiting for automated multi-platform system before writing first post
- [Publishing content consistently across platforms with right metadata is where things usually fall apart](https://www.activepieces.com/blog/content-publishing-workflow)
- **Prevention:** Publish manually to 1-2 platforms first, understand what needs automation
- **Phase:** 0-1, manual first always

**Pitfall: Platform promiscuity**
- [Chasing every emerging format without considering if it serves specific audience](https://www.writerzden.com/content-writing-mistakes-lessons-2025-2026/)
- Scattered efforts diluting brand identity
- **Prevention:** Pick 2-3 core platforms, master them before expanding
- **Phase:** 0-1, focus over breadth

**Pitfall: Automation without monitoring**
- [Setting up automation and never checking performance](https://mixpost.app/blog/social-media-automation-mistakes)
- Missing underperforming content and audience shifts
- **Prevention:** Weekly analytics review mandatory, adjust based on data
- **Phase:** 2+, when automation is introduced

**Pitfall: Publishing on autopilot during crisis**
- [Scheduled posts continuing during brand crisis, looking tone-deaf](https://obbserv.com/marketing-automation/blog/common-social-media-automation-mistakes/)
- Ignoring real-time events
- **Prevention:** Manual approval for first post each day, stay aware of context
- **Phase:** 2+, build safeguards into automation

**Pitfall: Generic AI content without editing**
- [Publishing posts straight from ChatGPT resulting in tone mismatch](https://simplified.com/blog/ai-social-media/mistakes-to-avoid-social-media-automation)
- Loss of authentic voice
- **Prevention:** AI as assistant not replacement, always add personal touch
- **Phase:** All phases

**Pitfall: Treating all platforms the same**
- [Cross-posting same content everywhere without tweaks](https://contentcaddy.io/blog/posts/avoiding-the-pitfalls-top-10-mistakes-in-social-media-automation-1736640066968)
- What works on LinkedIn doesn't work on Instagram
- **Prevention:** Platform-specific adaptation, understand each audience
- **Phase:** 1-2

**Pitfall: Broadcasting without engagement**
- [Creating month of content, scheduling it, then disappearing](https://www.eclincher.com/articles/10-best-social-media-automation-tools-for-2026)
- Algorithms penalize accounts that don't engage
- **Prevention:** Daily engagement time separate from content creation time
- **Phase:** All phases - engagement is not optional

**Pitfall: Lack of documentation**
- [No documentation leads to rework and version chaos](https://www.podcastvideos.com/articles/outdated-content-workflows-2026/)
- Can't remember what worked or why
- **Prevention:** Simple log of what was published, where, and results
- **Phase:** 0, start tracking from day one

**Pitfall: Workflow silos**
- [Feedback in multiple channels, information gets lost](https://www.lytho.com/blog/five-common-creative-workflow-mistakes-to-avoid/)
- Team (even team of one) wastes time searching
- **Prevention:** Single source of truth for content pipeline
- **Phase:** 1-2

---

### Portfolio / Web

**Pitfall: Over-engineering the portfolio itself**
- [Spending 3-6 months creating fancy website instead of simple MVP](https://arc.dev/talent-blog/web-developer-portfolio/)
- The portfolio becomes another tooling trap
- **Prevention:** Ship basic portfolio in 1-2 short bursts, iterate based on feedback
- **Phase:** 0-1, get online fast

**Pitfall: Quantity over quality**
- [Including too many low-quality projects hurts more than helps](https://templyo.io/blog/17-best-web-developer-portfolio-examples-for-2024)
- Feature only strongest work
- **Prevention:** 3-5 excellent pieces beats 20 mediocre ones
- **Phase:** 0-1, curate ruthlessly

**Pitfall: Telling instead of showing**
- [Portfolio should show not tell - gets out of the way to showcase work](https://elementor.com/blog/best-web-developer-portfolio-examples/)
- Long descriptions of process instead of results
- **Prevention:** Lead with visual work, support with concise context
- **Phase:** 0-1

**Pitfall: Hiding personality**
- [Using templates without customization, looking generic](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)
- Not showing unique design elements
- **Prevention:** Even with template, inject personal style and voice
- **Phase:** 0-1

**Pitfall: No clear narrative**
- Random collection of projects without thread
- Visitor doesn't understand who you are or what you do
- **Prevention:** Build story - atoms → compositions → journey
- **Phase:** 0-1, establish narrative early

---

### Live Streaming

**Pitfall: No testing/rehearsal**
- [Not testing setup before going live leads to technical glitches during stream](https://www.omnistream.live/blog/live-streaming-mistakes-to-avoid-ultimate-guide)
- [Most challenges aren't missing technology but missing preparation](https://www.movingimage.com/blog/comprehensive-guide-to-enterprise-livestreaming-2026)
- **Prevention:** Dry runs before every stream, test everything
- **Phase:** When starting streaming (Phase 2+)

**Pitfall: WiFi streaming**
- [Streaming over WiFi or sharing bandwidth results in dropped frames and failures](https://magmaticmedia.com/blogs/magmatic-blog/5-common-live-streaming-mistakes)
- [Weak internet is #1 reason streams buffer](https://www.spielcreative.com/blog/common-technical-issues-live-streaming/)
- **Prevention:** Wired Ethernet always, test upload speed before each stream
- **Phase:** 2+, infrastructure first

**Pitfall: Audio neglect**
- [Focusing on video while treating audio as afterthought](https://www.muvi.com/blogs/biggest-streaming-mistakes-that-live-streamers-make/)
- Camera mics and room echo make stream unwatchable
- **Prevention:** Invest in decent mic before fancy camera, test audio levels
- **Phase:** 2+

**Pitfall: No clear roles/coordination**
- [Unclear responsibilities cause mistakes during live stream](https://vodlix.com/blog/10-common-live-streaming-mistakes-and-how-to-fix-them)
- Solo streaming without backup plan
- **Prevention:** Document roles (even if all roles are you), have contingencies
- **Phase:** 2+

**Pitfall: Complexity without practice**
- [Virtual sets, AR elements increase demands on synchronization](https://www.movingimage.com/blog/comprehensive-guide-to-enterprise-livestreaming-2026)
- Adding features before mastering basics
- **Prevention:** Start with simple talking head stream, add complexity gradually
- **Phase:** 2+, walk before running

---

### Community Building

**Pitfall: Treating audience as customers not community**
- [Brands should make audience feel like insiders, part of the story](https://www.writerzden.com/content-writing-mistakes-lessons-2025-2026/)
- Transactional relationship instead of connection
- **Prevention:** Share process, journey, personality - not just outputs
- **Phase:** All phases

**Pitfall: The comparison trap**
- [Playing comparison game brings creators to edge of death](https://www.netinfluencer.com/the-creator-economy-in-review-2025-what-77-professionals-say-must-change-in-2026/)
- You vs. others instead of you vs. you
- **Prevention:** Focus on personal growth metrics, not others' numbers
- **Phase:** All phases - mental health critical

**Pitfall: Hobby mindset**
- [Staying stuck thinking of work as hobby, not tracking results or planning](https://vocal.media/journal/top-6-mistakes-creative-entrepreneurs-must-avoid-in-2026)
- Not treating creative practice seriously
- **Prevention:** Set goals, track metrics, review quarterly
- **Phase:** 1+, professionalize approach

**Pitfall: No emotional connection**
- [Posting content without storytelling or meaning](https://www.exchangewire.com/blog/2025/12/16/the-creator-economy-in-2026-tapping-into-culture-community-credibility-and-craft/)
- Content without story
- **Prevention:** Every piece shares context - why it matters, what you learned
- **Phase:** All phases

**Pitfall: SEO over humans**
- [Content architected for crawlers not humans - audiences sense manipulation](https://contentmarketinginstitute.com/strategy-planning/trends-content-marketing)
- 34% of consumers say too much self-promotion is turn-off
- **Prevention:** Write for people first, optimize second
- **Phase:** All phases

**Pitfall: Follower count obsession**
- [Making decisions based on follower counts instead of creative fit and trust](https://sproutsocial.com/insights/social-media-trends/)
- Vanity metrics over meaningful engagement
- **Prevention:** Track engagement rate, conversation quality, not just numbers
- **Phase:** All phases

**Pitfall: Format chasing**
- [Trying every trend without considering if it serves audience](https://www.podcastvideos.com/articles/outdated-content-workflows-2026/)
- Exhausting resources without returns
- **Prevention:** 70% proven formats, 20% iterations, 10% experiments (from research)
- **Phase:** 1-2

**Pitfall: Inconsistent posting without purpose**
- [Posting less frequently and more purposefully beats high volume](https://rpn.beehiiv.com/p/20-rules-for-content-in-2026)
- Random bursts instead of sustainable rhythm
- **Prevention:** Find sustainable cadence based on creation speed (short bursts = specific schedule)
- **Phase:** 1, establish rhythm early

---

### Multi-Device Workflow

**Pitfall: Sync before establishing what needs syncing**
- Building elaborate cloud sync before knowing workflow
- Over-engineering solution to non-existent problem
- **Prevention:** Use one device for 2-4 weeks, note what you actually need elsewhere
- **Phase:** 0-1, understand need first

**Pitfall: Files getting lost in sync chaos**
- [Files get lost, sync issues slow things down, no one knows latest version](https://www.tessr.us/post/creative-workflow-mistakes-and-solutions)
- [Sometimes syncing works, sometimes not, files go "backwards"](https://forums.adobe.com/thread/2502031)
- **Prevention:** Git for code/text, documented backup for media, clear naming conventions
- **Phase:** 1-2

**Pitfall: Version control nightmare**
- Working on old versions inadvertently
- Multiple copies of same file with no clear source of truth
- **Prevention:** Single source of truth per project, strict versioning scheme
- **Phase:** 1-2

**Pitfall: Scattered communications**
- [Feedback in multiple channels, information gets lost](https://www.sharefile.com/resource/blogs/creative-workflow-management)
- Time wasted searching for comments
- **Prevention:** Centralized notes/tasks system (even simple markdown)
- **Phase:** 1

**Pitfall: No offline fallback**
- Total dependence on cloud connectivity
- Can't work when internet fails
- **Prevention:** Local-first workflow, sync as backup not primary
- **Phase:** 0-1, design for offline capability

---

### LLM Integration

**Pitfall: Vague prompts without planning**
- [Diving into code generation with vague prompt instead of brainstorming spec first](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e)
- Hoping AI will figure out what you want
- **Prevention:** Spec → plan → code, use AI at each stage appropriately
- **Phase:** When integrating AI (likely 2+)

**Pitfall: Security blindness**
- [AI produces secure code only 56% of time without security prompting](https://www.darkreading.com/application-security/coders-adopt-ai-agents-security-pitfalls-lurk-2026)
- Generating vulnerabilities at scale
- **Prevention:** Never deploy AI code without review, security-aware prompts
- **Phase:** 2+

**Pitfall: The Dunning-Kruger effect**
- [AI can lead to Dunning-Kruger on steroids for those without solid base](https://www.clarifai.com/blog/llms-and-ai-trends)
- Overconfidence without foundational skills
- **Prevention:** [Code periodically without AI to keep raw skills sharp](https://addyosmani.com/blog/ai-coding-workflow/)
- **Phase:** All phases when using AI

**Pitfall: Productivity loss from rework**
- [15-25% of productivity gains lost to reworking AI code](https://medium.com/generative-ai-revolution-ai-native-transformation/the-llm-bubble-is-bursting-the-2026-ai-reset-powering-agentic-engineering-085da564b6cd)
- Accepting code without understanding
- **Prevention:** Review everything, understand before accepting
- **Phase:** 2+

**Pitfall: Insufficient context**
- [LLMs only as good as context provided](https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/)
- Generic outputs without domain knowledge
- **Prevention:** Show relevant code, docs, constraints explicitly
- **Phase:** 2+

**Pitfall: Single model for everything**
- [Single LLM trying to plan, retrieve, decide, validate, act = overwhelmed intern](https://medium.com/generative-ai-revolution-ai-native-transformation/the-llm-bubble-is-bursting-the-2026-ai-reset-powering-agentic-engineering-085da564b6cd)
- Wrong tool for task
- **Prevention:** Match model to task, don't expect one AI to do everything
- **Phase:** 2+

**Pitfall: Creativity replacement vs. augmentation**
- [Augmentation more effective than complete LLM replacement for creative tasks](https://substack.com/redirect/b5b63aad-bc3e-4db4-a85d-e5c97e9e9fea?j=eyJ1IjoiMnFseXRuIn0.iWUvChxcbC4Dv4qN28JzkMC0cXrwPTbMpRjsyHpDj2s)
- Letting AI make creative decisions
- **Prevention:** AI as assistant for technical tasks, human drives creative vision
- **Phase:** All phases when using AI

**Pitfall: Skill atrophy**
- Over-dependence leading to inability to code without AI
- Loss of problem-solving capability
- **Prevention:** Regular AI-free practice sessions, maintain fundamentals
- **Phase:** All phases when using AI

**Pitfall: Unsecured integrations**
- [MCP servers often left without authentication](https://www.darkreading.com/application-security/coders-adopt-ai-agents-security-pitfalls-lurk-2026)
- Shadow AI creating security holes
- **Prevention:** Audit all AI integrations, proper authentication always
- **Phase:** 2+

---

## The Meta-Risk

### The T-Shaped Development Paradox

As established in `/home/pavel/dev/play/eoe/research.md`, the optimal modern approach is T-shaped development: deep expertise in one area (vertical) combined with broad understanding across multiple domains (horizontal). Research suggests the modern balance should be **50-60% depth, 40-50% breadth**.

**The Paradox:** This project embodies this philosophy perfectly - creative coding as potential vertical, with audio, publishing, web, streaming, community as horizontals. BUT the very nature of this approach creates the meta-risk of attempting too much breadth before establishing depth, or spreading breadth so thin that no meaningful depth develops.

**Warning signs you're falling into the paradox:**

From research.md (over-specialization risks):
- Intellectual isolation - can't communicate about your work
- Context blindness - don't see how pieces fit
- Vulnerability to paradigm shifts - specialized knowledge becomes obsolete
- Difficulty adapting - can't pivot when needed

From over-breadth risks:
- Surface familiarity with many tools, mastery of none
- Unable to produce professional-quality work in any domain
- Constant context-switching preventing flow states
- Learning new frameworks while shipping nothing
- Knowledge accumulation without integration
- Following every trend without developing signature style

**The specific risk for Engines of Experience:**

You could easily fall into:
1. Learning p5.js, Three.js, Hydra, TouchDesigner simultaneously (breadth)
2. While also exploring Ableton, Reaper, Sonic Pi (breadth)
3. While building publishing automation (breadth)
4. While setting up streaming infrastructure (breadth)
5. While experimenting with LLM integration (breadth)
6. And never shipping a single completed creative piece (no depth)

This would create the **I-shaped developer** - all breadth, no depth, and ironically the exact opposite of the T-shaped ideal the project seeks to embody.

**Prevention strategy:**

1. **Choose the vertical first and commit**
   - Likely generative/creative coding as the deep expertise
   - Dedicate 50-60% of time to mastering this
   - Ship work that demonstrates growing expertise
   - Build reputation in this domain

2. **Limit initial horizontals to 3-4 maximum**
   - Perhaps: basic audio, basic publishing, basic portfolio
   - These serve the vertical, don't compete with it
   - 40-50% of time across all horizontals combined

3. **Seasonal focus within horizontals**
   - Month 1-2: Creative coding depth + basic portfolio
   - Month 3-4: Creative coding depth + audio exploration
   - Month 5-6: Creative coding depth + publishing automation
   - Not all at once

4. **Integration over accumulation**
   - How does audio enhance creative coding output?
   - How does publishing serve sharing the coding work?
   - Connect the dots, don't just collect dots

5. **Demonstration of depth before expansion**
   - Ship 10-20 quality creative coding pieces before adding new domain
   - Build portfolio that shows expertise before adding streaming
   - Establish voice before expanding platforms

6. **Use breadth to inform depth, not replace it**
   - Audio knowledge improves audiovisual coding pieces
   - Publishing skills help share creative work better
   - Community understanding guides what to create
   - But creative coding remains the core

**Phase mapping:**
- **Phase 0:** Commit to the vertical, set up minimal horizontal support
- **Phase 1:** Establish depth through volume (20+ sketches/pieces in vertical)
- **Phase 2:** Add first horizontal depth (e.g., if audio chosen, ship 5-10 tracks)
- **Phase 3+:** Integrate - create pieces that span vertical + horizontals

**Success metric:**
Can you be introduced as "X who does Y" where X is your vertical specialty? If answer is vague or requires listing 5 things, you haven't established the vertical yet.

For this project: Aim for "creative coder who shares the process through audio, video, and writing" not "someone who does creative coding and audio and video and web and streaming and..."

---

## Prevention Strategies Summary

### Universal Principles

1. **Output over input** - Creation hours must exceed learning hours (80/20 rule)
2. **Manual before automation** - Feel the pain before building the solution
3. **Ship regularly** - Weekly output quota non-negotiable
4. **Time-box everything** - Research (1h), features (2-4h bursts), explorations (1 day max)
5. **MVP ruthlessly** - Define minimum, ship it, iterate based on real use
6. **One thing at a time** - Finish before starting next
7. **Track the metrics** - Creation vs. setup time, output frequency, skill depth vs. breadth
8. **Embrace constraints** - Short bursts, limited time = forced prioritization
9. **No perfect, only done** - Good enough shipped beats perfect planned
10. **Protect the creative practice** - If it doesn't serve making things, defer it

### Phase-Specific Guards

**Phase 0 (Foundations):**
- Absolute minimum tooling only
- Choose the vertical and commit
- Set up basic portfolio (1-2 bursts max)
- Establish output cadence
- No automation yet

**Phase 1 (Manual Workflows):**
- Do everything the hard way
- Document what hurts
- Ship volume in vertical domain (20+ pieces)
- Learn 1-2 horizontals only
- No pipeline building yet

**Phase 2+ (Selective Automation):**
- Automate only proven pain points
- Build based on real needs, not hypothetical
- Add horizontals one at a time
- Continue shipping in vertical
- Integration over expansion

### Red Flags Requiring Immediate Correction

- Setup time exceeding creation time
- More than 3 days without shipping something
- Starting new domain before shipping in current domain
- Building tools instead of using tools
- Learning new framework without shipping with previous framework
- Saying "just need to learn X first" for 3rd time in a month
- Portfolio has 0 pieces but elaborate publishing pipeline exists
- Can't explain vertical specialty in one sentence
- Excitement about tools, apathy about creating

### Emergency Reset Protocol

If you find yourself in tooling trap or scope spiral:

1. **STOP** - Cease all new learning/setup immediately
2. **AUDIT** - List what you've built vs. what you've shipped (output, not setup)
3. **RESET** - Return to absolute basics - one tool, one domain, one simple piece
4. **SHIP** - Create and publish something in 1-2 bursts (2-4 hours max)
5. **REFLECT** - What brought you here? Which warning signs did you miss?
6. **GUARD** - What rule will prevent this next time?
7. **RESUME** - Continue with renewed focus on output

---

## Phase Mapping

### Phase 0: Foundations
**Focus:** Establish bare minimum to create and share

**Address these pitfalls:**
- The Tooling Trap - set up minimum only
- T-Shaped Paradox - commit to vertical
- Portfolio over-engineering - basic site only
- Multi-device premature optimization - use one device

**Deliverables:**
- Terminal, editor, git, ONE creative tool
- Basic portfolio (3-5 pieces)
- Chosen vertical domain
- First piece shipped

### Phase 1: Manual Workflows
**Focus:** Create volume, discover pain points through real use

**Address these pitfalls:**
- Scope creep - define and maintain MVP
- Automation before need - stay manual
- Tutorial purgatory - create originals
- Quality over quantity - ship rough work
- Platform promiscuity - pick 2-3 max
- Hobby mindset - start tracking

**Deliverables:**
- 20+ pieces in vertical domain
- Manual publishing to 2-3 platforms
- Pain points documented
- Creation > learning hours proven

### Phase 2: Selective Automation
**Focus:** Build solutions to proven problems, add first horizontals

**Address these pitfalls:**
- Automation without monitoring - track performance
- Generic AI content - maintain voice
- Single model for everything - match tool to task
- Adding horizontals - one at a time only
- Live streaming complexity - start simple

**Deliverables:**
- Automated pain points only
- One horizontal domain added
- Integration between vertical + horizontal
- Continued output in vertical

### Phase 3+: Integration & Growth
**Focus:** Cross-domain work, community building, sustainable practice

**Address these pitfalls:**
- All community pitfalls - engagement over numbers
- Comparison trap - focus on personal growth
- Format chasing - 70/20/10 rule
- Skill atrophy with AI - maintain fundamentals
- Burnout - sustainable pace

**Deliverables:**
- Work spanning multiple domains
- Community engagement rhythm
- Teaching/sharing process
- Long-term sustainable practice

---

## Research Sources

### Creative Coding & AI Tools
- [8 AI Code Generation Mistakes Devs Must Fix To Win 2026](https://vocal.media/futurism/8-ai-code-generation-mistakes-devs-must-fix-to-win-2026)
- [10 Common Mistakes Developers Make with AI Code Assistants](https://learn.ryzlabs.com/ai-coding-assistants/10-common-mistakes-developers-make-with-ai-code-assistants-and-how-to-avoid-them)
- [What is creative coding and generative art](https://www.codenewbie.org/podcast/what-is-creative-coding-and-generative-art)

### Portfolio Development
- [The Anthology of a Creative Developer: A 2026 Portfolio](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)
- [Web Developer Portfolio: How to Build a Powerful One](https://arc.dev/talent-blog/web-developer-portfolio/)
- [Best Web Developer Portfolio Examples](https://elementor.com/blog/best-web-developer-portfolio-examples/)
- [17 Inspiring Web Developer Portfolio Examples](https://templyo.io/blog/17-best-web-developer-portfolio-examples-for-2024)

### Content Publishing
- [Building a Write-Once Publishing Pipeline](https://confdroid.com/2026/01/publishing-pipeline/)
- [How to Build a Content Publishing Workflow](https://www.activepieces.com/blog/content-publishing-workflow)
- [Streamline Your Content Creation: 5 Workflows to Ditch](https://www.podcastvideos.com/articles/outdated-content-workflows-2026/)
- [7 Content Mistakes From 2025 To Avoid In 2026](https://www.writerzden.com/content-writing-mistakes-lessons-2025-2026/)

### Live Streaming
- [Top Live Streaming Mistakes to Avoid](https://www.omnistream.live/blog/live-streaming-mistakes-to-avoid-ultimate-guide)
- [Enterprise Live Streaming 2026](https://www.movingimage.com/blog/comprehensive-guide-to-enterprise-livestreaming-2026)
- [5 Common Live Streaming Mistakes](https://magmaticmedia.com/blogs/magmatic-blog/5-common-live-streaming-mistakes)
- [Common Technical Issues in Live Streaming](https://www.spielcreative.com/blog/common-technical-issues-live-streaming/)

### Community Building
- [Top 6 Mistakes Creative Entrepreneurs Must Avoid](https://vocal.media/journal/top-6-mistakes-creative-entrepreneurs-must-avoid-in-2026)
- [The Creator Economy In Review 2025](https://www.netinfluencer.com/the-creator-economy-in-review-2025-what-77-professionals-say-must-change-in-2026/)
- [The Creator Economy in 2026](https://www.exchangewire.com/blog/2025/12/16/the-creator-economy-in-2026-tapping-into-culture-community-credibility-and-craft/)
- [20 Rules for Content in 2026](https://rpn.beehiiv.com/p/20-rules-for-content-in-2026)
- [42 Experts Reveal Top Content Marketing Trends](https://contentmarketinginstitute.com/strategy-planning/trends-content-marketing)
- [7 Social Media Trends to Know in 2026](https://sproutsocial.com/insights/social-media-trends/)

### Multi-Device Workflows
- [5 Workflow Mistakes That Kill the Creative Flow](https://fstoppers.com/bts/5-workflow-mistakes-kill-creative-flow-and-how-avoid-them-715654)
- [5 Common Creative Workflow Mistakes and Solutions](https://www.tessr.us/post/creative-workflow-mistakes-and-solutions)
- [Five Common Creative Workflow Mistakes to Avoid](https://www.lytho.com/blog/five-common-creative-workflow-mistakes-to-avoid/)
- [Creative workflow management: a 7-step guide](https://www.sharefile.com/resource/blogs/creative-workflow-management)

### LLM Integration
- [My LLM coding workflow going into 2026](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e)
- [As Coders Adopt AI Agents, Security Pitfalls Lurk](https://www.darkreading.com/application-security/coders-adopt-ai-agents-security-pitfalls-lurk-2026)
- [The LLM Bubble Is Bursting: The 2026 AI Reset](https://medium.com/generative-ai-revolution-ai-native-transformation/the-llm-bubble-is-bursting-the-2026-ai-reset-powering-agentic-engineering-085da564b6cd)
- [5 Key Trends Shaping Agentic Development in 2026](https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/)
- [Top LLMs and AI Trends for 2026](https://www.clarifai.com/blog/llms-and-ai-trends)

### Solo Developer Challenges
- [Scope Creep: The Silent Killer of Solo Indie Game Development](https://www.wayline.io/blog/scope-creep-solo-indie-game-development)
- [Solo Dev's Roadmap: Building Games Without Burning Out](https://www.wayline.io/blog/solo-dev-roadmap-building-games-without-burning-out)
- [Solo Dev Survival Guide: Avoiding Common Pitfalls](https://www.wayline.io/blog/solo-dev-survival-guide-avoiding-common-pitfalls)
- [How to Avoid Scope Creep in Game Development](https://www.codecks.io/blog/2025/how-to-avoid-scope-creep-in-game-development/)

### Social Media Automation
- [5 Common Mistakes to Avoid When Using Social Media Automation](https://simplified.com/blog/ai-social-media/mistakes-to-avoid-social-media-automation)
- [7 Social Media Automation Mistakes Killing Your Engagement](https://mixpost.app/blog/social-media-automation-mistakes)
- [7 Social Media Automation Mistakes & How to Fix Them](https://obbserv.com/marketing-automation/blog/common-social-media-automation-mistakes/)
- [Avoiding the Pitfalls: Top 10 Mistakes in Social Media Automation](https://contentcaddy.io/blog/posts/avoiding-the-pitfalls-top-10-mistakes-in-social-media-automation-1736640066968)

### Creative Practice & Productivity
- [Creative workflow in 2026](https://monday.com/blog/project-management/creative-workflow/)
- [Creative Workflow Hacks That Actually Maximize Productivity](https://blog.segmind.com/creative-workflow-hacks-productivity/)
- [How leaders can harness productivity to unlock creativity](https://www.fastcompany.com/91470075/how-leaders-can-harness-productivity-to-unlock-creativity)

### Audio/Music Production
- [7 Amateur Music Production Mistakes](https://www.supremetracks.com/7-amateur-music-production-mistakes/)
- [5 Common Mistakes to Avoid in Music Production](https://www.mi.edu/in-the-know/5-mistakes-avoid-music-production/)
- [10 Music Production Mistakes To Avoid](https://www.productionmusiclive.com/blogs/news/10-music-production-mistakes-to-avoid-1)
- [The 5 Mistakes of Music Production](https://upayasound.com/5-mistakes-of-music-production/)
- [Most common DIY music production mistakes](https://micahsmithsound.com/article/common-music-production-mistakes/)
- [103 Music Production Tips](https://hyperbits.com/103-music-production-tips/)

---

**Document version:** 1.0
**Created:** 2026-01-29
**Purpose:** Prevent common pitfalls in Engines of Experience development
**Primary consumer:** Roadmap and planning phases
**Critical constraint:** Avoid tooling trap - output over input always
