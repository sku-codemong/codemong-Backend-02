/*
  Warnings:

  - The values [archived] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [project,exam,etc] on the enum `TaskType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `target_weekly_min` on the `subjects` table. All the data in the column will be lost.
  - The `difficulty` column on the `subjects` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('todo', 'in_progress', 'done');
ALTER TABLE "public"."subject_tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subject_tasks" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";
ALTER TABLE "subject_tasks" ALTER COLUMN "status" SET DEFAULT 'todo';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskType_new" AS ENUM ('assignment');
ALTER TABLE "public"."subject_tasks" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "subject_tasks" ALTER COLUMN "type" TYPE "TaskType_new" USING ("type"::text::"TaskType_new");
ALTER TYPE "TaskType" RENAME TO "TaskType_old";
ALTER TYPE "TaskType_new" RENAME TO "TaskType";
DROP TYPE "public"."TaskType_old";
ALTER TABLE "subject_tasks" ALTER COLUMN "type" SET DEFAULT 'assignment';
COMMIT;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "target_weekly_min",
ADD COLUMN     "target_daily_min" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" SMALLINT NOT NULL DEFAULT 3;

-- DropEnum
DROP TYPE "SubjectDifficulty";
