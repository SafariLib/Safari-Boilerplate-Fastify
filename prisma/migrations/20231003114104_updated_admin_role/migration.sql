-- AlterTable
ALTER TABLE "AdminRole" ADD COLUMN     "rights" INTEGER[];

UPDATE "AdminRole" SET "rights" = array[1,2,3,4] WHERE "name" = 'Super Administrateur';
UPDATE "AdminRole" SET "rights" = array[1,3] WHERE "name" = 'Administrateur';