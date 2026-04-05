# AI-ассистент для объявлений (Frontend trainee, весна 2026)

Веб-приложение — личный кабинет продавца с AI-подсказками для описаний и оценки цены.  
Стек: **React 18+**, **TypeScript**, **Vite**, **MUI**, **TanStack Query**, **Axios**, **Zustand**, **React Hook Form + Zod**, **Vitest**.

## Требования

- Node.js **20+**
- Для AI: [Ollama](https://ollama.com/) с моделью `llama3` (или другой; см. переменные окружения)

## Быстрый старт (локально)

### 1. Backend

```bash
cd server
npm install
npm start
```

API будет на `http://localhost:8080`. Порт задаётся переменной **`PORT`** (по умолчанию 8080).

### 2. Ollama

```bash
ollama pull llama3
ollama serve
```

По умолчанию Ollama слушает `http://127.0.0.1:11434`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте адрес из консоли Vite (обычно `http://localhost:5173`).  
В режиме разработки запросы к Ollama проксируются через Vite: префикс **`/ollama`** → `http://127.0.0.1:11434`.

### Сборка production

```bash
cd frontend
npm run build
npm run preview
```

## Docker Compose

Поднимает backend и статический frontend (nginx на порту **8081**).  
Ollama ожидается **на хосте**; nginx проксирует `/ollama` на `host.docker.internal:11434`.

```bash
docker compose up --build
```

- Backend: `http://localhost:8080`
- UI: `http://localhost:8081`

Перед запуском убедитесь, что Ollama запущена на машине (`ollama serve`).

## Скрипты frontend

| Команда        | Назначение              |
|----------------|-------------------------|
| `npm run dev`  | Режим разработки (Vite) |
| `npm run build`| Сборка                  |
| `npm run lint` | ESLint                  |
| `npm run test` | Vitest (юнит-тесты)     |
| `npm run format` | Prettier              |

## Переменные окружения (frontend)

См. `frontend/.env.example`. Префикс **`VITE_`** обязателен для переменных, попадающих в клиентский бандл.

## Реализованные требования

- Роуты: `/ads`, `/ads/:id`, `/ads/:id/edit`, редирект с `/`.
- Список: поиск, сортировка (новизна / цена / название), фильтры по категории и «только требующие доработок», пагинация по 10 записей, сетка/список.
- Карточка и форма редактирования, черновик в **localStorage**, валидация **Zod**.
- AI: «придумать / улучшить описание», «рыночная цена», **чат с AI** на странице редактирования.
- **Сравнение «Было → Стало»** с подсветкой diff.
- **Тёмная тема** с сохранением в **localStorage** (Zustand persist).
- **TanStack Query**: запросы с `AbortSignal` (отмена при уходе со страницы).
- **Docker Compose** для backend + frontend.
- **Юнит-тесты** (Vitest).

## Принятые решения

1. **Идентификатор в списке** — в ответе `GET /items` добавлено поле `id`, чтобы можно было переходить к карточке (в исходной спецификации контракт был без `id`, что делало навигацию невозможной).
2. **Сортировка по цене** — в backend добавлен `sortColumn=price` (в ТЗ требовалась сортировка по цене, в API изначально были только `title` и `createdAt`).
3. **Переменная порта** — поддержан стандартный **`PORT`** (раньше в коде фигурировал `process.env.port` в нижнем регистре).
4. **Архитектура** — папки `api/`, `components/`, `helpers/`, `pages/`, `schemas/`, `store/`, `theme/`, `types/` по рекомендациям из материалов Авито.

## Полезные ссылки

- [Макет Figma](https://www.figma.com/design/mkeo1cvzQpEqmN3txeDNBo/%D0%9C%D0%B0%D0%BA%D0%B5%D1%82-%D1%82%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%BE%D0%B3%D0%BE-%D0%B7%D0%B0%D0%B4%D0%B0%D0%BD%D0%B8%D1%8F-%D1%81%D1%82%D0%B0%D0%B6%D1%91%D1%80%D0%B0%D0%BC?node-id=16-1388&p=f&t=outUVTh9O2CIiDpq-0)
- Скриншоты макетов в задании: [list](https://github.com/avito-tech/tech-internship/blob/main/Tech%20Internships/Frontend/Frontend-trainee-assignment-spring-2026/list.png), [item](https://github.com/avito-tech/tech-internship/blob/main/Tech%20Internships/Frontend/Frontend-trainee-assignment-spring-2026/item.png), [форма](https://github.com/avito-tech/tech-internship/blob/main/Tech%20Internships/Frontend/Frontend-trainee-assignment-spring-2026/item_form.png)
