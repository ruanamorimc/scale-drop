-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "product" TEXT,
    "adAccounts" TEXT[],
    "applyTo" TEXT NOT NULL,
    "filterByName" TEXT,
    "action" TEXT NOT NULL,
    "actionValue" DOUBLE PRECISION,
    "actionUnit" TEXT,
    "budgetLimit" DOUBLE PRECISION,
    "metricsLevel" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "evaluationPeriod" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "executionWindow" TEXT,
    "dailyLimit" INTEGER,
    "dailyExecutionsCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleLog" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rule_workspaceId_idx" ON "Rule"("workspaceId");

-- CreateIndex
CREATE INDEX "Rule_status_idx" ON "Rule"("status");

-- CreateIndex
CREATE INDEX "RuleLog_ruleId_idx" ON "RuleLog"("ruleId");

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleLog" ADD CONSTRAINT "RuleLog_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
