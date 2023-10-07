import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { buildServer } from './helper';
import UserFactory from './helper/classes/UserFactory';

(async () => {
    const prisma = new PrismaClient();
    let server: FastifyInstance;
    let userFactory: UserFactory;

    describe('Authentication module tests', () => {
        beforeAll(async () => {
            await prisma.$connect();
            server = await buildServer();
            userFactory = new UserFactory(prisma, server);
        });
        afterAll(async () => {
            await userFactory.deleteTestData();
            await server.close();
            await prisma.$disconnect();
        });

        test('Should login a user', async () => {
            await import('./tests.auth/login').then(({ default: test }) => test(server, userFactory));
        });
    });
})();
