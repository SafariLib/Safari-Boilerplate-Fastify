import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const PASSWORD = 'P@ssw0rdTest123';
export const HASHED_PASSWORD = bcrypt.hashSync(PASSWORD, 10);

export const ADMINS = ['test_admin'].map(username => ({
    username,
    email: `${username}@test.test`,
    password: PASSWORD,
}));

export const USERS = ['test_user'].map(username => ({
    username,
    email: `${username}@test.test`,
    password: PASSWORD,
}));

export const createTestData = async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    try {
        await prisma.user.createMany({
            data: USERS.map(user => ({
                ...user,
                password: HASHED_PASSWORD,
            })),
        });
        await prisma.admin.createMany({
            data: ADMINS.map(admin => ({
                ...admin,
                password: HASHED_PASSWORD,
            })),
        });
    } catch (e) {
        throw e;
    } finally {
        await prisma.$disconnect();
    }
};

export const cleanTestData = async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    try {
        const usersIds = await prisma.user.findMany({
            where: { username: { in: USERS.map(user => user.username) } },
            select: { id: true },
        });

        const adminsIds = await prisma.admin.findMany({
            where: { username: { in: ADMINS.map(admin => admin.username) } },
            select: { id: true },
        });

        await prisma.$executeRaw`
            DELETE FROM "User" WHERE "id" = ANY(${usersIds.map(user => user.id)});
        `;
        await prisma.$executeRaw`
            DELETE FROM "Admin" WHERE "id" = ANY(${adminsIds.map(admin => admin.id)});
        `;
    } catch (e) {
        throw e;
    } finally {
        await prisma.$disconnect();
    }
};

export const initData = async () => {
    try {
        await createTestData();
    } catch (e) {
        await cleanTestData();
        await createTestData();
    }

    return {
        testUsers: USERS.map(user => ({
            ...user,
            refreshToken: null,
            accessToken: null,
        })),
        testAdmins: ADMINS.map(admin => ({
            ...admin,
            refreshToken: null,
            accessToken: null,
        })),
    };
};
