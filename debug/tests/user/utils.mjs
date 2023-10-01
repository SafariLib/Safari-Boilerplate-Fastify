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

export const USER_ROLES = [
    {
        name: 'TEST_ROLE_1',
        is_default: false,
    },
];

export const createTestData = async prisma => {
    await prisma.admin.create({ data: { ...ADMIN, password: hashedPassword } });
    await prisma.userRole.createMany({ data: USER_ROLES });
    const testRoles = await prisma.userRole.findMany({
        select: { id: true },
        where: { name: { in: USER_ROLES.map(({ name }) => name) } },
    });
    await prisma.user.createMany({
        data: USERS.map((user, index) => ({
            ...user,
            password: hashedPassword,
            role_id: index % 2 === 0 ? testRoles[0].id : 1,
        })),
    });
};

export const cleanTestData = async prisma => {
    await prisma.$executeRaw`DELETE FROM "User" WHERE "username" = ANY(${USERS.map(({ username }) => username)});`;
    await prisma.$executeRaw`DELETE FROM "Admin" WHERE "username" = ${ADMIN.username};`;
    await prisma.$executeRaw`DELETE FROM "UserRole" WHERE "name" = ANY(${USER_ROLES.map(({ name }) => name)});`;
};

export const getUsersIds = async prisma => {
    const users = await prisma.user.findMany({ select: { id: true } });
    return users.map(({ id }) => id);
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

export const verifyObjectValidity = (object, expectedKeys) => {
    const keys = Object.keys(object);
    if (keys.length !== expectedKeys.length) {
        console.log('Object keys length mismatch');
        return false;
    }
    for (const key of keys) {
        const expectedKey = expectedKeys.find(({ key: k }) => k === key);
        if (!expectedKey) {
            console.log(`Unexpected key ${key}`);
            return false;
        }
        if (expectedKey.type === 'object') {
            if (!verifyObjectValidity(object[key], expectedKey.content)) {
                console.log(`Invalid object for key ${key}`);
                return false;
            }
        }
        if (typeof object[key] !== expectedKey.type) {
            console.log(`Unexpected type for key ${key}`);
            return false;
        }
    }
    return true;
};
