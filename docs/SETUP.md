# Setup

## 1. Подготовь Supabase

1. Создай проект в `Supabase`.
2. Открой `SQL Editor`.
3. Выполни содержимое
   [schema.sql](/Users/nikit/Downloads/Ходилка - v1/supabase/schema.sql).
4. В `Authentication` включи `Email`-авторизацию.
5. В `Database -> Replication` или `Database -> Publications` проверь,
   что таблицы `rooms`, `room_players`, `questions`, `answers` входят в
   публикацию `supabase_realtime`.

## 2. Заполни клиентский конфиг

Скопируй шаблон из
[config.example.js](/Users/nikit/Downloads/Ходилка - v1/supabase/config.example.js)
в
[config.js](/Users/nikit/Downloads/Ходилка - v1/supabase/config.js)
и подставь значения из `Project Settings -> API`.

```js
export const SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

`anonKey` можно хранить на клиенте.
`service_role` использовать здесь нельзя.

## 3. Запусти локально

Проект статический.
Достаточно любого HTTP-сервера.

```bash
python3 -m http.server 8080
```

После этого открой [index.html](http://localhost:8080/index.html).
Панель ведущего доступна по
[admin.html](http://localhost:8080/admin.html).
Экран проектора доступен по
[projector.html](http://localhost:8080/projector.html).

## 4. Подготовь вопросы

Загружай JSON-массив в формате, показанном в
[answer-sample.json](/Users/nikit/Downloads/Ходилка - v1/docs/examples/answer-sample.json).

Пример:

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

## 5. Публикация на GitHub Pages

В проекте уже есть workflow
[pages.yml](/Users/nikit/Downloads/Ходилка - v1/.github/workflows/pages.yml).

Остаётся:

1. Создать GitHub-репозиторий.
2. Загрузить проект в ветку `main` или `master`.
3. Включить `Settings -> Pages -> Build and deployment -> GitHub Actions`.

## Ограничения MVP

- Сравнение ответов нормализует регистр, пробелы и знаки,
  но не поддерживает сложные варианты синонимов.
- История игры и отдельный журнал событий не вынесены в отдельный слой.
- Полный realtime-сценарий зависит от корректной настройки
  `Supabase Realtime`.
