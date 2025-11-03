# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Vanity Hub** (aka HabeshaERP) is a production-ready salon and spa management system built with Next.js 15, TypeScript, and modern web technologies. It's designed for scalability with multi-location support, role-based access control, and comprehensive business management features.

## Common Development Commands

### Development
```powershell
# Start development server
npm run dev

# Start development server with clean port
npm run clean-start
```

### Database Operations
```powershell
# Generate Prisma client (run after schema changes)
npm run db:generate

# Apply schema changes to database
npm run db:migrate

# Seed database with initial data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database and reseed
npm run db:reset

# Setup database for specific environment
npm run db:setup:dev    # Development
npm run db:setup:prod   # Production
npm run db:setup:test   # Testing

# Deploy migrations (production)
npm run db:migrate:deploy
```

### Testing
```powershell
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests with Playwright
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run all test suites
npm run test:all
```

### Linting & Code Quality
```powershell
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Run Next.js linter
npm run lint:next
```

### Building
```powershell
# Build for production
npm run build

# Start production server
npm start
```

## High-Level Architecture

### Technology Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js (authentication)
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Caching**: Redis (optional, with memory fallback)
- **State Management**: React Context API + Custom Providers
- **Forms**: React Hook Form + Zod validation

### Database Architecture

The database uses **PostgreSQL** via **Neon** (cloud-based) and is managed by **Prisma ORM**. Key points:

- **Authentication**: Uses raw PostgreSQL queries (`lib/pg-auth.ts`) to bypass Prisma Data Proxy issues in production
- **Schema Location**: `prisma/schema.prisma`
- **Connection**: Direct PostgreSQL connection with SSL for Neon
- **Transaction Tracking**: All client transactions are stored in the `Transaction` model with COMPLETED status counting toward total spent

### Key Design Patterns

#### 1. Provider-Based State Management
The application uses React Context providers extensively for state management. All providers follow a consistent pattern:

- Located in `lib/` directory (e.g., `client-provider.tsx`, `staff-provider.tsx`)
- Provide global state and CRUD operations for their domain
- Include local state + API synchronization
- Export custom hooks (e.g., `useClients()`)

**Important**: When working with data, prefer using the provider's methods over direct API calls for consistency.

#### 2. API Route Structure
All API routes are in `app/api/`. The structure follows Next.js 15 conventions:

```
app/api/
├── clients/          # Client management
├── appointments/     # Booking system
├── staff/           # Staff management
├── products/        # Inventory
├── transactions/    # Financial records
└── auth/           # Authentication endpoints
```

#### 3. Authentication Flow
- **NextAuth.js** with Credentials provider
- Custom authentication in `auth.ts` (root)
- Uses `lib/pg-auth.ts` for direct PostgreSQL queries
- Session stored in JWT with user role and location access
- Middleware protection in `middleware.ts`

**Production Note**: When deploying, ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set in Vercel environment variables.

#### 4. Role-Based Access Control (RBAC)
Four user roles with hierarchical permissions:
- **CLIENT**: Access to own appointments and portal
- **STAFF**: Access to appointments, clients, services
- **MANAGER**: Full location management
- **ADMIN**: System-wide access, all locations

Location access is stored in `session.user.locations` - ADMIN has `["all"]`, others have specific location IDs.

### Critical Code Locations

#### Authentication & Security
- **Auth Config**: `auth.ts` (root)
- **PostgreSQL Auth**: `lib/pg-auth.ts`
- **Middleware**: `middleware.ts`
- **Session Types**: `types/next-auth.d.ts`

#### Data Providers (State Management)
- **Clients**: `lib/client-provider.tsx`
- **Staff**: `lib/staff-provider.tsx` or `lib/unified-staff-provider.tsx`
- **Products**: `lib/product-provider.tsx`
- **Locations**: `lib/location-provider.tsx`
- **Services**: `lib/service-provider.tsx`
- **Transactions**: `lib/transaction-provider.tsx`

#### Database
- **Schema**: `prisma/schema.prisma`
- **Seed Script**: `prisma/seed.ts`
- **Migrations**: `prisma/migrations/`

#### UI Components
- **Base Components**: `components/ui/` (shadcn/ui)
- **Feature Components**: `components/[feature]/`
- **Forms**: `components/forms/`

### Common Development Patterns

#### Adding a New Feature
1. Define database schema in `prisma/schema.prisma`
2. Run `npm run db:generate` and `npm run db:migrate`
3. Create API routes in `app/api/[feature]/`
4. Create provider in `lib/[feature]-provider.tsx`
5. Add UI components in `components/[feature]/`
6. Add route in `app/dashboard/[feature]/` or `app/admin/[feature]/`

#### Working with the Database
- **Always** use Prisma for type-safe queries
- **Exception**: Authentication uses raw PostgreSQL (see `lib/pg-auth.ts`)
- Use transactions for multi-step operations
- Index frequently queried fields
- Use cascade deletes for dependent data

#### API Development
- All API routes return JSON with consistent structure
- Use Zod schemas for validation (`lib/validation/`)
- Include error handling and logging
- Implement rate limiting for sensitive endpoints
- Return proper HTTP status codes

#### Testing Strategy
- **Unit Tests**: Test utilities and business logic
- **Integration Tests**: Test API endpoints with database
- **E2E Tests**: Test complete user workflows with Playwright
- Mock external services (email, SMS) in tests
- Use test database for integration tests

## Project-Specific Conventions

### File Naming
- **Components**: PascalCase (`ClientForm.tsx`)
- **Utilities**: kebab-case (`data-fetching.ts`)
- **Hooks**: camelCase with 'use' prefix (`useClientData.ts`)
- **API Routes**: kebab-case (`route.ts` in feature folders)

### TypeScript
- Strict mode enabled
- Path alias: `@/` maps to project root
- Type definitions in `types/` directory
- Avoid `any` - use `unknown` or proper typing

### Environment Variables
Required variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `NEXTAUTH_SECRET`: Session encryption key
- `NEXTAUTH_URL`: Application URL (http://localhost:3000 for dev)
- `REDIS_URL`: Optional Redis cache URL
- `NODE_ENV`: Environment (development/production)

### Default Credentials
After seeding database:
- **Admin**: `admin@vanityhub.com` / `Admin33#`
- **Manager**: `Tsedey@habeshasalon.com` / `Admin33#`
- **Staff**: Any staff email / `Admin33#`

## Important Notes

### Production Deployment (Vercel)
1. Set all environment variables in Vercel dashboard (see `VERCEL_PRODUCTION_SETUP.md`)
2. **Critical**: Update `NEXTAUTH_URL` to actual deployment URL
3. Database is already seeded and shared between dev/production (Neon)
4. No need to run migrations in production - they're already applied
5. Redis is optional - falls back to memory cache if unavailable

**Required Vercel Environment Variables:**
- `NEXTAUTH_SECRET` - Must match local value
- `NEXTAUTH_URL` - Your actual Vercel URL (e.g., https://habesha-pos.vercel.app)
- `DATABASE_URL` - Neon connection string with pooling
- `DIRECT_URL` - Neon direct connection string
- `USE_MOCK_DATA=false`
- `SKIP_DB_CONNECTION=false`
- `NODE_ENV=production`

### Database Single Source of Truth
- **All data** is persisted in PostgreSQL (Neon)
- Client providers load data from `/api/clients` endpoint
- **No localStorage** - database is authoritative
- Transaction tracking is automatic from sales

### Known Patterns
- **Transaction Creation**: Happens automatically when checkout/POS sale occurs
- **Client Total Spent**: Calculated by summing COMPLETED transactions
- **Staff Locations**: Stored in `StaffLocation` junction table
- **Multi-Location**: All entities can be filtered by location

### Testing Database
- Integration tests should use separate test database
- Set `DATABASE_URL` with test database connection
- Run `npm run db:setup:test` before integration tests

## Documentation Resources

Detailed documentation in `docs/` directory:
- `DEVELOPMENT_STANDARDS.md`: Coding standards and best practices
- `API_DOCUMENTATION.md`: Complete API reference with examples
- `PROJECT_ARCHITECTURE.md`: System architecture and design decisions
- `DATABASE_SCHEMA.md`: Database structure and relationships
- `DEPLOYMENT_GUIDE.md`: Production deployment instructions
- `TESTING_GUIDE.md`: Testing strategies and implementation

## Common Troubleshooting

### Login Issues
- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- Check user exists in database and `isActive = true`
- Password must match seeded password: `Admin33#`
- Email must be lowercase in database queries

### Database Connection Issues
- Ensure PostgreSQL (Neon) is accessible
- Check SSL configuration in connection string
- Verify `DATABASE_URL` includes `sslmode=require`
- Pool connections may need adjustment for high load

### Build Errors
- Run `npm run db:generate` after schema changes
- Clear `.next` folder: `Remove-Item -Recurse -Force .next`
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify all dependencies installed: `npm install`

### Provider State Issues
- Use provider's refresh methods (e.g., `refreshClients()`)
- Check browser console for API errors
- Verify session is valid and not expired
- Clear browser cache and cookies if stale data persists
