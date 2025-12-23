# AGENTS (devvit/steppy-scroller)

Локальные инструкции для Devvit-версии Steppy Scroller.

## Версии Devvit

- `devvit`: 0.12.6
- `@devvit/web`: 0.12.6
Источник: `devvit/steppy-scroller/steppy-scroller/package.json`.

## Build метаданные

Сборка всегда включает git SHA через Vite define `__BUILD_SHA__` (см. `src/shared/build-info.ts`).

## Вкатка (Devvit)

Из `devvit/steppy-scroller/steppy-scroller/`:
1) `npm run build`
2) `devvit upload --bump patch`
3) `devvit install r/softwart <app>@<version>`

Тестовый сабреддит: `/r/softwart`.

## Playwright e2e (Devvit)

По умолчанию e2e/smoke открывают пост:
`https://www.reddit.com/r/softwart/comments/1ps7jke/steppyscroller/`.
Переопределение: `DEVVIT_POST_URL="<post url>"`.
GIF запись: `npm run pw:devvit:gif` (параметры `GIF_STEPS`, `GIF_FPS`, `GIF_WIDTH`).

## E2E/GIF нюансы

- Скриншоты и GIF должны включать Devvit WebView UI: используется клип по `shreddit-post`.
- В game frame нет `window.__MCP__` — клики идут по кнопкам `#controls button`.
- Если GIF содержит 1 кадр: обычно UI‑кнопки не появились или рендерятся не в `#controls`.
