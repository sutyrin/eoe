# AGENTS (steppy-scroller)

Локальные инструкции для игры Steppy Scroller.

## Важно

Не использовать материалы из `docs/ideas/` при работе над этой игрой.

## TODO (Steppy Scroller)

Если пользователь просит "выполнить следующую задачу", агент начинает с первого пункта ниже и идет по порядку.

- [ ] реализовать механику бесконечной генерации уровня (препятствия, дорога).
- [ ] добавить условия проигрыша (столкновения с препятствиями) и систему набора очков (Score).
- [ ] заменить SVG-заглушки на качественные пиксель-арт ассеты.

## Краткая концепция

Вертикальный лабиринт 4–6 колонок, герой у нижней части экрана, игрок выбирает следующий шаг.
После шага поле сдвигается вниз (игрок визуально идет вверх). Управление в нижней трети экрана.

## E2E smoke (Playwright)

Локально (поднимается dev‑сервер с in-memory Mock API для `/api/state`):
```
cd games/steppy-scroller
npm run test:e2e
```

Vercel smoke (без локального сервера):
```
cd games/steppy-scroller
E2E_BASE_URL="https://steppy-scroller.vercel.app" npm run test:e2e
```

Отладка:
```
PWDEBUG=1 npm run test:e2e
```

Ожидания тестов: `window.__MCP__` доступен, есть `#controls .action`, и есть `#game-root canvas`.

## Каноничные URL (обновлять при деплое)

- Steppy Scroller (Vercel, prod): `https://steppy-scroller.vercel.app` (проверено 2025-12-21)

## Скриншот (вертикальный)

Команда:
```bash
cd games/steppy-scroller
npm run screenshot
```

Результат сохраняется в `games/steppy-scroller/screenshots/` с именем `game-screenshot-<timestamp>.png`.
