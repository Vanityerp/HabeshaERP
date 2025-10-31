# Client Data Management - Single Source of Truth

## 🎯 Overview

This document describes the refactored client data management system that establishes **Prisma** as the single source of truth for all client data.

## ❌ Previous Architecture (DEPRECATED)

The codebase previously had **THREE separate sources** of client data:

1. **Prisma (SQLite)** - `prisma/schema.prisma` with Client model
2. **PostgreSQL** - `lib/db.ts` with separate clients table
3. **ClientDataService** - localStorage-based mock data service

This caused:
- ❌ Data inconsistency between databases
- ❌ Complex data merging logic in API endpoints
- ❌ Difficult to maintain and debug
- ❌ Risk of data loss or corruption
- ❌ Poor performance due to multiple database queries

## ✅ New Architecture (CURRENT)

**Prisma is now the SINGLE SOURCE OF TRUTH** for all client data.

### Database Schema

```prisma
model Client {
  id                  String    @id @default(cuid())
  userId              String    @unique
  name                String
  phone               String?
  email               String?
  address             String?
  city                String?
  state               String?
  zipCode             String?
  dateOfBirth         DateTime?
  preferences         String?   // JSON data
  notes               String?
  preferredLocationId String?
  registrationSource  String?
  isAutoRegistered    Boolean   @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relationships
  user              User             @relation(...)
  preferredLocation Location?        @relation(...)
  loyaltyProgram    LoyaltyProgram?
  memberships       Membership[]
}
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SOURCE OF TRUTH                    │
│                                                              │
│                    ┌──────────────────┐                     │
│                    │  Prisma Database │                     │
│                    │    (SQLite)      │                     │
│                    └────────┬─────────┘                     │
│                             │                                │
└─────────────────────────────┼────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌───────▼────────┐
        │  Service Layer │         │  API Endpoints │
        │ lib/services/  │         │   /api/clients │
        │   clients.ts   │         │                │
        └───────┬────────┘         └───────┬────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  ClientProvider    │
                    │ (React Context)    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   UI Components    │
                    │  - ClientDirectory │
                    │  - ClientSegments  │
                    │  - etc.            │
                    └────────────────────┘
```

## 📁 File Structure

### Core Files

1. **`prisma/schema.prisma`** - Database schema (SINGLE SOURCE OF TRUTH)
2. **`lib/services/clients.ts`** - Server-side business logic
3. **`lib/client-provider.tsx`** - Client-side state management
4. **`app/api/clients/route.ts`** - GET all clients, POST create
5. **`app/api/clients/[id]/route.ts`** - GET, PUT, DELETE single client
6. **`app/api/clients/create/route.ts`** - POST create new client

### Deprecated Files

1. **`lib/client-data-service.ts`** - ⚠️ DEPRECATED (localStorage service)
2. **`lib/db.ts` (clientsRepository)** - ⚠️ DEPRECATED (PostgreSQL queries)

## 🔄 Migration Guide

### Step 1: Run Prisma Migration

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_client_fields
```

### Step 2: Migrate Data from PostgreSQL

```bash
# Run the migration script
npx tsx scripts/migrate-client-data-to-prisma.ts
```

This script will:
- Fetch all clients from PostgreSQL
- Match them with Prisma clients by name and phone
- Update Prisma clients with PostgreSQL data (address, preferred_location_id, etc.)
- Verify data integrity

### Step 3: Update Your Code

Replace old code patterns with new ones:

#### ❌ OLD (PostgreSQL)
```typescript
import { clientsRepository } from "@/lib/db"

const clients = await clientsRepository.findAll()
const client = await clientsRepository.findById(id)
```

#### ✅ NEW (Prisma)
```typescript
import { prisma } from "@/lib/prisma"

const clients = await prisma.client.findMany({
  include: { user: true, preferredLocation: true }
})
const client = await prisma.client.findUnique({
  where: { id },
  include: { user: true, preferredLocation: true }
})
```

#### ❌ OLD (ClientDataService)
```typescript
import { ClientDataService } from "@/lib/client-data-service"

const clients = ClientDataService.getClients()
```

#### ✅ NEW (API Endpoint)
```typescript
const response = await fetch('/api/clients')
const { clients } = await response.json()
```

#### ✅ NEW (React Hook)
```typescript
import { useClients } from "@/lib/client-provider"

function MyComponent() {
  const { clients, addClient, updateClient } = useClients()
  // ...
}
```

## 🔌 API Endpoints

### GET /api/clients
Fetch all clients with optional location filter.

**Query Parameters:**
- `locationId` (optional) - Filter by preferred location

**Response:**
```json
{
  "clients": [
    {
      "id": "cuid123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+97412345678",
      "address": "123 Main St",
      "city": "Doha",
      "state": "Qatar",
      "preferredLocation": "loc1",
      "segment": "VIP",
      "totalSpent": 5000,
      "preferences": { ... },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/clients/[id]
Fetch a single client by ID.

### POST /api/clients/create
Create a new client.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+97412345678",
  "email": "jane@example.com",
  "address": "456 Oak Ave",
  "city": "Doha",
  "preferredLocation": "loc1",
  "preferences": {
    "preferredStylists": [],
    "preferredServices": [],
    "allergies": []
  }
}
```

### PUT /api/clients/[id]
Update an existing client.

### DELETE /api/clients/[id]
Delete a client (cascade deletes related records).

## 🎨 UI Components

All UI components now use the `useClients()` hook from `ClientProvider`:

- **`components/clients/client-directory.tsx`** - Main client list
- **`components/clients/client-segments.tsx`** - Segmented client views
- **`components/dashboard/optimized-clients-list.tsx`** - Dashboard widget
- **`components/pos/client-search-dialog.tsx`** - POS client search

## ✅ Benefits

1. **Data Consistency** - Single source of truth eliminates sync issues
2. **Type Safety** - Full TypeScript support with Prisma
3. **Performance** - No more merging data from multiple databases
4. **Maintainability** - Simpler codebase, easier to debug
5. **Scalability** - Easier to add new features and fields
6. **Cascade Deletes** - Automatic cleanup of related records
7. **Relationships** - Proper foreign key relationships
8. **Indexing** - Optimized queries with database indexes

## 🧪 Testing

After migration, verify:

1. ✅ Client list displays correctly
2. ✅ Client creation works
3. ✅ Client updates persist
4. ✅ Client deletion works
5. ✅ Location filtering works
6. ✅ Search functionality works
7. ✅ Preferences are saved correctly
8. ✅ Loyalty program integration works

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [lib/db-client-deprecation-notice.md](./lib/db-client-deprecation-notice.md)
- [lib/services/clients.ts](./lib/services/clients.ts)
- [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)

## 🚨 Important Notes

- **DO NOT** use `clientsRepository` from `lib/db.ts` - it's deprecated
- **DO NOT** use `ClientDataService` - it's deprecated
- **ALWAYS** use Prisma or the API endpoints for client operations
- **RUN** the migration script before deploying to production
- **TEST** thoroughly after migration

## 🎉 Summary

The client data management system has been successfully refactored to use **Prisma as the single source of truth**. This eliminates data inconsistencies, improves performance, and makes the codebase more maintainable.

All client operations now flow through:
1. **Prisma Database** (single source of truth)
2. **Service Layer** (`lib/services/clients.ts`)
3. **API Endpoints** (`/api/clients/*`)
4. **ClientProvider** (React Context)
5. **UI Components**

This architecture ensures data consistency, type safety, and a better developer experience.

