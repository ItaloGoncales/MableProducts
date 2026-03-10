# Mable Products API

A production-ready NestJS API for managing products with multidimensional variants (e.g., Flavor × Size combinations).

## Description

This API provides **Create** and **Read** operations for products with complex variant structures. It features automatic option management, transaction-based concurrency control, and comprehensive validation.

### Key Features

- ✅ **CR Operations Only** (Create + Read, no Update/Delete)
- ✅ **Separated Endpoints** (Create product → Add variants separately)
- ✅ **Auto-Option Management** (Automatically extracts options from variants)
- ✅ **Transaction Safety** (Pessimistic locking prevents race conditions)
- ✅ **Soft Delete Support** (deletedAt timestamp)
- ✅ **Pagination & Filters** (status, sellerId, page, limit)
- ✅ **Bearer Token Auth** (Simple token from environment)
- ✅ **Swagger Documentation** (Live API testing at `/api/docs`)
- ✅ **PostgreSQL + Neon** (Cloud database with SSL)

## Tech Stack

- **Framework:** NestJS 10.x
- **Database:** PostgreSQL (Neon cloud)
- **ORM:** TypeORM 0.3.x
- **Validation:** class-validator + class-transformer
- **Documentation:** Swagger/OpenAPI
- **Auth:** Bearer token
- **Language:** TypeScript

## Prerequisites

- Node.js 18+ or 20+
- pnpm (or npm/yarn)
- PostgreSQL database (Neon account recommended)

## Installation

```bash
# Install dependencies
pnpm install
```

## Environment Configuration

Environment files are located in `src/shared/config/`:

```bash
# Development (uses mable_products_test database)
cp src/shared/config/.env.example src/shared/config/.env.development

# Test
cp src/shared/config/.env.example src/shared/config/.env.test

# Production
cp src/shared/config/.env.example src/shared/config/.env.prod
```

### Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3000

# Database (Neon PostgreSQL)
DB_HOST=your-neon-host.neon.tech
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_NAME=mable_products_test  # or mable_products for prod
DB_SSL=true

# Authentication
AUTH_BEARER_TOKEN=your-secret-token
```

## Database Setup

```bash
# Run migrations
pnpm typeorm:run

# Generate new migration (after entity changes)
pnpm typeorm:generate src/database/migrations/MigrationName

# Revert last migration
pnpm typeorm:revert
```

## Running the Application

```bash
# Development mode (with hot reload)
pnpm start:dev

# Production mode
pnpm start:prod

# Debug mode
pnpm start:debug
```

The API will be available at:
- **API:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/health

## API Endpoints

### Health Check

```http
GET /health
```

**Public endpoint** (no authentication required)

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-09T23:40:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### Products

All product endpoints require Bearer token authentication.

#### 1. Create Product

```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chunk Nibbles",
  "slug": "chunk-nibbles",  // optional, auto-generated if not provided
  "status": "draft",        // optional: available, draft, archived
  "sellerId": 2830          // optional
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Chunk Nibbles",
  "slug": "chunk-nibbles",
  "status": "draft",
  "sellerId": 2830,
  "createdAt": "2026-03-09T23:40:00.000Z",
  "updatedAt": "2026-03-09T23:40:00.000Z",
  "deletedAt": null,
  "options": [],
  "variants": []
}
```

#### 2. Add Variants to Product

```http
POST /api/products/:id/variants
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "sku": "WO425",
    "name": "Chunk Nibbles - 4.25 oz, Vanilla (Original)",
    "description": "Our Vanilla (Original) flavor...",
    "priceRetail": 5.49,
    "options": {
      "Flavor": "Vanilla (Original)",
      "Size": "4.25 oz"
    },
    "eachCount": 12,
    "eachSize": 4.25,
    "eachSizeUnit": "oz",
    "eachName": "pouch",
    "eachNamePlural": "pouches",
    "availability": "inStock",
    "position": 0
  },
  {
    "sku": "WO2",
    "name": "Chunk Nibbles - 2 oz, Vanilla (Original)",
    "priceRetail": 3.49,
    "options": {
      "Flavor": "Vanilla (Original)",
      "Size": "2 oz"
    },
    "availability": "inStock",
    "position": 1
  }
]
```

**Response:** `201 Created`

Returns the updated product with auto-managed options and all variants.

**Auto-Option Management:**
The API automatically extracts options from variants:
- Collects unique option names (e.g., "Flavor", "Size")
- Collects unique values for each option
- Creates/updates ProductOption entities
- Sorts values alphabetically

#### 3. List Products

```http
GET /api/products?status=available&sellerId=2830&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status (available, draft, archived)
- `sellerId` (optional): Filter by seller ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

#### 4. Get Single Product

```http
GET /api/products/:id
Authorization: Bearer {token}
```

**Response:** `200 OK`

Returns product with all options and variants.

### Error Responses

```json
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["name must be longer than or equal to 3 characters"],
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Product with ID 123 not found",
  "error": "Not Found"
}

// 409 Conflict
{
  "statusCode": 409,
  "message": "SKU 'WO425' already exists",
  "error": "Conflict"
}
```

## Architecture

### Folder Structure

```
src/
├── shared/                    # Framework-agnostic (future UI ready)
│   ├── config/               # Environment + DB config
│   ├── enums/                # ProductStatus, Availability
│   ├── interfaces/           # IProduct, IProductOption, IProductVariant
│   ├── dtos/                 # PaginatedResponseDto
│   ├── guards/               # AuthGuard
│   └── decorators/           # @Public()
├── products/                  # Products module
│   ├── entities/             # TypeORM entities (implement interfaces)
│   ├── dtos/                 # Request/response DTOs
│   ├── products.module.ts
│   ├── products.service.ts   # Business logic (~280 lines)
│   └── products.controller.ts # REST API endpoints
└── database/
    ├── migrations/           # Version-controlled schema changes
    └── data-source.ts        # TypeORM CLI configuration
```

### Key Design Decisions

1. **Monorepo-Ready:** Interfaces in `src/shared/` for future UI integration
2. **Transaction Safety:** Pessimistic locking prevents race conditions
3. **Update/Merge Strategy:** Reuses option IDs instead of delete/recreate (no ghost IDs)
4. **Internationalization:** Slug normalization handles accented characters (ç→c, á→a)
5. **Type Safety:** Entities implement interfaces throughout

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Deployment

The application is ready for deployment to:
- **Vercel** (recommended for NestJS)
- **AWS** (EC2, ECS, Lambda)
- **Docker** (containerized deployment)
- **Any Node.js hosting**

### Vercel Deployment

1. Create `vercel.json` (if not exists)
2. Set environment variables in Vercel dashboard
3. Deploy: `vercel --prod`

## Documentation

- **Swagger UI:** Available at `/api/docs` in development and test environments
- **Implementation Plan:** See `plans/implementation-plan.md`
- **Development Decisions:** See `plans/development-decisions.md`

## License

This project is [MIT licensed](LICENSE).
