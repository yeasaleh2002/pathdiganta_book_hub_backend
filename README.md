# Pathdigonto Book Hub Backend API

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg) ![Express.js](https://img.shields.io/badge/Express.js-v5.x-lightgrey.svg) ![Prisma](https://img.shields.io/badge/Prisma-v5.x-blue.svg) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-blue.svg)

## 📌 Description
A highly scalable, secure, and fully transactional E-commerce backend designed to support millions of concurrent users for the Pathdigonto Book Hub. Built on Node.js, Express, Prisma ORM, and PostgreSQL (NeonDB).

---

## 🛠️ Tech Stack & Architecture
- **Framework**: Node.js + Express.js
- **Database**: PostgreSQL (Hosted on NeonDB Serverless)
- **ORM**: Prisma Client v5
- **Security**: JWT Authentication, Zod Schema Validation, Helmet, Custom Rate Limiters, CORS.
- **Observability**: Winston + Morgan for file-based dual stream logging (Traffic + Errors).

---

## 🚀 Getting Started for New Developers

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A NeonDB PostgreSQL Connection URL
- A Google Cloud Console project (for SSO Client ID)

### 2. Environment Setup
Create a `.env` file in the root directory and copy the following variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# NeonDB PostgreSQL Configuration (Prisma 5 format)
DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?pgbouncer=true&connection_limit=5"
DIRECT_URL="postgresql://<user>:<password>@<host>/<dbname>"

# JWT Tokens
JWT_SECRET="generate_a_secure_random_string_here"
JWT_EXPIRES_IN="7d"

# OAuth Integration
GOOGLE_CLIENT_ID="your_google_id_here"
```

### 3. Install & Database Migration
Run these commands in your terminal:
```bash
# Install all node_modules
npm install

# Push the schema definitions strictly to your database (Make sure NeonDB is empty first)
npx prisma db push

# Generate the Prisma Types for intellisense
npx prisma generate
```

### 4. Running the Server
```bash
# For development (Hot reloads using Nodemon)
npm run dev

# For production
npm start
```

---

## 🛡️ Security Features Implemented
- **Rate Limiting**: `express-rate-limit` enforces 1000 requests/15m globally, but strictly 20 requests/1hr on `/auth` routes to prevent OTP brute-forcing and email spam.
- **Payload Constraints**: Express JSON parser is strictly limited to `1mb` to prevent Server OOM crashes from malicious giant payloads.
- **Pagination Guard**: Prisma dynamically limits `take` to a hard ceiling of `100` preventing memory exhaustion through maliciously massive query params.
- **Atomic Transactions**: All checkouts happen exclusively inside `prisma.$transaction`. Stock cannot be oversold, and points cannot be glitched, even if 100,000 users checkout in the same millisecond.

---

## 📖 Complete API Reference

> **Note**: All endpoints are prefixed with `/api/v1`

### 1. Authentication
| Endpoint | Method | Access | Description | Body / Payload |
|----------|--------|--------|-------------|----------------|
| `/auth/register` | POST | Public | Creates unverified user and sends OTP | `{ "name": "John", "email": "test@example.com", "password": "password123" }` |
| `/auth/verify-registration`| POST | Public | Verifies OTP & Issues JWT | `{ "email": "test@example.com", "otp": "123456" }` |
| `/auth/login` | POST | Public | Login via Password & Issues JWT | `{ "email": "test@example.com", "password": "password123" }` |
| `/auth/google` | POST | Public | Google SSO Login | `{ "idToken": "google_jwt_token" }` |
| `/auth/logout` | POST | Auth | Clears HTTP Cookies | None |

### 2. User & Profile
| Endpoint | Method | Access | Description | Body / Payload |
|----------|--------|--------|-------------|----------------|
| `/users/me` | GET | Auth | Fetch active user profile | None |
| `/users/me` | PUT | Auth | Update name/phone | `{ "name": "John", "phone": "017000000" }` |
| `/addresses` | POST | Auth | Create Shipping Address | `{ "street": "Banani", "city": "Dhaka", "isDefault": true }` |
| `/addresses` | GET | Auth | List own addresses | None |
| `/addresses/:id` | PUT | Auth | Update Address | `{ "street": "Gulshan" }` |
| `/addresses/:id` | DELETE | Auth | Delete Address | None |

### 3. Catalog & Search
| Endpoint | Method | Access | Description | Query Parameters |
|----------|--------|--------|-------------|------------------|
| `/books` | GET | Public | Paginated Catalog Filter | `?limit=20&page=1&sortBy=price_asc&categoryId=<uuid>` |
| `/books/search` | GET | Public | Autocomplete Search | `?q=Harry+Potter` |
| `/books/:id` | GET | Public | Deep nested book data | None |
| `/categories` | GET | Public | List categories | None |
| `/combos` | GET | Public | List combo offers | None |

### 4. Cart (Hybrid Guest & Auth Support)
> Requires header: `Authorization: Bearer <token>` OR `x-session-id: <string>`
| Endpoint | Method | Access | Description | Body / Payload |
|----------|--------|--------|-------------|----------------|
| `/cart` | GET | Both | Fetch Active Cart | None |
| `/cart/add` | POST | Both | Adds/Upserts Cart Item | `{ "bookId": "uuid", "quantity": 1 }` |
| `/cart/update/:id`| PUT | Both | Update existing quantity | `{ "quantity": 3 }` |
| `/cart/remove/:id`| DELETE| Both | Drop item from cart | None |

### 5. Checkout & Orders
| Endpoint | Method | Access | Description | Body / Payload |
|----------|--------|--------|-------------|----------------|
| `/orders/checkout`| POST | Auth | ACID Checkout Transaction | `{ "addressId": "uuid", "paymentMethod": "COD", "pointsUsed": 100, "couponCode": "WINTER50" }` |
| `/orders/my-orders`| GET | Auth | Get user purchase history| None |
| `/orders/:id` | GET | Auth | Order details & Text Invoice| None |

### 6. Reviews
| Endpoint | Method | Access | Description | Body / Payload |
|----------|--------|--------|-------------|----------------|
| `/reviews/books/:id`| GET | Public | Gets approved reviews | None |
| `/reviews` | POST | Auth | Verified Purchase Review | `{ "bookId": "uuid", "rating": 5, "reviewText": "Amazing!" }` |

### 7. Admin Subsystem
> **Requires** an active JWT Token from a User with `role="ADMIN"`.

| Endpoint | Method | Description | Body Example |
|----------|--------|-------------|--------------|
| `/admin/analytics/dashboard`| GET | Get highly optimized DB aggregate revenue stats | None |
| `/admin/books` | POST | Add inventory | `{ "title": "Book Name", "price": 100, "isbn": "1234567890", "imageUrls": ["url"] }` |
| `/admin/combos` | POST | Nested Combo Write | `{ "title": "Dev Pack", "price": 500, "bookIds": ["uuid1", "uuid2"] }` |
| `/admin/orders` | GET | Paginated total history | `?page=1&limit=50` |
| `/admin/orders/:id/status`| PUT | Updates Order Tracking | `{ "status": "SHIPPED", "trackingLink": "https://url.com" }` |
| `/admin/reviews/:id/status`| PUT | Moderate User Reviews | `{ "isApproved": true }` |

---

## 🛠️ Postman Testing
A comprehensive Postman collection JSON is available natively in the root directory: `postman_collection.json`. Import it directly into your Postman client to test all endpoints! It has pre-configured JWT token variables injected into every route.
