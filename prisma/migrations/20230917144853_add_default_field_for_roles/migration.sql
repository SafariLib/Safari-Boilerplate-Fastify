-- AlterTable
ALTER TABLE "AdminRole" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;

-- Add default roles
INSERT INTO "AdminRole" ("id", "name", "is_default") VALUES ('1', 'Super Administrateur', false);
INSERT INTO "AdminRole" ("id", "name", "is_default") VALUES ('2', 'Administrateur', true);
INSERT INTO "UserRole" ("id", "name", "is_default") VALUES ('1', 'Utilisateur', true);