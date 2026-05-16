# Setup

## 1. Создай проект Supabase

1. Открой SQL Editor.
2. Выполни содержимое [supabase-schema.sql](/Users/nikit/Downloads/Ходилка%20-%20v1/supabase-schema.sql).
3. В Authentication включи `Email`-авторизацию.

## 2. Заполни конфиг фронтенда

Скопируй значения из `Project Settings -> API` в [supabase-config.js](/Users/nikit/Downloads/Ходилка%20-%20v1/supabase-config.js):

```js
export const SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

`anonKey` можно хранить на клиенте.
`service_role` использовать здесь нельзя.

## 3. Проверка локально

Достаточно любого статического сервера, например:

```bash
python3 -m http.server 8080
```

После этого открой `http://localhost:8080`.

## 4. Публикация на GitHub Pages

В проект уже добавлен workflow [pages.yml](/Users/nikit/Downloads/Ходилка%20-%20v1/.github/workflows/pages.yml).

Остаётся:

1. создать GitHub-репозиторий;
2. загрузить проект в ветку `main` или `master`;
3. в GitHub включить `Settings -> Pages -> Build and deployment -> GitHub Actions`.

После пуша сайт опубликуется автоматически.

## 5. Формат вопросов

Загружай `JSON`-массив:

```json
[
  {
    "prompt": "Столица Франции",
    "answer": "Париж",
    "points": 3
  },
  {
    "prompt": "2 + 2",
    "answer": "4",
    "points": 1
  }
]
```

## MVP-ограничения

- Сравнение ответов сейчас строгое, но с нормализацией регистра, пробелов и знаков.
- Аватарки учеников пока не добавлены.
- История игры и журнал событий пока не сохраняются отдельно.
- Без реального `Supabase`-проекта я не мог проверить полный realtime-сценарий между двумя браузерами.
