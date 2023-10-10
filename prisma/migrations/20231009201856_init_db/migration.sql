----------------------------------------------
-- CreateTables
----------------------------------------------
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "email" VARCHAR(64) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "avatarUrl" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" INTEGER,
    "updaterType" VARCHAR(12) DEFAULT 'SYSTEM',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "rights" INTEGER ARRAY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EditLog" (
    "id" SERIAL NOT NULL,
    "editorId" INTEGER NOT NULL,
    "editorIp" VARCHAR(64) NOT NULL,
    "table" VARCHAR(32) NOT NULL,
    "code" VARCHAR(24) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditLog_pkey" PRIMARY KEY ("id")
);
----------------------------------------------
-- CreateIndex
----------------------------------------------
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
----------------------------------------------
-- AddForeignKey
----------------------------------------------
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EditLog" ADD CONSTRAINT "EditLog_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
----------------------------------------------
-- InsertData
----------------------------------------------
INSERT INTO "Role" ("id", "name", "isDefault") VALUES ('1', 'Utilisateur', true);
INSERT INTO "Role" ("id", "name", "isDefault", "rights") VALUES ('2', 'Administrateur', false, '{1,3}');
INSERT INTO "Role" ("id", "name", "isDefault", "rights") VALUES ('3', 'Super Administrateur', false, '{1,2,3,4}');
