import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const PASSWORD = 'P@ssw0rdTest123';
export const HASHED_PASSWORD = bcrypt.hashSync(PASSWORD, 10);

export const USERS = ['test_user'].map(username => ({
    username,
    email: `${username}@test.test`,
    password: PASSWORD,
    role: 1,
}));

export const ADMINS = ['test_admin'].map(username => ({
    username,
    email: `${username}@test.test`,
    password: PASSWORD,
    role: 0,
}));

export const CUTOMERS = ['test_customer'].map(username => ({
    username,
    email: `${username}@test.test`,
    password: PASSWORD,
}));

export const getUserCachedToken = async email => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    try {
        const { id } = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        return await prisma.userRefreshTokenCache.findMany({
            where: { user_id: id },
        });
    } catch (e) {
        throw e;
    } finally {
        await prisma.$disconnect();
    }
};

export const getCustomerCachedToken = async email => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    try {
        const { id } = await prisma.customer.findUnique({
            where: { email },
            select: { id: true },
        });

        return await prisma.customerRefreshTokenCache.findMany({
            where: { customer_id: id },
        });
    } catch (e) {
        throw e;
    } finally {
        await prisma.$disconnect();
    }
};

export const createTestData = async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    try {
        await prisma.user.createMany({
            data: [...USERS, ...ADMINS].map(user => ({
                ...user,
                password: HASHED_PASSWORD,
            })),
        });
        await prisma.customer.createMany({
            data: CUTOMERS.map(customer => ({
                ...customer,
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
            where: {
                username: {
                    in: [...USERS.map(user => user.username), ...ADMINS.map(admin => admin.username)],
                },
            },
            select: {
                id: true,
            },
        });

        const customersIds = await prisma.customer.findMany({
            where: {
                username: {
                    in: CUTOMERS.map(customer => customer.username),
                },
            },
            select: {
                id: true,
            },
        });

        await prisma.$executeRaw`
            DELETE FROM "UserRefreshTokenCache" WHERE "user_id" = ANY(${usersIds.map(user => user.id)});
        `;
        await prisma.$executeRaw`
            DELETE FROM "User" WHERE "id" = ANY(${usersIds.map(user => user.id)});
        `;
        await prisma.$executeRaw`
            DELETE FROM "CustomerRefreshTokenCache" WHERE "customer_id" = ANY(${customersIds.map(
                customer => customer.id,
            )});
        `;
        await prisma.$executeRaw`
            DELETE FROM "Customer" WHERE "id" = ANY(${customersIds.map(customer => customer.id)});
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
        testCustomers: CUTOMERS.map(customer => ({
            ...customer,
            refreshToken: null,
            accessToken: null,
        })),
    };
};
