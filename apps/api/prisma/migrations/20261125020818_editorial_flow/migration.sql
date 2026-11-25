-- CreateTable
CREATE TABLE "ProjectDeliverable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectDeliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "editorialContext" TEXT,
    "editorialStage" TEXT NOT NULL DEFAULT 'TOPIC',
    "activeScriptId" TEXT,
    "approvedScriptId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "workspacePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("createdAt", "description", "id", "slug", "status", "title", "updatedAt", "workspacePath") SELECT "createdAt", "description", "id", "slug", "status", "title", "updatedAt", "workspacePath" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE TABLE "new_ScriptDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT '16:9',
    "estimatedDuration" TEXT,
    "description" TEXT,
    "filePath" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "revisionNotes" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScriptDraft_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ScriptDraft" ("body", "createdAt", "id", "isSelected", "projectId", "title", "updatedAt", "variant", "version") SELECT "body", "createdAt", "id", "isSelected", "projectId", "title", "updatedAt", "variant", "version" FROM "ScriptDraft";
DROP TABLE "ScriptDraft";
ALTER TABLE "new_ScriptDraft" RENAME TO "ScriptDraft";
CREATE INDEX "ScriptDraft_projectId_variant_idx" ON "ScriptDraft"("projectId", "variant");
CREATE INDEX "ScriptDraft_projectId_filePath_idx" ON "ScriptDraft"("projectId", "filePath");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ProjectDeliverable_projectId_stage_idx" ON "ProjectDeliverable"("projectId", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDeliverable_projectId_filePath_key" ON "ProjectDeliverable"("projectId", "filePath");
