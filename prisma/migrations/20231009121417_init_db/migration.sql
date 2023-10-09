-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "email" VARCHAR(64) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "avatarUrl" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,
    "updaterType" VARCHAR(12) DEFAULT 'SYSTEM',

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "rights" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminEditLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "editLogId" INTEGER NOT NULL,

    CONSTRAINT "AdminEditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "email" VARCHAR(64) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "avatarUrl" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,
    "updaterType" VARCHAR(12) DEFAULT 'SYSTEM',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "editLogId" INTEGER NOT NULL,

    CONSTRAINT "UserEditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditLog" (
    "id" SERIAL NOT NULL,
    "editorId" INTEGER NOT NULL,
    "editorIp" VARCHAR(64) NOT NULL,
    "editorIsAdmin" BOOLEAN NOT NULL DEFAULT false,
    "table" VARCHAR(32) NOT NULL,
    "code" VARCHAR(24) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_name_key" ON "AdminRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminEditLog" ADD CONSTRAINT "AdminEditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminEditLog" ADD CONSTRAINT "AdminEditLog_editLogId_fkey" FOREIGN KEY ("editLogId") REFERENCES "EditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEditLog" ADD CONSTRAINT "UserEditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEditLog" ADD CONSTRAINT "UserEditLog_editLogId_fkey" FOREIGN KEY ("editLogId") REFERENCES "EditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Insert Default Data
INSERT INTO "AdminRole" ("id", "name", "is_default") VALUES ('1', 'Super Administrateur', false);
INSERT INTO "AdminRole" ("id", "name", "is_default") VALUES ('2', 'Administrateur', true);
INSERT INTO "UserRole" ("id", "name", "is_default") VALUES ('1', 'Utilisateur', true);
UPDATE "AdminRole" SET "rights" = array[1,2,3,4] WHERE "name" = 'Super Administrateur';
UPDATE "AdminRole" SET "rights" = array[1,3] WHERE "name" = 'Administrateur';