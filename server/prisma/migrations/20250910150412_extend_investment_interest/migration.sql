/*
  Warnings:

  - You are about to drop the column `interestDay` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `principal` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Investment` table. All the data in the column will be lost.
  - Added the required column `amountReceived` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateInvested` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyInterestDay` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "InterestRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "interestReceived" REAL NOT NULL,
    "profitCredited" REAL NOT NULL,
    "profitDay" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterestRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Investment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" INTEGER NOT NULL,
    "amountReceived" REAL NOT NULL,
    "moneyTransferred" REAL,
    "dateInvested" DATETIME NOT NULL,
    "rateMonthly" REAL NOT NULL,
    "dateInterestStart" DATETIME,
    "monthlyInterestDay" INTEGER NOT NULL,
    "interestAmount" REAL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Investment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Investment" ("clientId", "createdAt", "id", "note", "rateMonthly", "updatedAt") SELECT "clientId", "createdAt", "id", "note", "rateMonthly", "updatedAt" FROM "Investment";
DROP TABLE "Investment";
ALTER TABLE "new_Investment" RENAME TO "Investment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
