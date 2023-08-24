import server from '../../src/server';
import ApiCaller from '../apiCaller';
import { createTestData, deleteTestData } from './utils';

const { GET, POST } = ApiCaller;

beforeAll(async () => {
    await server.ready();
    await createTestData(server);
});

afterAll(async () => {
    await deleteTestData(server);
    server.close();
});

// FIXME: Debbuger does not seems to work with POST requests ???
(async () => {
    describe('Authentication', () => {
        test('Successfull user/customer connection', async () => {
            const { status } = await POST('/auth/login/user', {
                username: 'test_user01',
                password: 'P@ssw0rdTest123',
            });
            await POST('/auth/login/user', {
                username: 'test_user01',
                password: 'P@ssw0rdTest123',
            });
            await POST('/auth/login/user', {
                username: 'test_user01',
                password: 'P@ssw0rdTest123',
            });

            await GET('/test');

            expect(status).toBe(200);
        });
    });
})();
