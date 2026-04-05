# LogiFlow — Інновації в транспортній логістиці

Платформа для ефективного розподілу ресурсів між складами та точками доставки в умовах динамічного попиту. Автоматично будує маршрути доставки з пріоритизацією за рівнем критичності потреби.

> **Hackathon**: Lviv Best Hackathon 2026 | **Team**: 503

## Зміст

- [Демо](#демо)
- [Основні можливості](#основні-можливості)
- [Технічний стек](#технічний-стек)
- [Архітектура](#архітектура)
- [Структура проекту](#структура-проекту)
- [Запуск проекту](#запуск-проекту)
- [API документація](#api-документація)
- [Схема бази даних](#схема-бази-даних)
- [Алгоритм маршрутизації](#алгоритм-маршрутизації)
- [Симуляція](#симуляція)
- [Авторизація та доступ](#авторизація-та-доступ)
- [CI/CD](#cicd)

## Демо

- **Frontend**: https://team-503-2026.web.app/
- **Backend API**: https://api-ikacsycdva-ew.a.run.app
- **Swagger API docs**: https://api-ikacsycdva-ew.a.run.app/api

## Основні можливості

### MVP

- **Інтерактивна карта** з відображенням складів, точок доставки та маршрутів (Leaflet)
- **Перерахунок обсягів постачання** при зміні запиту — автоматична перебудова плану доставки при CRUD операціях над запитами
- **5 рівнів критичності** запитів: `urgent` → `critical` → `high` → `medium` → `normal`
- **Двоетапна симуляція**: терміновий план (urgent + critical), стандартний план (high + medium + normal)
- **Алгоритм маршрутизації** — Multi-Depot VRP з жадібною евристикою та пріоритетним сортуванням
- **Захист даних** — JWT автентифікація (Supabase Auth), CSRF захист (Double Submit Cookie), Helmet, rate limiting

### Додаткові завдання

- **Офлайн-режим** — `redux-persist` кешує дані локально; мутації зберігаються в offline queue і автоматично синхронізуються при відновленні зв'язку; UI-індикатор статусу з'єднання
- **Координація між складами та точками** — алгоритм автоматично обирає оптимальне джерело товару (склад або точка з надлишком)
- **Пошук найближчих локацій з товаром** — `GET /geo/nearest` та `GET /geo/nearest-for-point/:pointId` з використанням PostGIS

## Технічний стек

### Frontend

| Технологія      | Версія | Призначення          |
| --------------- | ------ | -------------------- |
| React           | 19     | UI фреймворк         |
| Vite            | 8      | Збірка та dev server |
| TypeScript      | 5      | Типізація            |
| Tailwind CSS    | 4      | Стилі                |
| shadcn/ui       | 4      | UI компоненти        |
| Redux Toolkit   | 2      | Стейт-менеджмент     |
| React Router    | 7      | Маршрутизація        |
| React Leaflet   | 5      | Інтерактивна карта   |
| Supabase JS SDK | 2      | Клієнт авторизації   |
| redux-persist   | 6      | Офлайн кешування     |

### Backend

| Технологія         | Версія | Призначення                              |
| ------------------ | ------ | ---------------------------------------- |
| NestJS             | 11     | API фреймворк                            |
| Prisma             | 7      | ORM (query client)                       |
| PostgreSQL         | 17     | База даних (Supabase)                    |
| PostGIS            | —      | Геолокація, відстані, просторові індекси |
| Swagger            | 11     | Автоматична API документація             |
| Helmet             | 8      | HTTP-заголовки безпеки                   |
| csrf-csrf          | 4      | CSRF захист                              |
| Throttler          | 6      | Rate limiting (3 рівні)                  |
| Firebase Functions | 7      | Хостинг бекенду                          |

### Інфраструктура

- **Supabase** — PostgreSQL БД, Auth, RLS (регіон: eu-central-1)
- **Firebase** — Hosting (фронтенд), Cloud Functions (бекенд, europe-west1)
- **GitHub Actions** — CI/CD (lint, typecheck, автодеплой)
- **Husky + lint-staged** — pre-commit хуки
- **Node.js 24** (`.nvmrc`)

## Архітектура

```
┌─────────────┐     HTTPS/JWT      ┌──────────────────┐     Prisma      ┌──────────────────┐
│   Frontend  │ ──────────────────▶ │   NestJS API     │ ─────────────▶  │  PostgreSQL +    │
│   React     │ ◀────────────────── │   (Firebase Fn)  │ ◀───────────── │  PostGIS         │
│   (SPA)     │     JSON + CSRF    │                  │                 │  (Supabase)      │
└─────────────┘                     └──────────────────┘                 └──────────────────┘
       │                                    │
       │ Supabase JS SDK                    │ Supabase Admin SDK
       ▼                                    ▼
┌──────────────────────────────────────────────────────┐
│                    Supabase Auth                      │
│              JWT (ES256) + RLS policies               │
└──────────────────────────────────────────────────────┘
```

## Структура проекту

```
/
├── api/                          # Backend (NestJS)
│   ├── prisma/
│   │   └── schema.prisma         # Prisma схема (introspected з Supabase)
│   ├── src/
│   │   ├── main.ts               # Entry point (локальна розробка)
│   │   ├── main-firebase.ts      # Entry point (Firebase Functions)
│   │   ├── setup-app.ts          # CORS, Helmet, CSRF, Swagger
│   │   ├── app.module.ts         # Кореневий NestJS модуль
│   │   ├── auth/                 # Автентифікація (Guard, декоратори)
│   │   ├── warehouses/           # Склади (CRUD + stock)
│   │   ├── points/               # Точки доставки (CRUD + stock)
│   │   ├── products/             # Довідник товарів
│   │   ├── delivery-requests/    # Запити на доставку
│   │   ├── delivery-plans/       # Плани доставки (маршрути)
│   │   ├── simulation/           # Двоетапна симуляція
│   │   ├── geo/                  # Геопошук найближчих локацій
│   │   ├── permissions/          # Управління дозволами
│   │   ├── profiles/             # Профілі користувачів
│   │   ├── csrf/                 # CSRF токен
│   │   ├── healthcheck/          # Health check
│   │   ├── prisma/               # Prisma сервіс (глобальний)
│   │   ├── supabase/             # Supabase сервіс
│   │   └── common/               # Shared DTO, helpers, middleware
│   ├── config/default.yaml       # Конфігурація (throttle, CORS)
│   └── .env.example
│
├── www/                          # Frontend (React)
│   ├── src/
│   │   ├── App.tsx               # Роутинг
│   │   ├── main.tsx              # Entry point
│   │   ├── pages/                # Сторінки
│   │   │   ├── MapPage.tsx       # Головна — карта з точками/складами
│   │   │   ├── PointPage.tsx     # Деталі точки доставки
│   │   │   ├── WarehousePage.tsx # Деталі складу
│   │   │   ├── LoginPage.tsx     # Логін
│   │   │   ├── RegisterPage.tsx  # Реєстрація
│   │   │   ├── ProductsPage.tsx  # Управління товарами (admin)
│   │   │   └── PermissionsPage.tsx # Управління дозволами (admin)
│   │   ├── components/           # React компоненти
│   │   ├── store/                # Redux Toolkit + slices
│   │   ├── hooks/                # useSimulation, useOnlineStatus, useTheme
│   │   ├── lib/                  # Supabase клієнт, утиліти
│   │   └── types/                # TypeScript типи
│   └── .env.example
│
├── .github/workflows/            # CI/CD (GitHub Actions)
├── firebase.json                 # Firebase Hosting + Functions
└── .nvmrc                        # Node.js 24
```

## Запуск проекту

### Передумови

- **Node.js 24** (див. `.nvmrc`)
- **Supabase проект** з PostGIS розширенням
- **Firebase проект** (для деплою)

### 1. Клонування

```bash
git clone https://github.com/team-503/lviv-best-hackathon-2026.git
cd lviv-best-hackathon-2026
```

### 2. Backend

```bash
cd api
cp .env.example .env
```

Заповнити `.env`:

```env
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
CSRF_SECRET="your-random-secret"

DATABASE_DIRECT_URL="postgresql://..."    # Supabase Direct URL
DATABASE_URL="postgresql://..."           # Supabase Connection Pooler URL

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_JWT_SECRET="your-jwt-secret"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

```bash
npm install           # також запускає prisma generate через postinstall
npm run dev           # http://localhost:4000
```

Swagger документація буде доступна на `http://localhost:4000/api`.

### 3. Frontend

```bash
cd www
cp .env.example .env
```

Заповнити `.env`:

```env
VITE_API_URL="http://localhost:4000"
```

```bash
npm install
npm run dev           # http://localhost:3000
```

### 4. Оновлення Prisma після змін в БД

```bash
cd api
npx prisma db pull    # introspect нову схему
npx prisma generate   # оновити типи клієнта
npx prisma studio     # GUI для перегляду даних
```

## API документація

Повна інтерактивна документація доступна через **Swagger UI** за адресою `/api`.

### Ендпоінти

Позначки доступу: без позначки — публічний, 🔐 — залогінений, 🔒 read/write — потрібен дозвіл, 🔒 admin — тільки адмін.

#### Profile

| Метод | Ендпоінт       | Доступ   | Опис                     |
| ----- | -------------- | -------- | ------------------------ |
| GET   | `/profile`     | 🔐       | Поточний профіль         |
| GET   | `/admin/users` | 🔒 admin | Список всіх користувачів |

#### Products

| Метод  | Ендпоінт        | Доступ    | Опис                |
| ------ | --------------- | --------- | ------------------- |
| GET    | `/products`     | Публічний | Список всіх товарів |
| POST   | `/products`     | 🔒 admin  | Створити товар      |
| DELETE | `/products/:id` | 🔒 admin  | Видалити товар      |

#### Warehouses (Склади)

| Метод  | Ендпоінт                | Доступ    | Опис                   |
| ------ | ----------------------- | --------- | ---------------------- |
| GET    | `/warehouses`           | Публічний | Всі склади для карти   |
| GET    | `/warehouses/:id`       | 🔒 read   | Деталі складу + запаси |
| POST   | `/warehouses`           | 🔒 admin  | Створити склад         |
| PUT    | `/warehouses/:id`       | 🔒 admin  | Оновити назву/локацію  |
| PATCH  | `/warehouses/:id/stock` | 🔒 write  | Оновити запаси         |
| DELETE | `/warehouses/:id`       | 🔒 admin  | Видалити склад         |

#### Points (Точки доставки)

| Метод  | Ендпоінт                       | Доступ    | Опис                           |
| ------ | ------------------------------ | --------- | ------------------------------ |
| GET    | `/points`                      | Публічний | Всі точки для карти            |
| GET    | `/points/:id`                  | 🔒 read   | Деталі точки + запаси + запити |
| POST   | `/points`                      | 🔒 admin  | Створити точку                 |
| PUT    | `/points/:id`                  | 🔒 admin  | Оновити назву/локацію          |
| PATCH  | `/points/:id/stock`            | 🔒 write  | Оновити мінімальні пороги      |
| DELETE | `/points/:id`                  | 🔒 admin  | Видалити точку                 |
| DELETE | `/points/:id/stock/:productId` | 🔒 write  | Видалити товар зі стоку точки  |

#### Delivery Requests (Запити на доставку)

| Метод  | Ендпоінт                                 | Доступ   | Опис                                      |
| ------ | ---------------------------------------- | -------- | ----------------------------------------- |
| POST   | `/points/:pointId/delivery-requests`     | 🔒 write | Створити запит (тригер перерахунку плану) |
| PUT    | `/points/:pointId/delivery-requests/:id` | 🔒 write | Оновити запит                             |
| DELETE | `/points/:pointId/delivery-requests/:id` | 🔒 write | Видалити запит                            |

#### Delivery Plans (Плани доставки)

| Метод | Ендпоінт                  | Доступ    | Опис                              |
| ----- | ------------------------- | --------- | --------------------------------- |
| GET   | `/delivery-plans/current` | Публічний | Поточний план (urgent + standard) |
| GET   | `/delivery-plans/history` | Публічний | Історія завершених планів         |
| GET   | `/delivery-plans/:id`     | Публічний | Деталі конкретного плану          |

#### Simulation (Симуляція)

| Метод | Ендпоінт              | Доступ    | Опис                        |
| ----- | --------------------- | --------- | --------------------------- |
| GET   | `/simulation/status`  | Публічний | Поточний стан симуляції     |
| POST  | `/simulation/advance` | 🔒 admin  | Просунути на наступний етап |

#### Geo (Геопошук)

| Метод | Ендпоінт                          | Доступ    | Опис                                     |
| ----- | --------------------------------- | --------- | ---------------------------------------- |
| GET   | `/geo/nearest`                    | Публічний | Найближчі локації з конкретним товаром   |
| GET   | `/geo/nearest-for-point/:pointId` | Публічний | Найближчі локації для всіх товарів точки |

#### Permissions (Дозволи)

| Метод  | Ендпоінт                 | Доступ   | Опис            |
| ------ | ------------------------ | -------- | --------------- |
| GET    | `/admin/permissions`     | 🔒 admin | Всі дозволи     |
| POST   | `/admin/permissions`     | 🔒 admin | Додати дозвіл   |
| PUT    | `/admin/permissions/:id` | 🔒 admin | Оновити дозвіл  |
| DELETE | `/admin/permissions/:id` | 🔒 admin | Видалити дозвіл |

## Схема бази даних

PostgreSQL 17 + PostGIS. Міграції керуються через Supabase, Prisma використовується як query client.

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   profiles   │     │  user_permissions │     │   products   │
│──────────────│     │──────────────────│     │──────────────│
│ id (FK auth) │◀───│ user_id          │     │ id           │
│ email        │     │ resource_type    │     │ name         │
│ display_name │     │ resource_id      │     └──────┬───────┘
│ role         │     │ permissions[]    │            │
└──────────────┘     └──────────────────┘            │
                                                     │
┌──────────────┐     ┌──────────────────┐            │
│  warehouses  │────▶│ warehouse_stock  │────────────┘
│──────────────│     │──────────────────│            │
│ id           │     │ warehouse_id     │            │
│ name         │     │ product_id  ─────┼────────────┘
│ location     │     │ quantity         │            │
│ (PostGIS)    │     └──────────────────┘            │
└──────┬───────┘                                     │
       │             ┌──────────────────┐            │
       │             │   point_stock    │────────────┘
       │      ┌─────▶│──────────────────│            │
       │      │      │ point_id         │            │
       │      │      │ product_id  ─────┼────────────┘
       │      │      │ quantity         │
       │      │      │ min_threshold    │
       │      │      └──────────────────┘
       │      │
       │  ┌───┴────────┐   ┌────────────────────┐
       │  │   points    │──▶│ delivery_requests  │──────────┐
       │  │────────────│   │────────────────────│          │
       │  │ id         │   │ id                 │          │
       │  │ name       │   │ point_id           │          │
       │  │ location   │   │ product_id  ───────┼──────────┤
       │  │ (PostGIS)  │   │ quantity           │          │
       │  └────────────┘   │ criticality        │          │
       │                   │ status             │          │
       │                   └────────────────────┘          │
       │                                                    │
┌──────┴───────────┐   ┌──────────────┐   ┌──────────────┐ │
│ delivery_plans   │──▶│ plan_routes  │──▶│ route_stops  │ │
│──────────────────│   │──────────────│   │──────────────│ │
│ id               │   │ id           │   │ id           │ │
│ type (urgent/    │   │ plan_id      │   │ route_id     │ │
│       standard)  │   │ vehicle_no   │   │ stop_order   │ │
│ status           │   └──────────────┘   │ location_type│ │
│ created_at       │                      │ warehouse_id─┼─┤
└──────────────────┘                      │ point_id     │ │
                                          │ product_id ──┼─┘
                                          │ quantity     │
                                          │ action       │
                                          └──────────────┘
```

### Enum типи

```sql
CREATE TYPE criticality_level AS ENUM ('normal', 'medium', 'high', 'critical', 'urgent');
CREATE TYPE request_status     AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE plan_type          AS ENUM ('urgent', 'standard');
CREATE TYPE plan_status        AS ENUM ('draft', 'executing', 'completed');
CREATE TYPE location_type      AS ENUM ('warehouse', 'point');
CREATE TYPE stop_action        AS ENUM ('pickup', 'deliver');
CREATE TYPE resource_type      AS ENUM ('point', 'warehouse');
```

## Алгоритм маршрутизації

Тип задачі: **Multi-Depot VRP** (Vehicle Routing Problem) з пріоритетами. Використовується жадібна евристика з пріоритетним сортуванням.

### Пріоритизація

Двоключове сортування запитів:

1. **Рівень критичності** (спадання): urgent (5) → critical (4) → high (3) → medium (2) → normal (1)
2. **Кількість товару** (спадання): більші обсяги першими

Критичність завжди перемагає кількість. 1 одиниця `critical` обробляється раніше за 1000 одиниць `normal`.

### Алгоритм

1. **Збір та сортування** — активні запити відповідного плану сортуються за пріоритетом
2. **Пошук джерела** — для кожного запиту знаходиться найближчий склад з потрібним товаром (Haversine formula). Якщо жоден склад не має товару — шукається точка з надлишком (щоб не створити дефіцит)
3. **Жадібне призначення** — запити послідовно призначаються на машини з урахуванням вантажопідйомності
4. **Оптимізація маршруту** — зупинки впорядковуються за nearest-neighbor TSP
5. **Перевірка балансу** — гарантія, що жодна точка не залишається в дефіциті

### Приклад

```
Вхід: 2 склади, 3 точки, 5 запитів різної критичності
      2 машини, вантажопідйомність = 15 од.

Машина 1: Склад A → Точка 1
  вантаж: Паливо×10 (critical) + Їжа×5 (normal) = 15

Машина 2: Склад A → Склад B → Точка 3 → Точка 2
  вантаж: Паливо×8 (high) + Ліки×3 (high) + Їжа×2 (normal) = 13
```

## Симуляція

Запускається адміністратором. Кожен виклик `POST /simulation/advance` — один крок:

```
idle → stage1 → stage2 → idle (day+1) → ...
```

| Етап                  | Що виконується   | Рівні критичності          |
| --------------------- | ---------------- | -------------------------- |
| Stage 1 (Терміновий)  | Терміновий план  | `urgent`, `critical`       |
| Stage 2 (Стандартний) | Стандартний план | `high`, `medium`, `normal` |

При виконанні кожного етапу:

- Запаси на складах зменшуються (pickup)
- Запаси на точках збільшуються (deliver)
- Якщо товар вивозиться з іншої точки — запаси там зменшуються
- Виконані запити переходять у статус `completed`

## Авторизація та доступ

**Supabase Auth + NestJS Guard.** Користувач логіниться через Supabase Auth, отримує JWT. Бекенд верифікує токен через `AuthGuard`.

### Рівні доступу

| Рівень      | Хто                             | Можливості                                       |
| ----------- | ------------------------------- | ------------------------------------------------ |
| Публічний   | Всі                             | Healthcheck, список товарів                      |
| Залогінений | Авторизований користувач        | Перегляд карти (маркери)                         |
| `read`      | Користувач з дозволом на ресурс | Перегляд деталей, запасів, запитів               |
| `write`     | Користувач з дозволом на ресурс | Редагування запасів, створення запитів           |
| `admin`     | Адміністратор                   | Повний доступ: CRUD ресурсів, симуляція, дозволи |

### Безпека

- **JWT** — верифікація через Supabase (ES256)
- **CSRF** — Double Submit Cookie pattern (`csrf-csrf`) в production
- **Helmet** — стандартні HTTP-заголовки безпеки
- **Rate Limiting** — 3 рівні: short (3 req/1s), medium (20 req/10s), long (100 req/60s)
- **RLS** — Row Level Security на рівні Supabase для кожної таблиці

## CI/CD

GitHub Actions автоматизує перевірки та деплой:

| Workflow                            | Тригер       | Дія                        |
| ----------------------------------- | ------------ | -------------------------- |
| `check-api.yml`                     | PR           | Lint + typecheck бекенду   |
| `check-www.yml`                     | PR           | Lint + typecheck фронтенду |
| `firebase-functions-merge.yml`      | Merge в main | Деплой Firebase Functions  |
| `firebase-hosting-merge.yml`        | Merge в main | Деплой Firebase Hosting    |
| `firebase-hosting-pull-request.yml` | PR           | Preview деплой фронтенду   |

### Локальні хуки

- **Husky** — pre-commit хуки
- **lint-staged** — Prettier, ESLint, typecheck на staged файлах
