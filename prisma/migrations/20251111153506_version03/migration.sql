-- CreateEnum
CREATE TYPE "SubjectDifficulty" AS ENUM ('Easy', 'Normal', 'Hard');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('assignment', 'project', 'exam', 'etc');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done', 'archived');

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "credit" DECIMAL(3,1),
ADD COLUMN     "difficulty" "SubjectDifficulty" NOT NULL DEFAULT 'Normal';

-- CreateTable
CREATE TABLE "subject_tasks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subject_id" INTEGER,
    "type" "TaskType" NOT NULL DEFAULT 'assignment',
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "due_at" TIMESTAMP(3),
    "estimated_min" INTEGER,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subject_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subject_tasks_user_id_status_due_at_idx" ON "subject_tasks"("user_id", "status", "due_at");

-- CreateIndex
CREATE INDEX "subject_tasks_subject_id_status_idx" ON "subject_tasks"("subject_id", "status");

-- AddForeignKey
ALTER TABLE "subject_tasks" ADD CONSTRAINT "subject_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_tasks" ADD CONSTRAINT "subject_tasks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
