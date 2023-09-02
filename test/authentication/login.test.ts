import server from '../../src/server';
import { CUTOMERS, PASSWORD, USERS, createTestData, deleteTestData } from './utils';

beforeAll(async () => {
    await server.ready();
    await createTestData(server);
});

afterAll(async () => {
    await deleteTestData(server);
    server.close();
});

(async () => {
    describe('Authentication', () => {
        test('Successfull user/customer connection', async () => {
            for (const username of USERS) {
                const { statusCode } = await server.inject({
                    method: 'POST',
                    url: '/auth/login/user',
                    payload: {
                        username,
                        password: PASSWORD,
                    },
                });
                expect(statusCode).toBe(200);
            }

            for (const username of CUTOMERS) {
                const { statusCode } = await server.inject({
                    method: 'POST',
                    url: '/auth/login/admin',
                    payload: {
                        username,
                        password: PASSWORD,
                    },
                });
                expect(statusCode).toBe(200);
            }
        });
    });
})();
