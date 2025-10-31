# Client Data Single Source of Truth - Testing Plan

## 🎯 Overview

This document outlines the testing plan to verify that the client data refactoring to use Prisma as the single source of truth is working correctly.

## ✅ Pre-Testing Checklist

Before running tests, ensure:

- [ ] Prisma schema has been updated with new client fields
- [ ] Prisma migration has been run: `npx prisma migrate dev --name add_client_fields`
- [ ] Prisma client has been generated: `npx prisma generate`
- [ ] Data migration script has been executed (if migrating from PostgreSQL)
- [ ] Development server is running: `npm run dev`

## 🧪 Test Cases

### 1. API Endpoint Tests

#### 1.1 GET /api/clients - List All Clients

**Test Steps:**
1. Open browser to `http://localhost:3000/api/clients`
2. Verify response contains `{ clients: [...] }`
3. Check that each client has all expected fields:
   - `id`, `name`, `email`, `phone`
   - `address`, `city`, `state`, `zip`
   - `birthday`, `preferredLocation`
   - `preferences`, `notes`
   - `segment`, `totalSpent`
   - `createdAt`, `updatedAt`

**Expected Result:**
- ✅ Status 200
- ✅ Array of clients with complete data
- ✅ No PostgreSQL data merging errors in console

**Alternative Test (using curl):**
```bash
curl http://localhost:3000/api/clients
```

#### 1.2 GET /api/clients?locationId=loc1 - Filter by Location

**Test Steps:**
1. Open browser to `http://localhost:3000/api/clients?locationId=loc1`
2. Verify only clients with `preferredLocationId: "loc1"` are returned

**Expected Result:**
- ✅ Status 200
- ✅ Filtered list of clients
- ✅ All returned clients have matching location

#### 1.3 GET /api/clients/[id] - Get Single Client

**Test Steps:**
1. Get a client ID from the list endpoint
2. Open browser to `http://localhost:3000/api/clients/{CLIENT_ID}`
3. Verify response contains `{ client: {...} }`
4. Check all fields are populated correctly

**Expected Result:**
- ✅ Status 200
- ✅ Single client object with complete data
- ✅ Includes user relationship data
- ✅ Includes preferred location data

#### 1.4 POST /api/clients/create - Create New Client

**Test Steps:**
1. Use Postman or curl to send POST request:
```bash
curl -X POST http://localhost:3000/api/clients/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "phone": "+97412345678",
    "email": "test@example.com",
    "address": "123 Test St",
    "city": "Doha",
    "state": "Qatar",
    "zip": "12345",
    "preferredLocation": "loc1",
    "birthday": "1990-01-01",
    "preferences": {
      "preferredStylists": [],
      "preferredServices": [],
      "allergies": []
    },
    "notes": "Test client for verification"
  }'
```

**Expected Result:**
- ✅ Status 200
- ✅ Returns created client with generated ID
- ✅ Client appears in GET /api/clients list
- ✅ All fields saved correctly in Prisma database

#### 1.5 PUT /api/clients/[id] - Update Client

**Test Steps:**
1. Get a client ID from the list
2. Send PUT request to update:
```bash
curl -X PUT http://localhost:3000/api/clients/{CLIENT_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "+97499999999",
    "address": "456 Updated Ave"
  }'
```

**Expected Result:**
- ✅ Status 200
- ✅ Returns updated client
- ✅ Changes persist in database
- ✅ `updatedAt` timestamp is updated

#### 1.6 DELETE /api/clients/[id] - Delete Client

**Test Steps:**
1. Create a test client
2. Send DELETE request:
```bash
curl -X DELETE http://localhost:3000/api/clients/{CLIENT_ID}
```
3. Verify client is removed from list

**Expected Result:**
- ✅ Status 200
- ✅ Returns `{ success: true }`
- ✅ Client no longer appears in GET /api/clients
- ✅ Related records (user, loyalty program) are cascade deleted

### 2. UI Component Tests

#### 2.1 Client Directory Component

**Test Steps:**
1. Navigate to `/clients` page
2. Verify client list displays correctly
3. Check that all client cards show:
   - Name, email, phone
   - Segment badge (VIP, Regular, New, At Risk)
   - Total spent
   - Preferred location

**Expected Result:**
- ✅ All clients from Prisma database are displayed
- ✅ No "Loading..." state stuck
- ✅ No console errors about missing data
- ✅ Search functionality works
- ✅ Filter by location works
- ✅ Filter by segment works

#### 2.2 Client Details View

**Test Steps:**
1. Click on a client card
2. Verify client details modal/page opens
3. Check all fields are populated:
   - Personal info (name, email, phone, birthday)
   - Address (address, city, state, zip)
   - Preferences (stylists, services, allergies)
   - Notes
   - Loyalty program info

**Expected Result:**
- ✅ All data displays correctly
- ✅ No missing or undefined fields
- ✅ Edit functionality works
- ✅ Changes save to Prisma database

#### 2.3 Create Client Form

**Test Steps:**
1. Click "Add Client" button
2. Fill out the form with test data
3. Submit the form
4. Verify client is created

**Expected Result:**
- ✅ Form submits successfully
- ✅ New client appears in list immediately
- ✅ All form fields are saved to Prisma
- ✅ User account is created and linked
- ✅ Success message is displayed

#### 2.4 Client Segments View

**Test Steps:**
1. Navigate to client segments page
2. Verify clients are grouped by segment:
   - VIP
   - Regular
   - New
   - At Risk

**Expected Result:**
- ✅ Clients are correctly categorized
- ✅ Segment counts are accurate
- ✅ Can switch between segments
- ✅ Each segment shows correct clients

### 3. Data Integrity Tests

#### 3.1 Verify No Duplicate Data

**Test Steps:**
1. Check Prisma database for clients
2. Check PostgreSQL database for clients (if still exists)
3. Verify no data duplication

**Expected Result:**
- ✅ Prisma has all client data
- ✅ No conflicting data between databases
- ✅ All client operations use Prisma only

#### 3.2 Verify Relationships

**Test Steps:**
1. Get a client from API
2. Verify relationships are populated:
   - `user` relationship
   - `preferredLocation` relationship
   - `loyaltyProgram` relationship

**Expected Result:**
- ✅ All relationships are properly linked
- ✅ Foreign keys are valid
- ✅ Cascade deletes work correctly

#### 3.3 Verify Data Migration

**Test Steps:**
1. Compare client count before and after migration
2. Verify all fields were migrated:
   - Basic info (name, email, phone)
   - Address fields
   - Preferred location
   - Preferences
   - Notes

**Expected Result:**
- ✅ No data loss during migration
- ✅ All fields transferred correctly
- ✅ Data types are correct

### 4. Performance Tests

#### 4.1 Load Time Test

**Test Steps:**
1. Navigate to `/clients` page
2. Measure time to load client list
3. Check browser DevTools Network tab

**Expected Result:**
- ✅ Page loads in < 2 seconds
- ✅ API response time < 500ms
- ✅ No multiple database queries
- ✅ Single source of truth improves performance

#### 4.2 Search Performance

**Test Steps:**
1. Use search functionality with various queries
2. Measure response time

**Expected Result:**
- ✅ Search results appear instantly
- ✅ No lag or freezing
- ✅ Accurate results

### 5. Error Handling Tests

#### 5.1 Invalid Client ID

**Test Steps:**
1. Try to access `/api/clients/invalid-id`

**Expected Result:**
- ✅ Returns 404 Not Found
- ✅ Proper error message

#### 5.2 Missing Required Fields

**Test Steps:**
1. Try to create client without required fields

**Expected Result:**
- ✅ Returns 400 Bad Request
- ✅ Validation error message

#### 5.3 Database Connection Error

**Test Steps:**
1. Simulate database connection failure
2. Verify error handling

**Expected Result:**
- ✅ Returns 500 Internal Server Error
- ✅ Error logged to console
- ✅ User-friendly error message

## 🔍 Console Verification

Check browser console for:

- ✅ No deprecation warnings from `clientsRepository`
- ✅ No deprecation warnings from `ClientDataService`
- ✅ Success messages: "✅ Loaded X clients from Prisma"
- ✅ No PostgreSQL query errors
- ✅ No data merging errors

## 📊 Database Verification

### Using Prisma Studio

```bash
npx prisma studio
```

1. Open Prisma Studio
2. Navigate to `Client` model
3. Verify all fields are populated
4. Check relationships are linked correctly

### Using SQL Query

```bash
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM clients;"
```

## ✅ Final Checklist

After all tests pass:

- [ ] All API endpoints return correct data
- [ ] All UI components display correctly
- [ ] No console errors or warnings
- [ ] No deprecated code is being called
- [ ] Data integrity is maintained
- [ ] Performance is acceptable
- [ ] Error handling works correctly
- [ ] Documentation is up to date

## 🚨 Rollback Plan

If tests fail:

1. Revert API endpoint changes
2. Restore PostgreSQL client queries
3. Re-run data migration script
4. Investigate and fix issues
5. Re-test before deploying

## 📝 Test Results Log

| Test Case | Status | Notes | Date |
|-----------|--------|-------|------|
| GET /api/clients | ⏳ Pending | | |
| GET /api/clients/[id] | ⏳ Pending | | |
| POST /api/clients/create | ⏳ Pending | | |
| PUT /api/clients/[id] | ⏳ Pending | | |
| DELETE /api/clients/[id] | ⏳ Pending | | |
| Client Directory UI | ⏳ Pending | | |
| Client Details UI | ⏳ Pending | | |
| Create Client Form | ⏳ Pending | | |
| Data Integrity | ⏳ Pending | | |
| Performance | ⏳ Pending | | |

## 🎉 Success Criteria

All tests must pass with:
- ✅ No errors in console
- ✅ No deprecation warnings
- ✅ All CRUD operations working
- ✅ UI components displaying correctly
- ✅ Data integrity maintained
- ✅ Performance acceptable

Once all tests pass, the refactoring is complete and ready for production deployment.

