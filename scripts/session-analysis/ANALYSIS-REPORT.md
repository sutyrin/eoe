# Claude Session Analysis Report

*Generated: 2026-02-21 18:25*

## 1. Overview

- **Sessions analyzed:** 1895
- **Batches:** 264
- **Projects:** app, claude, claude-workspace, codev, codev--tasks, dev, dev-codev, dosbox, dost, eoe, fns-doc-generator, home, opt-telegram-mcp-server, opus-rework, remove-browser-tests, root, strudel, tesla, tm, tm-export, tm-tests, tools, video-okto, vpn-utils, x5
- **Date range:** 2025-10-29 to 2026-02-18
- **Analysis cost:** $0.0000 (0 input + 0 output tokens)

## 2. Session Intent Distribution

```
  research                  [########################################] 368
  other                     [#############################           ] 271
  feature-build             [############################            ] 259
  bug-fix                   [#########################               ] 238
  testing                   [####################                    ] 186
  config-setup              [##################                      ] 166
  exploration               [##########                              ] 101
  planning                  [########                                ] 82
  data-extraction           [########                                ] 76
  deployment                [#######                                 ] 69
  refactor                  [###                                     ] 31
  error-recovery            [#                                       ] 12
  execution                 [                                        ] 4
  documentation             [                                        ] 3
  code-review               [                                        ] 3
  operational-check         [                                        ] 2
  maintenance               [                                        ] 2
  cleanup                   [                                        ] 2
  task-completion           [                                        ] 2
  research, planning        [                                        ] 2
  delegation-chain          [                                        ] 1
  implementation            [                                        ] 1
  feature-merge             [                                        ] 1
  project-management        [                                        ] 1
  task-implementation       [                                        ] 1
  review                    [                                        ] 1
  feature-verification      [                                        ] 1
  task-coordination         [                                        ] 1
  task-creation             [                                        ] 1
  reporting                 [                                        ] 1
  refactoring               [                                        ] 1
  bug-fix, refactor         [                                        ] 1
  deployment-and-infrastructure [                                        ] 1
  bug-fix-and-refactoring   [                                        ] 1
  infrastructure-and-observability [                                        ] 1
  troubleshooting, research [                                        ] 1
```

| Intent | Count | Percentage |
|--------|------:|-----------:|
| research | 368 | 19.4% |
| other | 271 | 14.3% |
| feature-build | 259 | 13.7% |
| bug-fix | 238 | 12.6% |
| testing | 186 | 9.8% |
| config-setup | 166 | 8.8% |
| exploration | 101 | 5.3% |
| planning | 82 | 4.3% |
| data-extraction | 76 | 4.0% |
| deployment | 69 | 3.6% |
| refactor | 31 | 1.6% |
| error-recovery | 12 | 0.6% |
| execution | 4 | 0.2% |
| documentation | 3 | 0.2% |
| code-review | 3 | 0.2% |
| operational-check | 2 | 0.1% |
| maintenance | 2 | 0.1% |
| cleanup | 2 | 0.1% |
| task-completion | 2 | 0.1% |
| research, planning | 2 | 0.1% |
| delegation-chain | 1 | 0.1% |
| implementation | 1 | 0.1% |
| feature-merge | 1 | 0.1% |
| project-management | 1 | 0.1% |
| task-implementation | 1 | 0.1% |
| review | 1 | 0.1% |
| feature-verification | 1 | 0.1% |
| task-coordination | 1 | 0.1% |
| task-creation | 1 | 0.1% |
| reporting | 1 | 0.1% |
| refactoring | 1 | 0.1% |
| bug-fix, refactor | 1 | 0.1% |
| deployment-and-infrastructure | 1 | 0.1% |
| bug-fix-and-refactoring | 1 | 0.1% |
| infrastructure-and-observability | 1 | 0.1% |
| troubleshooting, research | 1 | 0.1% |

## 3. Prompt Quality Analysis

**Average score:** 3.2 / 5

### Distribution

```
  ***** (5)                 [############################            ] 413
  **** (4)                  [########################################] 573
  *** (3)                   [#####################                   ] 303
  ** (2)                    [##############                          ] 213
  * (1)                     [#########################               ] 365
```

### By Project

| Project | Avg Score | Sessions |
|---------|----------:|---------:|
| app | 4.8 | 6 |
| claude | 1.0 | 1 |
| claude-workspace | 1.9 | 8 |
| codev | 2.7 | 27 |
| codev--tasks | 2.5 | 2 |
| dev | 3.0 | 3 |
| dev-codev | 1.7 | 3 |
| dosbox | 3.0 | 1 |
| dost | 3.2 | 28 |
| eoe | 3.4 | 35 |
| fns-doc-generator | 3.0 | 3 |
| home | 2.5 | 13 |
| opt-telegram-mcp-server | 1.0 | 1 |
| opus-rework | 3.1 | 9 |
| remove-browser-tests | 2.8 | 9 |
| root | 5.0 | 1 |
| strudel | 2.0 | 1 |
| tesla | 2.8 | 1120 |
| tm | 4.1 | 578 |
| tm-export | 1.0 | 4 |
| tm-tests | 3.5 | 2 |
| tools | 2.5 | 4 |
| video-okto | 4.0 | 4 |
| vpn-utils | 2.0 | 1 |
| x5 | 3.3 | 3 |

### Bottom 10 (Improvement Targets)

| Session ID | Project | Score | Reason |
|------------|---------|------:|--------|
| 0dc721cb-e36... | claude-workspace | 1 | Empty session — no turns recorded, title only |
| 697b1219-8e4... | claude-workspace | 1 | Empty session — summary only, no turns |
| 86771ad9-584... | claude-workspace | 1 | Empty session — summary only, no turns |
| a40157f2-2bf... | claude-workspace | 1 | Empty session — summary only, no turns |
| b37a16ff-93c... | claude | 1 | No actual prompt/request—only a diagnostic command with caveat. User explicitly prevented Claude engagement. |
| b4c55657-8e5... | codev--tasks | 1 | Not a work session—only contains /clear UI command with no meaningful interaction or task. |
| 9c6cd2dd-c5a... | codev | 1 | Empty session with only metadata summary, no actual user prompts or work |
| 22d73a09-c8c... | codev | 1 | Minimal interaction, only login command execution |
| 4626bb6a-bc1... | codev | 1 | No meaningful interaction, only session initiation |
| 6429fbbf-943... | codev | 1 | No actual interaction, only summary metadata |

### Top 10 (Examples to Replicate)

| Session ID | Project | Score | Reason |
|------------|---------|------:|--------|
| 449bfe31-088... | app | 5 | Extremely detailed Russian specification with parsing rules, clear examples, and comprehensive JSON schema |
| 9c857013-bdf... | app | 5 | Rich product context, detailed basket contents, clear instructions for recipe generation with formatting rules |
| c01fca8c-cab... | app | 5 | Complete specification identical to session 1, testing ambiguous command "Собери корзину" interpretation |
| 31a51401-d02... | app | 5 | Trivial health check with crystal-clear instruction |
| 9e8bdbc0-53c... | app | 5 | Trivial health check with explicit instruction |
| 0850559f-e53... | codev | 5 | Exceptionally detailed requirements in Russian with specific workflow needs, requests for ultrathink analysis, mentions testing ratios and TDD methodology |
| d88011e1-acb... | dost | 5 | Explicit, specific command with all required parameters (namespace, project name, branch) |
| 5d937417-366... | dost | 5 | Highly detailed, structured reconciliation requirements with specific validation checks listed (duplicates, reserves, PVZ addresses, etc.) |
| 606fe952-a98... | dost | 5 | Comprehensive reconciliation task executed with clear data sources and validation requirements from GSD quick task framework |
| 2c540feb-19b... | dost | 5 | Highly specific tmux configuration requirements; user showed domain expertise; clear behavioral goals stated upfront |

## 4. Workflow Pattern Analysis

### Distribution

```
  direct-instruction        [########################################] 698
  iterative-refinement      [###############                         ] 265
  error-recovery            [###############                         ] 263
  exploratory-dialogue      [##############                          ] 259
  other                     [###########                             ] 202
  delegation-chain          [#####                                   ] 89
  exploration               [##                                      ] 50
  context-dump              [#                                       ] 32
  none                      [                                        ] 5
  N/A                       [                                        ] 4
  config-setup              [                                        ] 3
  test-driven-development   [                                        ] 3
  planning                  [                                        ] 3
  testing                   [                                        ] 2
  unknown                   [                                        ] 2
  research                  [                                        ] 2
  iterative-refinement + error-recovery [                                        ] 1
  direct-instruction with error-recovery [                                        ] 1
  context-reset             [                                        ] 1
  conversational            [                                        ] 1
  systematic-search-and-replace [                                        ] 1
  error-recovery + iterative-refinement [                                        ] 1
  direct-instruction + iterative-refinement [                                        ] 1
  configuration             [                                        ] 1
  comparative-research      [                                        ] 1
  context-resumption        [                                        ] 1
  agentic-exploration       [                                        ] 1
  incomplete                [                                        ] 1
  abandoned                 [                                        ] 1
```

### Pattern by Project

| Project | N/A | abandoned | agentic-exploration | comparative-research | config-setup | configuration | context-dump | context-reset | context-resumption | conversational | delegation-chain | direct-instruction | direct-instruction + iterative-refinement | direct-instruction with error-recovery | error-recovery | error-recovery + iterative-refinement | exploration | exploratory-dialogue | incomplete | iterative-refinement | iterative-refinement + error-recovery | none | other | planning | research | systematic-search-and-replace | test-driven-development | testing | unknown |
|---------|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|
| app | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| claude | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| claude-workspace | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 |
| codev | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 2 | 0 | 0 | 5 | 0 | 8 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 0 |
| codev--tasks | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| dev | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| dev-codev | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| dosbox | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| dost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 2 | 0 | 0 | 5 | 0 | 0 | 9 | 0 | 5 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| eoe | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 3 | 12 | 0 | 1 | 4 | 0 | 0 | 10 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| fns-doc-generator | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| home | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 2 | 0 | 0 | 5 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| opt-telegram-mcp-server | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| opus-rework | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 2 | 0 | 0 | 2 | 0 | 2 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 0 |
| remove-browser-tests | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 2 | 0 | 2 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| root | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| strudel | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| tesla | 4 | 0 | 1 | 1 | 1 | 1 | 29 | 0 | 1 | 1 | 41 | 242 | 1 | 0 | 200 | 1 | 47 | 190 | 0 | 190 | 0 | 5 | 175 | 2 | 0 | 1 | 3 | 2 | 2 |
| tm | 0 | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 40 | 410 | 0 | 0 | 36 | 0 | 0 | 31 | 1 | 45 | 0 | 0 | 9 | 1 | 2 | 0 | 0 | 0 | 0 |
| tm-export | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| tm-tests | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| tools | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| video-okto | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| vpn-utils | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| x5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

### Monthly Evolution

| Month | N/A | abandoned | agentic-exploration | comparative-research | config-setup | configuration | context-dump | context-reset | context-resumption | conversational | delegation-chain | direct-instruction | direct-instruction + iterative-refinement | direct-instruction with error-recovery | error-recovery | error-recovery + iterative-refinement | exploration | exploratory-dialogue | incomplete | iterative-refinement | iterative-refinement + error-recovery | none | other | planning | research | systematic-search-and-replace | test-driven-development | testing | unknown |
|-------|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|
| 2025-10 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 2 | 35 | 0 | 0 | 30 | 0 | 3 | 24 | 0 | 24 | 0 | 3 | 18 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2025-11 | 4 | 0 | 0 | 0 | 3 | 0 | 22 | 0 | 0 | 1 | 25 | 183 | 0 | 0 | 155 | 0 | 44 | 138 | 0 | 156 | 0 | 2 | 159 | 2 | 0 | 1 | 3 | 2 | 0 |
| 2025-12 | 0 | 0 | 0 | 0 | 0 | 1 | 5 | 0 | 0 | 0 | 2 | 42 | 1 | 0 | 18 | 1 | 1 | 34 | 0 | 18 | 1 | 0 | 13 | 0 | 0 | 0 | 0 | 0 | 2 |
| 2026-01 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 31 | 49 | 0 | 1 | 28 | 0 | 0 | 29 | 1 | 31 | 0 | 0 | 7 | 1 | 2 | 0 | 0 | 0 | 0 |
| 2026-02 | 0 | 1 | 1 | 1 | 0 | 0 | 2 | 1 | 1 | 0 | 29 | 389 | 0 | 0 | 32 | 0 | 2 | 34 | 0 | 36 | 0 | 0 | 5 | 0 | 0 | 0 | 0 | 0 | 0 |

## 5. Delegation Effectiveness

**Average score:** 3.5 / 5

### By Project

| Project | Avg Score | Sessions |
|---------|----------:|---------:|
| app | 4.8 | 6 |
| claude-workspace | 1.5 | 8 |
| codev | 3.0 | 27 |
| codev--tasks | 2.5 | 2 |
| dev | 3.0 | 3 |
| dev-codev | 2.0 | 3 |
| dosbox | 4.0 | 1 |
| dost | 3.4 | 28 |
| eoe | 3.6 | 35 |
| fns-doc-generator | 3.5 | 2 |
| home | 2.8 | 13 |
| opt-telegram-mcp-server | 1.0 | 1 |
| opus-rework | 3.1 | 9 |
| remove-browser-tests | 2.8 | 9 |
| root | 5.0 | 1 |
| strudel | 4.0 | 1 |
| tesla | 3.1 | 1075 |
| tm | 4.3 | 572 |
| tm-export | 1.0 | 4 |
| tm-tests | 4.0 | 2 |
| tools | 3.2 | 4 |
| video-okto | 4.0 | 4 |
| vpn-utils | 4.0 | 1 |
| x5 | 3.0 | 3 |

### Correlation with Prompt Quality

Pearson correlation: **0.81**
*Strong positive: better prompts lead to better delegation.*

### Bottom 10

| Session ID | Project | Score | Summary |
|------------|---------|------:|---------|
| 0dc721cb-e36... | claude-workspace | 1 | No interaction recorded |
| 697b1219-8e4... | claude-workspace | 1 | No interaction recorded |
| 86771ad9-584... | claude-workspace | 1 | No interaction recorded |
| a40157f2-2bf... | claude-workspace | 1 | No interaction recorded |
| b7597dc9-0bd... | claude-workspace | 1 | Started work on kawai kimono goonger reading TODO.md; sessio |
| de38c37b-a9d... | claude-workspace | 1 | Single user request to read TODO.md; no assistant response r |
| b4c55657-8e5... | codev--tasks | 1 | No work performed; session contains only a screen clear comm |
| 024cbd08-832... | codev | 1 | Incomplete session with minimal instruction requesting undef |
| 9c6cd2dd-c5a... | codev | 1 | System-generated metadata session with no actual conversatio |
| 1fdc63a4-d8a... | codev | 1 | Brief exploratory session about Telegram bot reaction capabi |

### Top 10

| Session ID | Project | Score | Summary |
|------------|---------|------:|---------|
| 449bfe31-088... | app | 5 | Validated NLU for shopping list generation with dietary rest |
| 9c857013-bdf... | app | 5 | Generated 3+ simple recipes from basket contents with Russia |
| c01fca8c-cab... | app | 5 | Validated that "Собери корзину" (assemble basket) correctly  |
| 31a51401-d02... | app | 5 | Health check ping-pong test, responded with exact word reque |
| 9e8bdbc0-53c... | app | 5 | Duplicate health check ping-pong test, identical to session  |
| 0850559f-e53... | codev | 5 | Designed comprehensive 7-phase CLI dashboard system with Pha |
| 2b071f75-05d... | codev | 5 | Built sophisticated tmux dashboard with 33/67 split-pane lay |
| 9963cb8b-6d7... | dost | 5 | Implemented complete watcher order pipeline (YD create→confi |
| f9bbd5aa-f48... | dost | 5 | Identified city extraction bug affecting PVZ selection for S |
| 59749a91-f26... | dost | 5 | Fixed two bugs: DaData federal city extraction (г Санкт-Пете |

## 6. Anti-Pattern Catalog

*Classified via LLM semantic grouping.*

### Things to Stop Doing

| Pattern Group | Occurrences | Examples |
|---------------|------------:|---------|
| Empty, stub, placeholder, or no meaningful work sessions | 163 | empty-session, stub-session, placeholder-session |
| Incomplete execution and unfinished tasks | 66 | incomplete-session, incomplete-execution, incomplete-task |
| Metadata-only or insufficient context capture | 58 | metadata-only, summary-only, insufficient-data |
| Session interruptions and broken workflows | 25 | session-interrupted, interrupted-session, session-immediately-interrupted |
| Administrative overhead and repetitive task structures | 14 | administrative-overhead, repetitive-task, repetitive-task-structure |
| Excessive session length | 11 | excessive-session-length, very-long-session, extended-debugging-session |
| Scope creep, context switching, and unclear requirements | 11 | scope-creep, context-switching, unclear-requirements |
| No tool usage or missing follow-up | 10 | no-tool-usage, no-follow-up |

### Things to Keep Doing

| Pattern Group | Occurrences | Examples |
|---------------|------------:|---------|
| Systematic debugging and root cause analysis | 121 | systematic-debugging, root-cause-analysis, systematic-root-cause-analysis |
| Comprehensive testing and validation (including MCP and TDD) | 116 | comprehensive-testing, comprehensive-test-coverage, test-driven-development |
| Specificity, vivid descriptions, and concrete examples with normalization | 116 | specificity-emphasis, normalization-rules, specificity-enforcement |
| Structured output and consistent data extraction | 96 | consistent-schema, multi-field-extraction, consistent-format |
| Efficient, minimal-interaction, and parallel execution | 64 | efficient-execution, wave-based-parallel-execution, quick-execution |
| Systematic investigation and log analysis | 56 | systematic-log-analysis, systematic-investigation, systematic-exploration |
| Completion and progress tracking | 44 | completion-tracking, completion-status-tracking, todo-tracking |
| Topic aggregation and categorization | 44 | topic-aggregation, category-aggregation, topic-categorization |
| Good error recovery and edge case handling | 40 | good-error-recovery, error-recovery, edge-case-handling |
| Proper git workflow and commit discipline | 20 | proper-git-workflow, atomic-commits, frequent-commits |
| Good documentation practices | 20 | good-documentation, comprehensive-documentation, proper-documentation |
| Language preservation (Russian) | 18 | language-preservation, russian-language-usage, russian-language-use |
| Iterative refinement and responsiveness to user feedback | 17 | iterative-refinement, user-feedback-loop, responsive-to-feedback |
| Comprehensive verification | 11 | comprehensive-verification, thorough-verification, systematic-verification |
| Context gathering and focused scope | 10 | good-context-setting, good-context-gathering, focused-scope |
| Infrastructure automation and configuration discovery | 8 | infrastructure-automation, configuration-discovery |
| Session cleanup and local-only safe commands | 8 | session-cleanup, local-commands-only |
| Architectural and creative problem solving | 6 | architectural-thinking, creative-problem-solving |
| Exact instruction following and systematic approach | 4 | exact-instruction-following, systematic-approach |
| Template reuse | 3 | template-reuse |

## 7. Project Profiles

### app

- **Sessions:** 6
- **Avg prompt quality:** 4.8
- **Avg delegation:** 4.8
- **Primary intents:** testing (5), feature-build (1)
- **Common patterns:** direct-instruction (6)

### claude

- **Sessions:** 1
- **Avg prompt quality:** 1.0
- **Avg delegation:** 0.0
- **Primary intents:** config-setup (1)
- **Common patterns:** error-recovery (1)

### claude-workspace

- **Sessions:** 8
- **Avg prompt quality:** 1.9
- **Avg delegation:** 1.5
- **Primary intents:** other (4), feature-build (3), research (1)
- **Common patterns:** other (4), direct-instruction (2), iterative-refinement + error-recovery (1)

### codev

- **Sessions:** 27
- **Avg prompt quality:** 2.7
- **Avg delegation:** 3.0
- **Primary intents:** feature-build (7), testing (4), exploration (3)
- **Common patterns:** iterative-refinement (8), direct-instruction (7), other (5)

### codev--tasks

- **Sessions:** 2
- **Avg prompt quality:** 2.5
- **Avg delegation:** 2.5
- **Primary intents:** bug-fix (1), other (1)
- **Common patterns:** direct-instruction (1), exploratory-dialogue (1)

### dev

- **Sessions:** 3
- **Avg prompt quality:** 3.0
- **Avg delegation:** 3.0
- **Primary intents:** config-setup (2), other (1)
- **Common patterns:** direct-instruction (2), error-recovery (1)

### dev-codev

- **Sessions:** 4
- **Avg prompt quality:** 1.7
- **Avg delegation:** 2.0
- **Primary intents:** config-setup (2), other (1), bug-fix (1)
- **Common patterns:** config-setup (2), other (1), iterative-refinement (1)

### dosbox

- **Sessions:** 1
- **Avg prompt quality:** 3.0
- **Avg delegation:** 4.0
- **Primary intents:** research (1)
- **Common patterns:** exploratory-dialogue (1)

### dost

- **Sessions:** 29
- **Avg prompt quality:** 3.2
- **Avg delegation:** 3.4
- **Primary intents:** feature-build (7), other (4), research (4)
- **Common patterns:** exploratory-dialogue (9), delegation-chain (5), error-recovery (5)

### eoe

- **Sessions:** 35
- **Avg prompt quality:** 3.4
- **Avg delegation:** 3.6
- **Primary intents:** planning (9), deployment (5), feature-build (5)
- **Common patterns:** direct-instruction (12), exploratory-dialogue (10), iterative-refinement (4)

### fns-doc-generator

- **Sessions:** 3
- **Avg prompt quality:** 3.0
- **Avg delegation:** 3.5
- **Primary intents:** feature-build (1), other (1), refactor (1)
- **Common patterns:** iterative-refinement (1), context-reset (1), direct-instruction (1)

### home

- **Sessions:** 13
- **Avg prompt quality:** 2.5
- **Avg delegation:** 2.8
- **Primary intents:** other (4), exploration (3), bug-fix (3)
- **Common patterns:** exploratory-dialogue (5), direct-instruction (5), error-recovery (2)

### opt-telegram-mcp-server

- **Sessions:** 1
- **Avg prompt quality:** 1.0
- **Avg delegation:** 1.0
- **Primary intents:** config-setup (1)
- **Common patterns:** exploration (1)

### opus-rework

- **Sessions:** 14
- **Avg prompt quality:** 3.1
- **Avg delegation:** 3.1
- **Primary intents:** other (4), config-setup (2), planning (2)
- **Common patterns:** other (5), direct-instruction (3), error-recovery (2)

### remove-browser-tests

- **Sessions:** 9
- **Avg prompt quality:** 2.8
- **Avg delegation:** 2.8
- **Primary intents:** feature-build (3), other (2), cleanup (2)
- **Common patterns:** exploration (2), error-recovery (2), exploratory-dialogue (2)

### root

- **Sessions:** 1
- **Avg prompt quality:** 5.0
- **Avg delegation:** 5.0
- **Primary intents:** other (1)
- **Common patterns:** direct-instruction (1)

### strudel

- **Sessions:** 1
- **Avg prompt quality:** 2.0
- **Avg delegation:** 4.0
- **Primary intents:** config-setup (1)
- **Common patterns:** error-recovery (1)

### tesla

- **Sessions:** 1141
- **Avg prompt quality:** 2.8
- **Avg delegation:** 3.1
- **Primary intents:** other (213), bug-fix (194), feature-build (167)
- **Common patterns:** direct-instruction (242), error-recovery (200), iterative-refinement (190)

### tm

- **Sessions:** 578
- **Avg prompt quality:** 4.1
- **Avg delegation:** 4.3
- **Primary intents:** research (281), data-extraction (76), feature-build (65)
- **Common patterns:** direct-instruction (410), iterative-refinement (45), delegation-chain (40)

### tm-export

- **Sessions:** 4
- **Avg prompt quality:** 1.0
- **Avg delegation:** 1.0
- **Primary intents:** other (4)
- **Common patterns:** error-recovery (4)

### tm-tests

- **Sessions:** 2
- **Avg prompt quality:** 3.5
- **Avg delegation:** 4.0
- **Primary intents:** testing (2)
- **Common patterns:** iterative-refinement (2)

### tools

- **Sessions:** 4
- **Avg prompt quality:** 2.5
- **Avg delegation:** 3.2
- **Primary intents:** deployment (1), exploration (1), bug-fix (1)
- **Common patterns:** direct-instruction (1), exploratory-dialogue (1), error-recovery (1)

### video-okto

- **Sessions:** 4
- **Avg prompt quality:** 4.0
- **Avg delegation:** 4.0
- **Primary intents:** exploration (2), config-setup (1), other (1)
- **Common patterns:** direct-instruction (2), iterative-refinement (1), error-recovery (1)

### vpn-utils

- **Sessions:** 1
- **Avg prompt quality:** 2.0
- **Avg delegation:** 4.0
- **Primary intents:** config-setup (1)
- **Common patterns:** exploratory-dialogue (1)

### x5

- **Sessions:** 3
- **Avg prompt quality:** 3.3
- **Avg delegation:** 3.0
- **Primary intents:** config-setup (2), research (1)
- **Common patterns:** exploratory-dialogue (1), error-recovery (1), iterative-refinement (1)

**Best quality project:** root (5.0)
**Worst quality project:** claude (1.0)

## 8. Temporal Patterns

### Sessions per Month

```
  2025-10                   [######                                  ] 140
  2025-11                   [########################################] 900
  2025-12                   [######                                  ] 139
  2026-01                   [########                                ] 182
  2026-02                   [#######################                 ] 534
```

### Quality Over Time

| Month | Sessions | Avg Prompt Quality | Avg Delegation |
|-------|--------:|---------:|---------:|
| 2025-10 | 140 | 2.9 | 3.4 |
| 2025-11 | 900 | 2.7 | 3.0 |
| 2025-12 | 139 | 3.1 | 3.2 |
| 2026-01 | 182 | 3.4 | 3.6 |
| 2026-02 | 534 | 4.1 | 4.4 |

## 9. Recommendations

*Synthesized via LLM analysis.*

### Top Things to Improve

1. Provide complete context, requirements, and acceptance criteria in the initial prompt rather than revealing them iteratively through clarification loops.
2. Break work sessions longer than 2 hours into multiple focused tasks with explicit checkpoints, intermediate commits, and clear handoff notes.
3. Define concrete success criteria and acceptance tests before starting implementation — not after discovering issues during execution.
4. Ask all clarifying questions upfront before diving into code; avoid discovering ambiguous requirements mid-session through trial and error.
5. Consolidate repeated or similar tasks into a single systematic session instead of spawning multiple near-duplicate sessions on the same problem.

### Top Strengths to Maintain

1. Systematic debugging methodology: consistently traces symptoms to root causes through log analysis, code inspection, and hypothesis testing before applying fixes.
2. Strong testing discipline with comprehensive coverage: writes tests alongside or before implementation, runs full test suites before committing, and adds regression tests after bug fixes.
3. Proper git workflow with atomic commits: maintains clean branch management, writes descriptive commit messages, and pushes after each significant milestone.
4. Effective use of specialized tools (MCP bot testing, TodoWrite, GSD framework): selects the right tool for each context and delegates appropriately to specialized agents.
5. Excellent prompt clarity with concrete BAD/GOOD examples: specifications are unambiguous, schemas are explicit, and constraints are clearly articulated — enabling first-turn execution without clarification.

### Specific Actionable Changes

- Before starting any task, write a 2–3 sentence acceptance criteria statement specifying what 'done' looks like — and only begin implementation after this is agreed upon.
- When a session exceeds 90 minutes or hits a major milestone, pause and create a checkpoint commit with a STATE summary before continuing or starting a new session.
- Replace terse one-liner prompts (e.g., 'fix the bug', 'check this') with structured requests that include: the observed behavior, the expected behavior, relevant file paths or error messages, and any constraints.
- Batch semantically similar tasks (e.g., 8 near-identical data extraction sessions) into a single session with parameterized inputs rather than running sequential near-duplicate sessions.
- Default to English for all technical specifications, prompt instructions, and commit messages — reserving Russian for domain-specific requirements where translation would lose precision.

---

*Report generated by scripts/session-analysis/report.py*