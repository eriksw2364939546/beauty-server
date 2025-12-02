# Beauty Server API Documentation

> Документация для интеграции с Next.js 15 (App Router, Server Components)

**Base URL:** `http://localhost:12000/api`

---

## Содержание

1. [Общая информация](#общая-информация)
2. [Типы данных (TypeScript)](#типы-данных-typescript)
3. [Аутентификация](#аутентификация)
4. [Категории](#категории)
5. [Услуги](#услуги)
6. [Работы (Портфолио)](#работы-портфолио)
7. [Мастера](#мастера)
8. [Товары](#товары)
9. [Расценки](#расценки)
10. [Служебные эндпоинты](#служебные-эндпоинты)
11. [Обработка ошибок](#обработка-ошибок)
12. [Примеры для Next.js 15](#примеры-для-nextjs-15)

---

## Общая информация

### Формат ответов

Все успешные ответы имеют структуру:

```typescript
{
  ok: true,
  data: T | T[],
  meta?: {
    page: number,
    limit: number,
    total: number,
    pages: number
  },
  message?: string
}
```

Ошибки возвращаются в формате:

```typescript
{
  ok: false,
  error: string,       // код ошибки
  message: string,     // описание
  details?: object[]   // детали валидации
}
```

### Секции категорий

Категории разделены по секциям:

- `service` — для услуг
- `work` — для работ (портфолио)
- `price` — для расценок
- `product` — для товаров

---

## Типы данных (TypeScript)

```typescript
// ===== BASE TYPES =====

type ObjectId = string; // MongoDB ObjectId (24 hex символа)

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  meta?: PaginationMeta;
  message?: string;
  error?: string;
  details?: ValidationError[];
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ===== MODELS =====

interface Category {
  _id: ObjectId;
  title: string;
  slug: string;
  section: "service" | "work" | "price" | "product";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  image: string;
  category: ObjectId | Category; // populated или ObjectId
  createdAt: string;
  updatedAt: string;
}

interface Work {
  _id: ObjectId;
  service: ObjectId | Service; // populated с category
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Master {
  _id: ObjectId;
  fullName: string;
  speciality: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  code: string; // артикул (уникальный)
  brand: string;
  category: ObjectId | Category;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Price {
  _id: ObjectId;
  title: string;
  description: string;
  price: number;
  service: ObjectId | Service;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: ObjectId;
  email: string;
  role: "admin";
  createdAt: string;
  updatedAt: string;
}

// ===== REQUEST BODIES =====

interface CreateCategoryBody {
  title: string; // 2-100 символов
  section: "service" | "work" | "price" | "product";
  sortOrder?: number; // 0-9999, default: 0
  slug?: string; // auto-generated if not provided
}

interface UpdateCategoryBody {
  title?: string;
  section?: "service" | "work" | "price" | "product";
  sortOrder?: number;
  slug?: string;
}

interface CreateServiceBody {
  title: string; // 2-200 символов
  description: string; // 10-5000 символов
  categoryId: ObjectId; // должна быть секция 'service'
  // image: File - через FormData
}

interface UpdateServiceBody {
  title?: string;
  description?: string;
  categoryId?: ObjectId;
  // image?: File - опционально через FormData
}

interface CreateWorkBody {
  serviceId: ObjectId; // ID существующей услуги
  // image: File - через FormData (обязательно)
}

interface CreateMasterBody {
  fullName: string; // 2-200 символов
  speciality: string; // 2-200 символов
  // image: File - через FormData
}

interface UpdateMasterBody {
  fullName?: string;
  speciality?: string;
  // image?: File - опционально
}

interface CreateProductBody {
  title: string; // 2-200 символов
  description: string; // 10-2000 символов
  price: number; // 0-999999.99
  code: string; // артикул A-Z0-9-, 2-20 символов
  brand: string; // 1-100 символов
  categoryId: ObjectId; // должна быть секция 'product'
  // image: File - через FormData
}

interface UpdateProductBody {
  title?: string;
  description?: string;
  price?: number;
  code?: string;
  brand?: string;
  categoryId?: ObjectId;
  // image?: File - опционально
}

interface CreatePriceBody {
  title: string; // 2-200 символов
  description?: string; // до 1000 символов
  price: number; // 0-999999.99
  serviceId: ObjectId; // ID существующей услуги
  sortOrder?: number; // 0-9999
}

interface UpdatePriceBody {
  title?: string;
  description?: string;
  price?: number;
  serviceId?: ObjectId;
  sortOrder?: number;
}

interface LoginBody {
  email: string;
  password: string;
}

interface UpdateProfileBody {
  email?: string;
  password?: string;
  currentPassword?: string; // обязательно если меняется пароль
}
```

---

## Аутентификация

Админские роуты требуют JWT токен в заголовке `Authorization: Bearer <token>`.

### POST /api/admin/login

Вход в админку.

**Body:**

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response 200:**

```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Успешный вход"
}
```

---

### POST /api/admin/logout

Выход из админки.

**Response 200:**

```json
{
  "ok": true,
  "message": "Успешный выход"
}
```

---

### GET /api/admin/me 🔒

Получить данные текущего админа.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**

```json
{
  "ok": true,
  "data": {
    "_id": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### PUT /api/admin/profile 🔒

Обновить профиль админа.

**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "email": "new@example.com",
  "password": "newPassword",
  "currentPassword": "oldPassword"
}
```

---

### GET /api/admin/verify 🔒

Проверить валидность токена.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**

```json
{
  "ok": true,
  "data": { "valid": true }
}
```

---

### POST /api/admin/init

Инициализация (создание дефолтного админа). Работает только если админов нет в БД.

---

## Категории

### GET /api/categories

Получить все категории.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| section | string | Фильтр по секции: `service`, `work`, `price`, `product` |
| page | number | Номер страницы (default: 1) |
| limit | number | Количество на странице (default: 10, max: 100) |

**Response 200:**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Стрижки",
      "slug": "strizhki",
      "section": "service",
      "sortOrder": 0,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### GET /api/categories/:id

Получить категорию по ID.

**Response 200:**

```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Стрижки",
    "slug": "strizhki",
    "section": "service",
    "sortOrder": 0
  }
}
```

---

### GET /api/categories/slug/:slug

Получить категорию по slug.

---

### POST /api/admin/categories 🔒

Создать категорию.

**Body:**

```json
{
  "title": "Стрижки",
  "section": "service",
  "sortOrder": 0
}
```

**Response 201:**

```json
{
  "ok": true,
  "data": { ... },
  "message": "Категория создана"
}
```

---

### PATCH /api/admin/categories/:id 🔒

Обновить категорию.

**Body (все поля опциональны):**

```json
{
  "title": "Новое название",
  "sortOrder": 5
}
```

---

### DELETE /api/admin/categories/:id 🔒

Удалить категорию.

> ⚠️ Нельзя удалить категорию, если есть связанные сущности.

---

### PATCH /api/admin/categories/:id/sort-order 🔒

Изменить порядок сортировки.

**Body:**

```json
{
  "sortOrder": 5
}
```

---

## Услуги

### GET /api/services

Получить все услуги.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| category | ObjectId | Фильтр по ID категории |
| search | string | Поиск по названию (1-100 символов) |
| page | number | Номер страницы (default: 1) |
| limit | number | Количество (default: 12, max: 100) |
| sort | string | Сортировка: `title`, `-title`, `createdAt`, `-createdAt` |

**Response 200:**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Женская стрижка",
      "slug": "zhenskaya-strizhka",
      "description": "Профессиональная женская стрижка...",
      "image": "/uploads/services/image-123.webp",
      "category": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Стрижки",
        "slug": "strizhki",
        "section": "service"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 12, "total": 50, "pages": 5 }
}
```

---

### GET /api/services/:slug

Получить услугу по slug.

---

### GET /api/services/id/:id

Получить услугу по ID (для админки).

---

### GET /api/services/by-category/:categoryId

Получить услуги по категории.

---

### POST /api/admin/services 🔒

Создать услугу.

**Content-Type:** `multipart/form-data`

**FormData:**
| Поле | Тип | Описание |
|------|-----|----------|
| title | string | Название (2-200 символов) |
| description | string | Описание (10-5000 символов) |
| categoryId | ObjectId | ID категории (секция `service`) |
| image | File | Изображение (JPEG, PNG, WebP, max 5MB) |

**Response 201:**

```json
{
  "ok": true,
  "data": { ... },
  "message": "Услуга создана"
}
```

---

### PATCH /api/admin/services/:id 🔒

Обновить услугу.

**Content-Type:** `multipart/form-data`

Все поля опциональны. Изображение перезаписывается при загрузке нового.

---

### DELETE /api/admin/services/:id 🔒

Удалить услугу.

> ⚠️ Также удаляются связанные работы и файл изображения.

---

## Работы (Портфолио)

### GET /api/works

Получить все работы.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| service | ObjectId | Фильтр по ID услуги |
| category | ObjectId | Фильтр по ID категории |
| page | number | Номер страницы (default: 1) |
| limit | number | Количество (default: 12, max: 50) |

**Response 200:**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "image": "/uploads/works/image-456.webp",
      "service": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Женская стрижка",
        "slug": "zhenskaya-strizhka",
        "category": {
          "_id": "507f1f77bcf86cd799439013",
          "title": "Стрижки",
          "slug": "strizhki"
        }
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": { ... }
}
```

---

### GET /api/works/:id

Получить работу по ID.

---

### GET /api/works/latest

Получить последние работы (для главной).

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| limit | number | Количество (default: 6, max: 20) |

---

### GET /api/works/by-service/:serviceId

Работы по услуге.

---

### GET /api/works/by-category/:categoryId

Работы по категории.

---

### POST /api/admin/works 🔒

Создать работу.

**Content-Type:** `multipart/form-data`

**FormData:**
| Поле | Тип | Описание |
|------|-----|----------|
| serviceId | ObjectId | ID услуги |
| image | File | Изображение (обязательно) |

---

### DELETE /api/admin/works/:id 🔒

Удалить работу.

---

## Мастера

### GET /api/masters

Получить всех мастеров.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| search | string | Поиск по имени/специальности |
| page | number | Номер страницы (default: 1) |
| limit | number | Количество (default: 12, max: 50) |
| sort | string | `fullName`, `-fullName`, `speciality`, `-speciality`, `createdAt`, `-createdAt` |

**Response 200:**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "Анна Иванова",
      "speciality": "Парикмахер-стилист",
      "image": "/uploads/masters/image-789.webp",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": { ... }
}
```

---

### GET /api/masters/:id

Получить мастера по ID.

---

### GET /api/masters/featured

Избранные мастера (для главной).

---

### GET /api/masters/by-speciality

Мастера по специальности.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| speciality | string | Специальность (2-200 символов) |

---

### POST /api/admin/masters 🔒

Создать мастера.

**Content-Type:** `multipart/form-data`

**FormData:**
| Поле | Тип | Описание |
|------|-----|----------|
| fullName | string | ФИО (2-200 символов) |
| speciality | string | Специальность (2-200 символов) |
| image | File | Фото (обязательно) |

---

### PATCH /api/admin/masters/:id 🔒

Обновить мастера.

---

### DELETE /api/admin/masters/:id 🔒

Удалить мастера.

---

## Товары

### GET /api/products

Получить все товары.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| category | ObjectId | Фильтр по категории |
| brand | string | Фильтр по бренду |
| minPrice | number | Минимальная цена |
| maxPrice | number | Максимальная цена |
| search | string | Поиск по названию/описанию |
| page | number | Номер страницы |
| limit | number | Количество (default: 12, max: 100) |
| sort | string | `title`, `-title`, `price`, `-price`, `createdAt`, `-createdAt` |

**Response 200:**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Шампунь профессиональный",
      "slug": "shampun-professionalnyj",
      "description": "Профессиональный шампунь для...",
      "price": 1500,
      "code": "SHP-001",
      "brand": "L'Oreal",
      "category": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Шампуни",
        "slug": "shampuni"
      },
      "image": "/uploads/products/image-111.webp"
    }
  ],
  "meta": { ... }
}
```

---

### GET /api/products/:slug

Товар по slug.

---

### GET /api/products/id/:id

Товар по ID.

---

### GET /api/products/code/:code

Товар по артикулу.

---

### GET /api/products/search

Поиск товаров.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| q | string | Поисковый запрос (2-100 символов) |
| limit | number | Количество (default: 20, max: 50) |

---

### GET /api/products/featured

Рекомендуемые товары.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| limit | number | Количество (default: 8, max: 20) |
| exclude | ObjectId[] | ID товаров для исключения |

---

### GET /api/products/brands

Список всех брендов.

**Response 200:**

```json
{
  "ok": true,
  "data": ["L'Oreal", "Kerastase", "Redken", "Wella"]
}
```

---

### GET /api/products/by-category/:categoryId

Товары по категории.

---

### POST /api/admin/products 🔒

Создать товар.

**Content-Type:** `multipart/form-data`

**FormData:**
| Поле | Тип | Описание |
|------|-----|----------|
| title | string | Название (2-200 символов) |
| description | string | Описание (10-2000 символов) |
| price | number | Цена (0-999999.99) |
| code | string | Артикул (A-Z0-9-, 2-20 символов, уникальный) |
| brand | string | Бренд (1-100 символов) |
| categoryId | ObjectId | ID категории (секция `product`) |
| image | File | Изображение |

---

### PATCH /api/admin/products/:id 🔒

Обновить товар.

---

### DELETE /api/admin/products/:id 🔒

Удалить товар.

---

## Расценки

### GET /api/prices

Получить все расценки.

**Query параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| service | ObjectId | Фильтр по ID услуги |
| category | ObjectId | Фильтр по ID категории |
| search | string | Поиск по названию |
| page | number | Номер страницы |
| limit | number | Количество (default: 50, max: 100) |

**Response 200:**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Стрижка женская",
      "description": "Включает мытьё головы",
      "price": 2500,
      "sortOrder": 0,
      "service": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Женская стрижка",
        "slug": "zhenskaya-strizhka",
        "category": {
          "_id": "...",
          "title": "Стрижки"
        }
      }
    }
  ],
  "meta": { ... }
}
```

---

### GET /api/prices/:id

Расценка по ID.

---

### GET /api/prices/grouped

Расценки сгруппированные по услугам.

**Response 200:**

```json
{
  "ok": true,
  "data": [
    {
      "service": {
        "_id": "...",
        "title": "Женская стрижка",
        "slug": "zhenskaya-strizhka",
        "category": { ... }
      },
      "items": [
        {
          "_id": "...",
          "title": "Короткие волосы",
          "description": "",
          "price": 2000,
          "sortOrder": 0
        },
        {
          "_id": "...",
          "title": "Длинные волосы",
          "description": "",
          "price": 3000,
          "sortOrder": 1
        }
      ]
    }
  ]
}
```

---

### GET /api/prices/by-category/:categoryId

Расценки по категории.

---

### POST /api/admin/prices 🔒

Создать расценку.

**Body:**

```json
{
  "title": "Стрижка женская",
  "description": "Включает мытьё головы",
  "price": 2500,
  "serviceId": "507f1f77bcf86cd799439012",
  "sortOrder": 0
}
```

---

### PATCH /api/admin/prices/:id 🔒

Обновить расценку.

---

### DELETE /api/admin/prices/:id 🔒

Удалить расценку.

---

### PATCH /api/admin/prices/:id/sort-order 🔒

Изменить порядок сортировки.

**Body:**

```json
{
  "sortOrder": 5
}
```

---

## Служебные эндпоинты

### GET /api

Информация об API.

```json
{
  "ok": true,
  "message": "Beauty Server API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /api/health

Health check.

```json
{
  "ok": true,
  "status": "healthy",
  "uptime": 12345.67,
  "memory": { ... },
  "timestamp": "..."
}
```

---

### GET /api/info

Информация о сервере.

---

## Обработка ошибок

### HTTP статусы

| Код | Описание                                   |
| --- | ------------------------------------------ |
| 200 | Успех                                      |
| 201 | Создано                                    |
| 400 | Ошибка валидации / Bad Request             |
| 401 | Не авторизован                             |
| 403 | Доступ запрещён                            |
| 404 | Не найдено                                 |
| 409 | Конфликт (дубликат, есть связанные данные) |
| 500 | Внутренняя ошибка сервера                  |

### Коды ошибок

```typescript
// Валидация
"validation_error"; // Ошибка валидации данных

// Аутентификация
"invalid_credentials"; // Неверный email или пароль
"invalid_token"; // Неверный токен
"token_expired"; // Токен истёк
"unauthorized"; // Требуется авторизация

// Сущности
"not_found"; // Сущность не найдена
"duplicate_error"; // Дубликат уникального поля
"create_error"; // Ошибка создания
"update_error"; // Ошибка обновления
"delete_error"; // Ошибка удаления

// Файлы
"file_upload_error"; // Ошибка загрузки файла
"invalid_image_format"; // Неверный формат изображения
```

### Пример ошибки валидации

```json
{
  "ok": false,
  "error": "validation_error",
  "message": "Ошибка валидации данных",
  "details": [
    {
      "field": "title",
      "message": "Название должно содержать минимум 2 символа",
      "value": "A"
    },
    {
      "field": "categoryId",
      "message": "Некорректный формат ID категории",
      "value": "invalid"
    }
  ]
}
```

---

## Примеры для Next.js 15

### Конфигурация API клиента

```typescript
// lib/api.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:12000/api";

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function api<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    ...fetchOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Не устанавливаем Content-Type для FormData
  if (!(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new ApiError(data.error, data.message, data.details);
  }

  return data;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

---

### Server Component - Список услуг

```typescript
// app/services/page.tsx

import { api } from "@/lib/api";
import { ServiceCard } from "@/components/ServiceCard";

interface Service {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  category: {
    _id: string;
    title: string;
    slug: string;
  };
}

interface ServicesResponse {
  ok: boolean;
  data: Service[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Props {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: Props) {
  const params = await searchParams;

  const queryString = new URLSearchParams();
  if (params.category) queryString.set("category", params.category);
  if (params.page) queryString.set("page", params.page);

  const response = await api<ServicesResponse>(
    `/services?${queryString.toString()}`,
    { next: { revalidate: 60 } } // ISR: обновлять каждые 60 секунд
  );

  return (
    <div>
      <h1>Наши услуги</h1>
      <div className="grid grid-cols-3 gap-4">
        {response.data.map((service) => (
          <ServiceCard key={service._id} service={service} />
        ))}
      </div>
      {/* Пагинация */}
      <Pagination meta={response.meta} />
    </div>
  );
}
```

---

### Server Component - Детальная страница услуги

```typescript
// app/services/[slug]/page.tsx

import { api } from "@/lib/api";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  try {
    const response = await api<{ data: Service }>(`/services/${slug}`);
    return {
      title: response.data.title,
      description: response.data.description,
    };
  } catch {
    return { title: "Услуга не найдена" };
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;

  try {
    const response = await api<{ data: Service }>(`/services/${slug}`, {
      next: { revalidate: 60 },
    });

    const service = response.data;

    // Загружаем работы для этой услуги параллельно
    const worksResponse = await api<{ data: Work[] }>(
      `/works/by-service/${service._id}`
    );

    return (
      <article>
        <h1>{service.title}</h1>
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${service.image}`}
          alt={service.title}
        />
        <p>{service.description}</p>

        <section>
          <h2>Наши работы</h2>
          {worksResponse.data.map((work) => (
            <img key={work._id} src={work.image} alt="" />
          ))}
        </section>
      </article>
    );
  } catch (error) {
    notFound();
  }
}
```

---

### Параллельная загрузка данных

```typescript
// app/page.tsx - Главная страница

import { api } from "@/lib/api";

export default async function HomePage() {
  // Параллельная загрузка всех данных
  const [servicesRes, worksRes, mastersRes, productsRes] = await Promise.all([
    api<{ data: Service[] }>("/services?limit=6"),
    api<{ data: Work[] }>("/works/latest?limit=8"),
    api<{ data: Master[] }>("/masters/featured?limit=4"),
    api<{ data: Product[] }>("/products/featured?limit=6"),
  ]);

  return (
    <main>
      <section>
        <h2>Популярные услуги</h2>
        {servicesRes.data.map((s) => (
          <ServiceCard key={s._id} service={s} />
        ))}
      </section>

      <section>
        <h2>Последние работы</h2>
        {worksRes.data.map((w) => (
          <WorkCard key={w._id} work={w} />
        ))}
      </section>

      <section>
        <h2>Наши мастера</h2>
        {mastersRes.data.map((m) => (
          <MasterCard key={m._id} master={m} />
        ))}
      </section>

      <section>
        <h2>Рекомендуем</h2>
        {productsRes.data.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </section>
    </main>
  );
}
```

---

### Прайс-лист с группировкой

```typescript
// app/prices/page.tsx

import { api } from "@/lib/api";

interface GroupedPrice {
  service: {
    _id: string;
    title: string;
    slug: string;
    category: {
      _id: string;
      title: string;
      slug: string;
    };
  };
  items: {
    _id: string;
    title: string;
    description: string;
    price: number;
    sortOrder: number;
  }[];
}

export default async function PricesPage() {
  const response = await api<{ data: GroupedPrice[] }>(
    "/prices/grouped",
    { next: { revalidate: 300 } } // 5 минут
  );

  return (
    <div>
      <h1>Прайс-лист</h1>

      {response.data.map((group) => (
        <section key={group.service._id}>
          <h2>{group.service.title}</h2>
          <p className="text-sm text-gray-500">
            {group.service.category.title}
          </p>

          <table>
            <tbody>
              {group.items.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td className="font-bold">{item.price} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
```

---

### Server Action для админки

```typescript
// app/admin/services/actions.ts
"use server";

import { api } from "@/lib/api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return { error: "Не авторизован" };
  }

  try {
    const response = await api<{ data: Service }>("/admin/services", {
      method: "POST",
      body: formData, // FormData передаётся напрямую
      token,
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true, data: response.data };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, details: error.details };
    }
    return { error: "Неизвестная ошибка" };
  }
}

export async function deleteService(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return { error: "Не авторизован" };
  }

  try {
    await api(`/admin/services/${id}`, {
      method: "DELETE",
      token,
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Неизвестная ошибка" };
  }
}
```

---

### Форма создания услуги (Client Component)

```typescript
// components/admin/ServiceForm.tsx
"use client";

import { useActionState } from "react";
import { createService } from "@/app/admin/services/actions";

export function ServiceForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      return await createService(formData);
    },
    null
  );

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">Название</label>
        <input
          type="text"
          name="title"
          id="title"
          required
          minLength={2}
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="description">Описание</label>
        <textarea
          name="description"
          id="description"
          required
          minLength={10}
          maxLength={5000}
        />
      </div>

      <div>
        <label htmlFor="categoryId">Категория</label>
        <select name="categoryId" id="categoryId" required>
          <option value="">Выберите категорию</option>
          {categories
            .filter((c) => c.section === "service")
            .map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="image">Изображение</label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </div>

      {state?.error && (
        <div className="text-red-500">
          {state.error}
          {state.details && (
            <ul>
              {state.details.map((d: any, i: number) => (
                <li key={i}>
                  {d.field}: {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button type="submit" disabled={pending}>
        {pending ? "Сохранение..." : "Создать услугу"}
      </button>
    </form>
  );
}
```

---

### Middleware для защиты админских страниц

```typescript
// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Защита админских страниц
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token && !request.nextUrl.pathname.startsWith("/admin/login")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
```

---

### Утилита для работы с изображениями

```typescript
// lib/images.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function getImageUrl(path: string): string {
  if (!path) return "/placeholder.webp";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

// Использование в компоненте:
// <img src={getImageUrl(service.image)} alt={service.title} />
```

---

### Типы для всего проекта

```typescript
// types/api.ts

export type CategorySection = "service" | "work" | "price" | "product";

export interface Category {
  _id: string;
  title: string;
  slug: string;
  section: CategorySection;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Work {
  _id: string;
  service: Service;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Master {
  _id: string;
  fullName: string;
  speciality: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  code: string;
  brand: string;
  category: Category;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  _id: string;
  title: string;
  description: string;
  price: number;
  service: Service;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  ok: true;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface ApiError {
  ok: false;
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}
```

---

## Сводная таблица эндпоинтов

| Метод          | Эндпоинт                              | Доступ | Описание             |
| -------------- | ------------------------------------- | ------ | -------------------- |
| **Auth**       |                                       |        |                      |
| POST           | /api/admin/login                      | Public | Вход                 |
| POST           | /api/admin/logout                     | Public | Выход                |
| GET            | /api/admin/me                         | 🔒     | Текущий пользователь |
| PUT            | /api/admin/profile                    | 🔒     | Обновить профиль     |
| GET            | /api/admin/verify                     | 🔒     | Проверить токен      |
| POST           | /api/admin/init                       | Public | Инициализация        |
| **Categories** |                                       |        |                      |
| GET            | /api/categories                       | Public | Все категории        |
| GET            | /api/categories/:id                   | Public | По ID                |
| GET            | /api/categories/slug/:slug            | Public | По slug              |
| POST           | /api/admin/categories                 | 🔒     | Создать              |
| PATCH          | /api/admin/categories/:id             | 🔒     | Обновить             |
| DELETE         | /api/admin/categories/:id             | 🔒     | Удалить              |
| PATCH          | /api/admin/categories/:id/sort-order  | 🔒     | Изменить порядок     |
| **Services**   |                                       |        |                      |
| GET            | /api/services                         | Public | Все услуги           |
| GET            | /api/services/:slug                   | Public | По slug              |
| GET            | /api/services/id/:id                  | Public | По ID                |
| GET            | /api/services/by-category/:categoryId | Public | По категории         |
| POST           | /api/admin/services                   | 🔒     | Создать              |
| PATCH          | /api/admin/services/:id               | 🔒     | Обновить             |
| DELETE         | /api/admin/services/:id               | 🔒     | Удалить              |
| **Works**      |                                       |        |                      |
| GET            | /api/works                            | Public | Все работы           |
| GET            | /api/works/:id                        | Public | По ID                |
| GET            | /api/works/latest                     | Public | Последние            |
| GET            | /api/works/by-service/:serviceId      | Public | По услуге            |
| GET            | /api/works/by-category/:categoryId    | Public | По категории         |
| POST           | /api/admin/works                      | 🔒     | Создать              |
| DELETE         | /api/admin/works/:id                  | 🔒     | Удалить              |
| **Masters**    |                                       |        |                      |
| GET            | /api/masters                          | Public | Все мастера          |
| GET            | /api/masters/:id                      | Public | По ID                |
| GET            | /api/masters/featured                 | Public | Избранные            |
| GET            | /api/masters/by-speciality            | Public | По специальности     |
| POST           | /api/admin/masters                    | 🔒     | Создать              |
| PATCH          | /api/admin/masters/:id                | 🔒     | Обновить             |
| DELETE         | /api/admin/masters/:id                | 🔒     | Удалить              |
| **Products**   |                                       |        |                      |
| GET            | /api/products                         | Public | Все товары           |
| GET            | /api/products/:slug                   | Public | По slug              |
| GET            | /api/products/id/:id                  | Public | По ID                |
| GET            | /api/products/code/:code              | Public | По артикулу          |
| GET            | /api/products/search                  | Public | Поиск                |
| GET            | /api/products/featured                | Public | Рекомендуемые        |
| GET            | /api/products/brands                  | Public | Список брендов       |
| GET            | /api/products/by-category/:categoryId | Public | По категории         |
| POST           | /api/admin/products                   | 🔒     | Создать              |
| PATCH          | /api/admin/products/:id               | 🔒     | Обновить             |
| DELETE         | /api/admin/products/:id               | 🔒     | Удалить              |
| **Prices**     |                                       |        |                      |
| GET            | /api/prices                           | Public | Все расценки         |
| GET            | /api/prices/:id                       | Public | По ID                |
| GET            | /api/prices/grouped                   | Public | Сгруппированные      |
| GET            | /api/prices/by-category/:categoryId   | Public | По категории         |
| POST           | /api/admin/prices                     | 🔒     | Создать              |
| PATCH          | /api/admin/prices/:id                 | 🔒     | Обновить             |
| DELETE         | /api/admin/prices/:id                 | 🔒     | Удалить              |
| PATCH          | /api/admin/prices/:id/sort-order      | 🔒     | Изменить порядок     |
| **System**     |                                       |        |                      |
| GET            | /api                                  | Public | Информация об API    |
| GET            | /api/health                           | Public | Health check         |
| GET            | /api/info                             | Public | Информация о сервере |

---

**Легенда:**

- 🔒 — требуется авторизация (JWT токен в заголовке `Authorization: Bearer <token>`)
- Public — публичный доступ
