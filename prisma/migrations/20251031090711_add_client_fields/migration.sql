-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "dateOfBirth" DATETIME,
    "preferences" TEXT,
    "notes" TEXT,
    "preferredLocationId" TEXT,
    "registrationSource" TEXT,
    "isAutoRegistered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "clients_preferredLocationId_fkey" FOREIGN KEY ("preferredLocationId") REFERENCES "locations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_clients" ("createdAt", "dateOfBirth", "id", "name", "notes", "phone", "preferences", "updatedAt", "userId") SELECT "createdAt", "dateOfBirth", "id", "name", "notes", "phone", "preferences", "updatedAt", "userId" FROM "clients";
DROP TABLE "clients";
ALTER TABLE "new_clients" RENAME TO "clients";
CREATE UNIQUE INDEX "clients_userId_key" ON "clients"("userId");
CREATE INDEX "clients_name_idx" ON "clients"("name");
CREATE INDEX "clients_phone_idx" ON "clients"("phone");
CREATE INDEX "clients_email_idx" ON "clients"("email");
CREATE INDEX "clients_preferredLocationId_idx" ON "clients"("preferredLocationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
