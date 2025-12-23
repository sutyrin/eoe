# AGENTS (devvit/steppy-scroller)

Локальные инструкции для Devvit-версии Steppy Scroller.

## Версии Devvit

- `devvit`: 0.12.6
- `@devvit/web`: 0.12.6
Источник: `devvit/steppy-scroller/steppy-scroller/package.json`.

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
