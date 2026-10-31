-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'AUDITING', 'DROPPED');

-- CreateEnum
CREATE TYPE "UnderstandingLevel" AS ENUM ('BEGINNER', 'DEVELOPING', 'PROFICIENT', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE IF NOT EXISTS "AcademicSemester" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2026/2027',
    "semester" TEXT NOT NULL DEFAULT 'First Semester',
    "level" TEXT NOT NULL DEFAULT 'Fifth Year',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicSemester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AcademicCourse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "creditHours" INTEGER,
    "instructor" TEXT,
    "assessmentDates" JSONB,
    "assignments" JSONB,
    "testsAndExams" JSONB,
    "studyTopics" JSONB,
    "learningResources" JSONB,
    "currentUnderstanding" "UnderstandingLevel" NOT NULL DEFAULT 'DEVELOPING',
    "academicStatus" "AcademicStatus" NOT NULL DEFAULT 'ENROLLED',
    "notes" TEXT,
    "completionRequirements" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AcademicSemester_userId_academicYear_semester_key" ON "AcademicSemester"("userId", "academicYear", "semester");
CREATE INDEX IF NOT EXISTS "AcademicSemester_userId_status_idx" ON "AcademicSemester"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AcademicCourse_semesterId_title_key" ON "AcademicCourse"("semesterId", "title");
CREATE INDEX IF NOT EXISTS "AcademicCourse_userId_academicStatus_idx" ON "AcademicCourse"("userId", "academicStatus");
CREATE INDEX IF NOT EXISTS "AcademicCourse_semesterId_idx" ON "AcademicCourse"("semesterId");
CREATE INDEX IF NOT EXISTS "AcademicCourse_projectId_idx" ON "AcademicCourse"("projectId");

-- AddForeignKey
ALTER TABLE "AcademicSemester" ADD CONSTRAINT "AcademicSemester_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicCourse" ADD CONSTRAINT "AcademicCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicCourse" ADD CONSTRAINT "AcademicCourse_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "AcademicSemester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicCourse" ADD CONSTRAINT "AcademicCourse_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

