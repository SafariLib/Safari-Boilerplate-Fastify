import { FastifyInstance } from 'fastify';
import { ERoles } from '../../src/types';

export const PASSWORD = 'P@ssw0rdTest123';
export const USERS = ['test_user01', 'test_user02'];
export const ADMINS = ['test_user03'];
export const SUPER_ADMINS = ['test_user04'];
export const CUTOMERS = ['test_customer01', 'test_customer02'];

export const createTestData = async (server: FastifyInstance) => {
    const { prisma } = server;
    await prisma.user.createMany({
        data: [
            ...USERS.map(username => ({
                username,
                email: `${username}@test.test`,
                password: PASSWORD,
                role: ERoles.USER,
            })),
            ...ADMINS.map(username => ({
                username,
                email: `${username}@test.test`,
                password: PASSWORD,
                role: ERoles.ADMIN,
            })),
            ...SUPER_ADMINS.map(username => ({
                username,
                email: `${username}@test.test`,
                password: PASSWORD,
                role: ERoles.SUPER_ADMIN,
            })),
        ],
    });
    await prisma.customer.createMany({
        data: CUTOMERS.map(username => ({
            username,
            email: `${username}@test.test`,
            password: PASSWORD,
        })),
    });
};

export const deleteTestData = async (server: FastifyInstance) => {
    const { prisma } = server;
    await prisma.user.deleteMany({
        where: {
            username: {
                in: [...USERS, ...ADMINS, ...SUPER_ADMINS],
            },
        },
    });
    await prisma.customer.deleteMany({
        where: {
            username: {
                in: CUTOMERS,
            },
        },
    });
};
