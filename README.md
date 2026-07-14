# Pathdigonto Book Hub — Backend API

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg) ![Express.js](https://img.shields.io/badge/Express.js-v5.x-lightgrey.svg) ![Prisma](https://img.shields.io/badge/Prisma-v5.x-blue.svg) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-blue.svg) ![Zod](https://img.shields.io/badge/Zod-Validation-orange.svg)

## 📌 Description

A highly scalable, secure, and fully transactional e-commerce backend for the Pathdigonto Book Hub. Built on **Node.js + Express.js**, **Prisma ORM**, and **PostgreSQL (NeonDB Serverless)**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Node.js + Express.js v5 |
| Database | PostgreSQL (NeonDB Serverless) |
| ORM | Prisma Client v5 |
| Validation | Zod |
| Auth | JWT (Bearer Token) |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Winston + Morgan (dual-stream) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+
- A NeonDB PostgreSQL connection URL
- A Google Cloud project (for Google SSO)

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# NeonDB PostgreSQL (Prisma 5 format)
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?pgbouncer=true&connection_limit=5"
DIRECT_URL="postgresql://<user>:<password>@<host>/<dbname>"

# JWT
JWT_SECRET="generate_a_secure_random_string_here"
JWT_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id_here"
```

### 3. Install & Database Setup

```bash
npm install

# Push schema to your database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Run the Server

```bash
npm run dev     # Development (hot reload via Nodemon)
npm start       # Production
```

---

## 🛡️ Security Features

| Feature | Details |
|---------|---------|
| Rate Limiting | 1000 req/15min globally; strict **20 req/hr** on `/auth` routes |
| Payload Guard | JSON body limited to `1mb` |
| Pagination Guard | Max `take: 100` hard-ceiling in all list queries |
| Atomic Checkout | ACID transactions via `prisma.$transaction` — no overselling possible |
| Auth | JWT Bearer tokens; `isAuthenticated` middleware on protected routes |

---

## 📖 Complete API Reference

> **Base URL**: `http://localhost:5000/api/v1`  
> 🔒 = Requires `Authorization: Bearer <token>` header  
> 🔑 = Requires Admin role JWT

---

### 1. 🔐 Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register — sends OTP email |
| `POST` | `/auth/verify-registration` | Public | Verify OTP → issues JWT |
| `POST` | `/auth/login` | Public | Password login → issues JWT |
| `POST` | `/auth/google` | Public | Google SSO → issues JWT |
| `POST` | `/auth/logout` | 🔒 Auth | Clears session |

#### `POST /auth/register`
```json
// Request Body
{ "name": "John Doe", "email": "test@example.com", "password": "password123" }

// Response 201
{ "success": true, "message": "OTP sent to your email." }
```

#### `POST /auth/verify-registration`
```json
// Request Body
{ "email": "test@example.com", "otp": "123456" }

// Response 200
{ "success": true, "token": "<jwt>", "user": { "id": "uuid", "name": "John", "email": "...", "role": "CUSTOMER" } }
```

#### `POST /auth/login`
```json
// Request Body
{ "email": "test@example.com", "password": "password123" }

// Response 200
{ "success": true, "token": "<jwt>", "user": { "id": "uuid", "name": "John", "email": "...", "role": "CUSTOMER" } }
```

#### `POST /auth/google`
```json
// Request Body
{ "idToken": "<google_id_token>" }

// Response 200
{ "success": true, "token": "<jwt>", "user": { "id": "uuid", "name": "John", "email": "...", "role": "CUSTOMER" } }
```

---

### 2. 👤 User & Profile

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/users/me` | 🔒 Auth | Fetch own profile |
| `PUT` | `/users/me` | 🔒 Auth | Update name / phone |

#### `GET /users/me`
```json
// Response 200
{ "success": true, "user": { "id": "uuid", "name": "John", "email": "...", "phone": "017...", "loyaltyPoints": 120, "role": "CUSTOMER" } }
```

#### `PUT /users/me`
```json
// Request Body (all fields optional)
{ "name": "Jane Doe", "phone": "01712345678" }

// Response 200
{ "success": true, "user": { "id": "uuid", "name": "Jane Doe", "phone": "01712345678" } }
```

---

### 3. 📍 Addresses

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/addresses` | 🔒 Auth | Create shipping address |
| `GET` | `/addresses` | 🔒 Auth | List own addresses |
| `PUT` | `/addresses/:id` | 🔒 Auth | Update address |
| `DELETE` | `/addresses/:id` | 🔒 Auth | Delete address |

#### `POST /addresses`
```json
// Request Body
{ "street": "House 12, Road 5, Banani", "city": "Dhaka", "type": "home", "phoneAlternate": "01812345678", "isDefault": true }

// Response 201
{ "success": true, "address": { "id": "uuid", "street": "...", "city": "Dhaka", "isDefault": true } }
```

#### `GET /addresses`
```json
// Response 200
{ "success": true, "addresses": [ { "id": "uuid", "street": "...", "city": "Dhaka", "isDefault": true } ] }
```

---

### 4. 📚 Catalog — Books

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/books` | Public | Paginated book list with filters |
| `GET` | `/books/new-arrivals` | Public | **Latest 10 books** by date added |
| `GET` | `/books/best-sellers` | Public | **Top 10 books** by units sold |
| `GET` | `/books/search` | Public | Autocomplete search by title |
| `GET` | `/books/:id` | Public | Full book details |
| `GET` | `/categories` | Public | All categories |
| `GET` | `/categories/:slug/books` | Public | Books filtered by category slug |
| `GET` | `/combos` | Public | Active combo offers |

#### `GET /books`
```
// Query Parameters
?page=1          (default: 1)
?limit=20        (default: 20, max: 100)
?sortBy=newest   (options: price_asc | price_desc | title_asc | newest)
?categoryId=uuid (optional UUID filter)
?authorId=uuid   (optional UUID filter)
?publisherId=uuid (optional UUID filter)

// Response 200
{
  "success": true,
  "books": [ { "id": "uuid", "title": "...", "price": 500, "discountPercent": 10, "imageUrls": ["..."], "stock": 100, "category": { "id": "uuid", "name": "Fiction", "slug": "fiction" }, "author": { "id": "uuid", "name": "..." }, "publisher": { "id": "uuid", "name": "..." } } ],
  "meta": { "total": 250, "page": 1, "limit": 20, "totalPages": 13 }
}
```

#### `GET /books/new-arrivals`
```json
// Response 200
{
  "success": true,
  "books": [ { "id": "uuid", "title": "...", "price": 500, "imageUrls": ["..."], "createdAt": "2026-07-14T...", "author": { "name": "..." }, "category": { "name": "...", "slug": "..." }, "publisher": { "name": "..." } } ]
}
```

#### `GET /books/best-sellers`
```json
// Response 200
{
  "success": true,
  "books": [ { "id": "uuid", "title": "...", "price": 500, "imageUrls": ["..."], "totalSold": 342, "author": { "name": "..." }, "category": { "name": "..." }, "publisher": { "name": "..." } } ]
}
```

#### `GET /books/search?q=Harry`
```json
// Response 200
{
  "success": true,
  "books": [ { "id": "uuid", "title": "Harry Potter", "price": 600, "imageUrls": ["..."], "author": { "name": "J.K. Rowling" } } ]
}
```

#### `GET /books/:id`
```json
// Response 200
{
  "success": true,
  "book": { "id": "uuid", "title": "...", "price": 500, "isbn": "978-...", "description": "...", "pages": 320, "language": "English", "stock": 100, "discountPercent": 10, "imageUrls": ["..."], "createdAt": "2026-07-14T...", "category": { ... }, "author": { ... }, "publisher": { ... }, "reviews": [ { "id": "uuid", "rating": 5, "reviewText": "...", "user": { "name": "John" } } ], "comboItems": [ ... ] }
}
```

#### `GET /categories`
```json
// Response 200
{ "success": true, "categories": [ { "id": "uuid", "name": "Fiction", "slug": "fiction" } ] }
```

#### `GET /categories/:slug/books`  *(e.g. `/categories/fiction/books`)*
```json
// Response 200
{
  "success": true,
  "category": { "id": "uuid", "name": "Fiction", "slug": "fiction" },
  "books": [ { "id": "uuid", "title": "...", "price": 500, "imageUrls": ["..."], "author": { "name": "..." }, "publisher": { "name": "..." } } ]
}
```

#### `GET /combos`
```json
// Response 200
{ "success": true, "combos": [ { "id": "uuid", "title": "Dev Pack", "price": 1200, "imageUrls": ["..."], "comboItems": [ { "book": { "id": "uuid", "title": "...", "price": 500, "imageUrls": ["..."] } } ] } ] }
```

---

### 5. 👤 Authors

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/authors` | Public | All authors (A–Z) |
| `GET` | `/authors/top` | Public | **Top 10 authors** by book count |

#### `GET /authors`
```json
// Response 200
{ "success": true, "authors": [ { "id": "uuid", "name": "Humayun Ahmed", "bio": "..." } ] }
```

#### `GET /authors/top`
```json
// Response 200
{ "success": true, "authors": [ { "id": "uuid", "name": "Humayun Ahmed", "bio": "...", "bookCount": 32 } ] }
```

---

### 6. 🏢 Publishers

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/publishers` | Public | All publishers (A–Z) |
| `GET` | `/publishers/top` | Public | **Top 10 publishers** by book count |

#### `GET /publishers`
```json
// Response 200
{ "success": true, "publishers": [ { "id": "uuid", "name": "Anyaprakash", "details": "..." } ] }
```

#### `GET /publishers/top`
```json
// Response 200
{ "success": true, "publishers": [ { "id": "uuid", "name": "Anyaprakash", "details": "...", "bookCount": 45 } ] }
```

---

### 7. 🛒 Cart (Hybrid Guest + Auth)

> Pass `Authorization: Bearer <token>` for logged-in users, **or** `x-session-id: <string>` header for guests.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/cart` | Guest/Auth | Fetch active cart |
| `POST` | `/cart/add` | Guest/Auth | Add / upsert item |
| `PUT` | `/cart/update/:itemId` | Guest/Auth | Update quantity |
| `DELETE` | `/cart/remove/:itemId` | Guest/Auth | Remove item |

#### `POST /cart/add`
```json
// Request Body
{ "bookId": "<book_uuid>", "quantity": 1 }

// Response 200
{ "success": true, "cartItem": { "id": "uuid", "bookId": "...", "quantity": 1 } }
```

#### `PUT /cart/update/:itemId`
```json
// Request Body
{ "quantity": 3 }

// Response 200
{ "success": true, "cartItem": { "id": "uuid", "quantity": 3 } }
```

---

### 8. 📦 Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders/checkout` | 🔒 Auth | Atomic ACID checkout |
| `GET` | `/orders/my-orders` | 🔒 Auth | Purchase history |
| `GET` | `/orders/:id` | 🔒 Auth | Order detail + invoice |

#### `POST /orders/checkout`
```json
// Request Body
{
  "addressId": "<address_uuid>",
  "paymentMethod": "COD",
  "pointsUsed": 100,
  "couponCode": "NEWUSER10"
}
// paymentMethod options: COD | BKASH | NAGAD | CARD
// pointsUsed and couponCode are optional

// Response 201
{ "success": true, "order": { "id": "uuid", "orderNumber": "PBH-20260714-XXXX", "grandTotal": 450, "orderStatus": "NEW" } }
```

#### `GET /orders/my-orders`
```json
// Response 200
{ "success": true, "orders": [ { "id": "uuid", "orderNumber": "...", "grandTotal": 450, "orderStatus": "DELIVERED", "createdAt": "2026-07-14T..." } ] }
```

---

### 9. ⭐ Book Reviews

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/reviews/books/:bookId` | Public | Approved reviews for a book |
| `POST` | `/reviews` | 🔒 Auth | Submit review (verified purchase only) |

#### `GET /reviews/books/:bookId`
```json
// Response 200
{ "success": true, "reviews": [ { "id": "uuid", "rating": 5, "reviewText": "Amazing book!", "user": { "name": "John" } } ] }
```

#### `POST /reviews`
```json
// Request Body
{ "bookId": "<book_uuid>", "rating": 5, "reviewText": "Loved every page!" }
// User must have a DELIVERED order containing this bookId

// Response 201
{ "success": true, "message": "Review submitted and pending approval.", "review": { "id": "uuid", "rating": 5, "isApproved": false } }
```

---

### 10. 🌟 Site Reviews (Testimonials)

> These are **site-level** testimonials, separate from per-book reviews. For use on homepage / landing pages.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/site-reviews` | Public | All approved site testimonials |
| `POST` | `/site-reviews` | 🔒 Auth | Submit a site review (1 per user) |

#### `GET /site-reviews`
```json
// Response 200
{ "success": true, "reviews": [ { "id": "uuid", "rating": 5, "reviewText": "Best book shop!", "createdAt": "2026-07-14T...", "user": { "name": "John" } } ] }
```

#### `POST /site-reviews`
```json
// Request Body
{ "rating": 5, "reviewText": "Pathdigonto has the best collection I have ever seen!" }
// rating: 1–5 (required)
// reviewText: 10–1000 characters (optional)
// Each user can submit only ONE site review

// Response 201
{ "success": true, "message": "Thank you! Your review is pending approval.", "review": { "id": "uuid", "rating": 5, "isApproved": false } }
```

---

### 11. 🔧 Admin Subsystem

> **All admin routes require** `Authorization: Bearer <admin_jwt>` (user with `role = ADMIN`).

#### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/analytics/dashboard` | Revenue stats (today, monthly, total) |
| `GET` | `/admin/analytics/top-selling-books` | Top 10 books by units sold |

```json
// GET /admin/analytics/dashboard — Response 200
{ "success": true, "todaysSales": 15200, "monthlySales": 320000, "totalRevenue": 5400000, "abandonedCarts": 42, "activeOrders": 18, "uniqueVisitors": 12405, "conversionRate": 3.8 }

// GET /admin/analytics/top-selling-books — Response 200
{ "success": true, "books": [ { "id": "uuid", "title": "...", "price": 500, "imageUrls": ["..."], "totalSold": 342 } ] }
```

#### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/books` | Add new book |
| `PUT` | `/admin/books/:id` | Update book |

```json
// POST /admin/books — Request Body
{ "title": "Advanced Prisma Guide", "categoryId": "<uuid>", "authorId": "<uuid>", "publisherId": "<uuid>", "isbn": "978-3-16-148410-0", "price": 500, "stock": 100, "discountPercent": 10, "description": "...", "pages": 320, "language": "English", "imageUrls": ["https://..."] }

// Response 201
{ "success": true, "book": { "id": "uuid", "title": "...", "price": 500, "stock": 100, "createdAt": "..." } }
```

#### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/categories` | Create category |
| `PUT` | `/admin/categories/:id` | Update category |
| `DELETE` | `/admin/categories/:id` | Delete category |

```json
// POST body: { "name": "Science Fiction", "slug": "science-fiction" }
// Response: { "success": true, "category": { "id": "uuid", "name": "Science Fiction", "slug": "science-fiction" } }
```

#### Authors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/authors` | Create author |
| `PUT` | `/admin/authors/:id` | Update author |
| `DELETE` | `/admin/authors/:id` | Delete author |

```json
// POST body: { "name": "Humayun Ahmed", "bio": "Bangladeshi fiction writer." }
// Response: { "success": true, "author": { "id": "uuid", "name": "Humayun Ahmed", "bio": "..." } }
```

#### Publishers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/publishers` | Create publisher |
| `PUT` | `/admin/publishers/:id` | Update publisher |
| `DELETE` | `/admin/publishers/:id` | Delete publisher |

```json
// POST body: { "name": "Anyaprakash", "details": "Leading Bangladeshi publisher." }
// Response: { "success": true, "publisher": { "id": "uuid", "name": "Anyaprakash", "details": "..." } }
```

#### Combos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/combos` | Create combo |
| `DELETE` | `/admin/combos/:id` | Delete combo |

```json
// POST body: { "title": "Developer Pack", "price": 1200, "imageUrls": ["..."], "bookIds": ["<uuid1>", "<uuid2>"] }
// Response: { "success": true, "combo": { "id": "uuid", "title": "Developer Pack", "price": 1200 } }
```

#### Coupons

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/coupons` | Create coupon |
| `GET` | `/admin/coupons` | List all coupons |
| `DELETE` | `/admin/coupons/:id` | Delete coupon |

```json
// POST body: { "code": "NEWUSER10", "type": "PERCENTAGE", "value": 10, "minSpend": 500, "validUntil": "2026-12-31T23:59:59.000Z" }
// type options: PERCENTAGE | FIXED | FREE_DELIVERY
// Response: { "success": true, "coupon": { "id": "uuid", "code": "NEWUSER10", "type": "PERCENTAGE", "value": 10 } }
```

#### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/orders` | All orders (paginated) |
| `PUT` | `/admin/orders/:id/status` | Update order status |

```json
// GET query: ?page=1&limit=50
// Response: { "success": true, "orders": [...], "meta": { "total": 1200, "page": 1 } }

// PUT body: { "status": "SHIPPED", "trackingLink": "https://tracking.example.com/XYZ123" }
// status options: NEW | CONFIRMED | PACKED | SHIPPED | DELIVERED | CANCELLED | RETURNED
// Response: { "success": true, "order": { "id": "uuid", "orderStatus": "SHIPPED", "trackingLink": "..." } }
```

#### Review Moderation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/admin/reviews/:id/status` | Approve/reject book review |
| `GET` | `/admin/site-reviews/pending` | List pending site testimonials |
| `PUT` | `/admin/site-reviews/:id/status` | Approve/reject site review |

```json
// PUT body (both review types): { "isApproved": true }
// Response: { "success": true, "review": { "id": "uuid", "isApproved": true } }

// GET /admin/site-reviews/pending — Response 200
{ "success": true, "reviews": [ { "id": "uuid", "rating": 4, "reviewText": "...", "createdAt": "2026-07-14T...", "user": { "id": "uuid", "name": "John", "email": "john@example.com" } } ] }
```

---

## 🛠️ Postman Testing

A comprehensive Postman collection is available at `postman_collection.json` in the root directory.

**Import → Test:**
1. Open Postman → **Import** → select `postman_collection.json`
2. The collection uses `{{baseUrl}}` (default: `http://localhost:5000`) and `{{jwt_token}}`
3. Run **Login** or **Verify Registration** first — the JWT is automatically saved to `{{jwt_token}}` by the test script
4. All authenticated requests will use it automatically

---

## 📁 Project Structure

```
src/
├── controllers/       # Route handlers (thin layer)
├── services/          # Business logic & Prisma queries
├── routes/            # Express router definitions
├── validations/       # Zod input schemas
├── middlewares/       # Auth, rate limiter, error handler
├── prisma/            # schema.prisma + Prisma client init
└── utils/             # Invoice generator, helpers
```
