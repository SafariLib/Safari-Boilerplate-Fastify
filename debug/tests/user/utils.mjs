import { generateDefaultPassword } from '../../utils/password.mjs';

export const { password, hashedPassword } = generateDefaultPassword();

export const ADMIN = {
    username: 'test_admin',
    email: 'test_admin@test.test',
    password,
    role_id: 1,
};

export const USERS = Array.from({ length: 50 }, (_, i) => ({
    username: `test_user${i}`,
    email: `test_user${i}@test.test`,
    password,
    role_id: 1,
}));

export const createTestData = async prisma => {
    await prisma.admin.create({ data: { ...ADMIN, password: hashedPassword } });
    await prisma.user.createMany({ data: USERS.map(user => ({ ...user, password: hashedPassword })) });
};

export const cleanTestData = async prisma => {
    await prisma.$executeRaw`DELETE FROM "User" WHERE "username" = ANY(${USERS.map(({ username }) => username)});`;
    await prisma.$executeRaw`DELETE FROM "Admin" WHERE "username" = ${ADMIN.username};`;
};

export const initData = async prisma => {
    try {
        await createTestData(prisma);
    } catch (e) {
        await cleanTestData(prisma);
        await createTestData(prisma);
    }
    return {
        testUsers: USERS.map(user => ({ ...user, refreshToken: null, accessToken: null })),
        testAdmin: { ...ADMIN, refreshToken: null, accessToken: null },
    };
};
