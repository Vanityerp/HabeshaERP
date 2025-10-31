# PostgreSQL Client Repository Deprecation Notice

## ⚠️ DEPRECATED

The PostgreSQL-based client management functions in `lib/db.ts` (clientsRepository) are **DEPRECATED** and should no longer be used.

## Single Source of Truth

**Prisma** is now the single source of truth for all client data management.

### Migration Path

All client data operations should now use:

1. **Prisma Client** directly via `@/lib/prisma`
2. **API Endpoints** that use Prisma:
   - `GET /api/clients` - List all clients
   - `GET /api/clients/[id]` - Get single client
   - `POST /api/clients/create` - Create new client
   - `PUT /api/clients/[id]` - Update client
   - `DELETE /api/clients/[id]` - Delete client

3. **Service Layer** via `lib/services/clients.ts`:
   - `getClients()` - Fetch clients with filters
   - `getClientById(id)` - Get client by ID
   - `getClientByUserId(userId)` - Get client by user ID
   - `createClient(data)` - Create new client
   - `updateClient(id, data)` - Update client
   - `deleteClient(id)` - Delete client
   - `createLoyaltyProgram(clientId)` - Create loyalty program
   - `updateLoyaltyPoints(clientId, points, spent)` - Update loyalty points

## Deprecated Functions

The following functions in `lib/db.ts` are deprecated:

```typescript
// ❌ DEPRECATED - DO NOT USE
export const clientsRepository = {
  findAll: async () => { ... }
  findById: async (id: number) => { ... }
  findByLocation: async (locationId: number) => { ... }
  create: async (client: any) => { ... }
  update: async (id: number, client: any) => { ... }
  delete: async (id: number) => { ... }
}
```

## Updated Prisma Schema

The Prisma Client model now includes all necessary fields:

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
  preferences         String?   // JSON
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

## Migration Steps

If you have code using the old PostgreSQL client repository:

1. **Replace direct database queries** with Prisma client calls
2. **Use the service layer** (`lib/services/clients.ts`) for business logic
3. **Use API endpoints** for client-side operations
4. **Run the migration script** to transfer any remaining PostgreSQL data:
   ```bash
   npx tsx scripts/migrate-client-data-to-prisma.ts
   ```

## Benefits of Single Source of Truth

✅ **Data Consistency** - No more data sync issues between databases
✅ **Type Safety** - Full TypeScript support with Prisma
✅ **Simplified Code** - One database, one schema, one API
✅ **Better Performance** - No need to merge data from multiple sources
✅ **Easier Maintenance** - Single codebase for client management
✅ **Cascade Deletes** - Automatic cleanup of related records

## Questions?

If you have questions about this migration, please refer to:
- Prisma documentation: https://www.prisma.io/docs
- Service layer: `lib/services/clients.ts`
- API documentation: `docs/API_DOCUMENTATION.md`

