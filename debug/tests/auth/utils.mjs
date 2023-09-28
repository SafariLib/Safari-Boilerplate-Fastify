import { generateDefaultPassword } from '../../utils/password.mjs';

export const { password, hashedPassword } = generateDefaultPassword();

export const ADMINS = ['test_admin'].map(username => ({
    username,
    email: `${username}@test.test`,
    password,
}));

export const USERS = ['test_user'].map(username => ({
    username,
    email: `${username}@test.test`,
    password,
}));

export const createTestData = async prisma => {
    await prisma.user.createMany({
        data: USERS.map(user => ({
            ...user,
            role_id: 1,
            password: hashedPassword,
        })),
    });
    await prisma.admin.createMany({
        data: ADMINS.map(admin => ({
            ...admin,
            role_id: 1,
            password: hashedPassword,
        })),
    });
};

export const cleanTestData = async prisma => {
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
};

export const initData = async prisma => {
    try {
        await createTestData(prisma);
    } catch (e) {
        await cleanTestData(prisma);
        await createTestData(prisma);
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
