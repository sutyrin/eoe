# AGENTS (devvit)

Инструкции применяются при работе в `devvit/`.

## Devvit (минимальные инструкции)

- Каждая игра — отдельное Devvit‑приложение в подкаталоге `devvit/<game-name>/`.
- Создание нового Devvit‑приложения (`devvit new`) требует действия пользователя в браузере; это нормально, нужно просить пользователя сделать это.
- Деплой: `npm run build` → `devvit upload --bump patch` → `devvit install r/softwart <app>@<version>`.
- Тестовый сабреддит: `/r/softwart`.
- Steppy Scroller (Devvit): локальные детали и версия Devvit — `devvit/steppy-scroller/AGENTS.md`.
- Playwright (браузерный тест, требуется логин):
  1) `cd devvit/steppy-scroller/steppy-scroller`
  2) Один раз: `npm run pw:login` → вручную залогиниться в Reddit → Enter (сохранит `playwright/.auth/reddit.json`).
  3) Запуск: `DEVVIT_POST_URL="<post url>" HEADLESS=0 npm run pw:devvit:e2e`.
  Скрипт кликает по центру поста, находит splash iframe, жмет Start и скринит результат в `test-results/devvit/`.
  Для ручной отладки: `DEVTOOLS=1 npm run pw:devvit:e2e` (окно браузера + devtools).

## Devvit (итоги и практика)

В Devvit WebView нельзя встраивать внешние игры через iframe из‑за CSP. Поэтому для реального деплоя игру
нужно собирать прямо в `devvit/<game>/` и отдавать как WebView ассеты из `dist/client`.
Phaser переносится напрямую: `game.html` + `game.ts` + `game.css`, без внешнего хостинга.

Состояние хранится на стороне Devvit backend в Redis через `@devvit/web/server` и доступно по `postId + userId`.
С сервера читаем state только при старте (`/api/init`), а дальше работаем локально; клики меняют state мгновенно,
а сохранение идет в фоне (`/api/save`). Это устраняет гонки и прыжки: ответ сервера не должен перетирать локальное
состояние во время игры.

Создание нового Devvit приложения требует участия пользователя в браузере при `devvit new`. После этого
рекомендуемый путь: собрать ассеты, `devvit upload`, установить в `/r/softwart`, создать пост из меню.
Проверка в браузере вручную: открыть пост → кликнуть по карточке поста (открывает splash) → нажать Start
→ открывается игра (WebView).
