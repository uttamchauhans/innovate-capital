/*
  Warnings:

  - Made the column `investmentId` on table `InterestRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InterestRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "investmentId" INTEGER NOT NULL,
    "interestReceived" REAL NOT NULL,
    "profitCredited" REAL NOT NULL,
    "profitDay" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterestRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InterestRecord_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InterestRecord" ("clientId", "createdAt", "id", "interestReceived", "investmentId", "note", "profitCredited", "profitDay") SELECT "clientId", "createdAt", "id", "interestReceived", "investmentId", "note", "profitCredited", "profitDay" FROM "InterestRecord";
DROP TABLE "InterestRecord";
ALTER TABLE "new_InterestRecord" RENAME TO "InterestRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
