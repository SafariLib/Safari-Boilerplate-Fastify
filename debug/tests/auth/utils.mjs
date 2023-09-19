import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import ApiCaller from '../../utils/ApiCaller.mjs';

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
                role_id: 1,
                password: HASHED_PASSWORD,
            })),
        });
        await prisma.admin.createMany({
            data: ADMINS.map(admin => ({
                ...admin,
                role_id: 1,
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

export const connectUser = async username => {
    const client = new ApiCaller();
    const res = await client.POST('/auth/login/user', {
        username,
        password: PASSWORD,
    });
    const json = await res.json();
    client.setCookieToken(res.headers.get('set-cookie').split(';')[0].split('=')[1]);
    client.setBearerToken(json.accessToken);
    return client;
};

export const connectAdmin = async username => {
    const client = new ApiCaller();
    const res = await client.POST('/auth/login/admin', {
        username,
        password: PASSWORD,
    });
    const json = await res.json();
    client.setCookieToken(res.headers.get('set-cookie').split(';')[0].split('=')[1]);
    client.setBearerToken(json.accessToken);
    return client;
};
