import server from '../../src/server';
import { createTestData, deleteTestData } from './utils';

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
            const response = await server.inject({
                method: 'POST',
                url: '/auth/login/user',
                payload: {
                    username: 'test_user01',
                    password: 'P@ssw0rdTest123',
                },
            });
            expect(response.statusCode).toBe(200);
            expect(response.json().token).toBeDefined();
        });
    });
})();
