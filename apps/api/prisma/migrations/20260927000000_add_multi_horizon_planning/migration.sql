-- CreateEnum
CREATE TYPE "PlanHorizon" AS ENUM ('YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "PlanOutcomeState" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED', 'MISSED', 'CANCELLED', 'RESCHEDULED', 'BLOCKED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OutcomeVerificationState" AS ENUM ('PLANNED', 'OBSERVED', 'VERIFIED');

-- AlterTable
ALTER TABLE "DailyPlan" ADD COLUMN "actualOutcomes" TEXT,
ADD COLUMN "expectedOutcomes" TEXT,
ADD COLUMN "primaryObjective" TEXT,
ADD COLUMN "weeklyPlanId" TEXT;

-- AlterTable
ALTER TABLE "WeeklyPlan" ADD COLUMN "actualOutcomes" TEXT,
ADD COLUMN "capacityMinutes" INTEGER NOT NULL DEFAULT 2400,
ADD COLUMN "expectedOutcomes" TEXT,
ADD COLUMN "goalId" TEXT,
ADD COLUMN "monthPlanId" TEXT,
ADD COLUMN "plannedWorkloadMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "projectId" TEXT,
ADD COLUMN "workstreamId" TEXT;

-- CreateTable
CREATE TABLE "YearPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" "TaskPriority" NOT NULL DEFAULT 'P1',
    "expectedOutcomes" TEXT,
    "actualOutcomes" TEXT,
    "notes" TEXT,
    "workstreamId" TEXT,
    "goalId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YearPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearPlanId" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" "TaskPriority" NOT NULL DEFAULT 'P1',
    "expectedOutcomes" TEXT,
    "actualOutcomes" TEXT,
    "notes" TEXT,
    "workstreamId" TEXT,
    "goalId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanOutcome" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "horizon" "PlanHorizon" NOT NULL,
    "yearPlanId" TEXT,
    "monthPlanId" TEXT,
    "weeklyPlanId" TEXT,
    "dailyPlanId" TEXT,
    "workstreamId" TEXT,
    "goalId" TEXT,
    "projectId" TEXT,
    "milestoneId" TEXT,
    "taskId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "plannedMinutes" INTEGER,
    "priority" "TaskPriority" NOT NULL DEFAULT 'P2',
    "expectedResult" TEXT,
    "actualResult" TEXT,
    "outcomeState" "PlanOutcomeState" NOT NULL DEFAULT 'PLANNED',
    "isUserConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "userExplanation" TEXT,
    "rescheduledTo" TIMESTAMP(3),
    "carriedForwardToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanOutcomeEvidence" (
    "id" TEXT NOT NULL,
    "planOutcomeId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "verificationState" "OutcomeVerificationState" NOT NULL DEFAULT 'OBSERVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanOutcomeEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanResultSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "horizon" "PlanHorizon" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "summaryText" TEXT,
    "totalPlanned" INTEGER NOT NULL DEFAULT 0,
    "totalCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalPartial" INTEGER NOT NULL DEFAULT 0,
    "totalMissed" INTEGER NOT NULL DEFAULT 0,
    "totalBlocked" INTEGER NOT NULL DEFAULT 0,
    "totalRescheduled" INTEGER NOT NULL DEFAULT 0,
    "totalCancelled" INTEGER NOT NULL DEFAULT 0,
    "snapshotData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanResultSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YearPlan_userId_year_idx" ON "YearPlan"("userId", "year");

-- CreateIndex
CREATE INDEX "YearPlan_workstreamId_idx" ON "YearPlan"("workstreamId");

-- CreateIndex
CREATE INDEX "YearPlan_goalId_idx" ON "YearPlan"("goalId");

-- CreateIndex
CREATE INDEX "YearPlan_projectId_idx" ON "YearPlan"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "YearPlan_userId_year_key" ON "YearPlan"("userId", "year");

-- CreateIndex
CREATE INDEX "MonthPlan_userId_year_month_idx" ON "MonthPlan"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "MonthPlan_yearPlanId_idx" ON "MonthPlan"("yearPlanId");

-- CreateIndex
CREATE INDEX "MonthPlan_workstreamId_idx" ON "MonthPlan"("workstreamId");

-- CreateIndex
CREATE INDEX "MonthPlan_goalId_idx" ON "MonthPlan"("goalId");

-- CreateIndex
CREATE INDEX "MonthPlan_projectId_idx" ON "MonthPlan"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthPlan_userId_year_month_key" ON "MonthPlan"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "PlanOutcome_userId_horizon_idx" ON "PlanOutcome"("userId", "horizon");

-- CreateIndex
CREATE INDEX "PlanOutcome_dailyPlanId_idx" ON "PlanOutcome"("dailyPlanId");

-- CreateIndex
CREATE INDEX "PlanOutcome_weeklyPlanId_idx" ON "PlanOutcome"("weeklyPlanId");

-- CreateIndex
CREATE INDEX "PlanOutcome_monthPlanId_idx" ON "PlanOutcome"("monthPlanId");

-- CreateIndex
CREATE INDEX "PlanOutcome_yearPlanId_idx" ON "PlanOutcome"("yearPlanId");

-- CreateIndex
CREATE INDEX "PlanOutcome_taskId_idx" ON "PlanOutcome"("taskId");

-- CreateIndex
CREATE INDEX "PlanOutcome_projectId_idx" ON "PlanOutcome"("projectId");

-- CreateIndex
CREATE INDEX "PlanOutcome_goalId_idx" ON "PlanOutcome"("goalId");

-- CreateIndex
CREATE INDEX "PlanOutcome_workstreamId_idx" ON "PlanOutcome"("workstreamId");

-- CreateIndex
CREATE INDEX "PlanOutcome_outcomeState_idx" ON "PlanOutcome"("outcomeState");

-- CreateIndex
CREATE INDEX "PlanOutcomeEvidence_planOutcomeId_idx" ON "PlanOutcomeEvidence"("planOutcomeId");

-- CreateIndex
CREATE INDEX "PlanOutcomeEvidence_evidenceId_idx" ON "PlanOutcomeEvidence"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanOutcomeEvidence_planOutcomeId_evidenceId_key" ON "PlanOutcomeEvidence"("planOutcomeId", "evidenceId");

-- CreateIndex
CREATE INDEX "PlanResultSnapshot_userId_horizon_idx" ON "PlanResultSnapshot"("userId", "horizon");

-- CreateIndex
CREATE UNIQUE INDEX "PlanResultSnapshot_userId_horizon_periodKey_key" ON "PlanResultSnapshot"("userId", "horizon", "periodKey");

-- CreateIndex
CREATE INDEX "DailyPlan_weeklyPlanId_idx" ON "DailyPlan"("weeklyPlanId");

-- CreateIndex
CREATE INDEX "WeeklyPlan_monthPlanId_idx" ON "WeeklyPlan"("monthPlanId");

-- CreateIndex
CREATE INDEX "WeeklyPlan_workstreamId_idx" ON "WeeklyPlan"("workstreamId");

-- CreateIndex
CREATE INDEX "WeeklyPlan_goalId_idx" ON "WeeklyPlan"("goalId");

-- CreateIndex
CREATE INDEX "WeeklyPlan_projectId_idx" ON "WeeklyPlan"("projectId");

-- AddForeignKey
ALTER TABLE "YearPlan" ADD CONSTRAINT "YearPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearPlan" ADD CONSTRAINT "WorkstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearPlan" ADD CONSTRAINT "GoalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YearPlan" ADD CONSTRAINT "ProjectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthPlan" ADD CONSTRAINT "MonthPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthPlan" ADD CONSTRAINT "MonthPlan_yearPlanId_fkey" FOREIGN KEY ("yearPlanId") REFERENCES "YearPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthPlan" ADD CONSTRAINT "MonthPlan_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthPlan" ADD CONSTRAINT "MonthPlan_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthPlan" ADD CONSTRAINT "MonthPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPlan" ADD CONSTRAINT "DailyPlan_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "WeeklyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlan" ADD CONSTRAINT "WeeklyPlan_monthPlanId_fkey" FOREIGN KEY ("monthPlanId") REFERENCES "MonthPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlan" ADD CONSTRAINT "WeeklyPlan_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlan" ADD CONSTRAINT "WeeklyPlan_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPlan" ADD CONSTRAINT "WeeklyPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_yearPlanId_fkey" FOREIGN KEY ("yearPlanId") REFERENCES "YearPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_monthPlanId_fkey" FOREIGN KEY ("monthPlanId") REFERENCES "MonthPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "WeeklyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_dailyPlanId_fkey" FOREIGN KEY ("dailyPlanId") REFERENCES "DailyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "Workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcome" ADD CONSTRAINT "PlanOutcome_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcomeEvidence" ADD CONSTRAINT "PlanOutcomeEvidence_planOutcomeId_fkey" FOREIGN KEY ("planOutcomeId") REFERENCES "PlanOutcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanOutcomeEvidence" ADD CONSTRAINT "PlanOutcomeEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanResultSnapshot" ADD CONSTRAINT "PlanResultSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
