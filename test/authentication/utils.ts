import { FastifyInstance } from 'fastify';

export const PASSWORD = 'P@ssw0rdTest123';

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

export const createTestData = async (server: FastifyInstance) => {
    const { prisma, bcrypt } = server;
    const hashedPassword = await bcrypt.hashString(PASSWORD);

    const doCreate = async () => {
        await prisma.user.createMany({
            data: [...USERS, ...ADMINS].map(user => ({
                ...user,
                password: hashedPassword,
            })),
        });
        await prisma.customer.createMany({
            data: CUTOMERS.map(customer => ({
                ...customer,
                password: hashedPassword,
            })),
        });
    };

    try {
        return await doCreate();
    } catch (e) {
        await deleteTestData(server);
        return await doCreate();
    }
};

export const deleteTestData = async (server: FastifyInstance) => {
    const { prisma } = server;
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
        DELETE FROM "UserConnectionLog" WHERE "user_id" = ANY(${usersIds.map(user => user.id)});
    `;
    await prisma.$executeRaw`
        DELETE FROM "User" WHERE "id" = ANY(${usersIds.map(user => user.id)});
    `;
    await prisma.$executeRaw`
        DELETE FROM "CustomerRefreshTokenCache" WHERE "customer_id" = ANY(${customersIds.map(customer => customer.id)});
    `;
    await prisma.$executeRaw`
        DELETE FROM "CustomerConnectionLog" WHERE "customer_id" = ANY(${customersIds.map(customer => customer.id)});
    `;
    await prisma.$executeRaw`
        DELETE FROM "Customer" WHERE "id" = ANY(${customersIds.map(customer => customer.id)});
    `;
};
