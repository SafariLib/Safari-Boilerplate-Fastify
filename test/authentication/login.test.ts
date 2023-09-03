import server from '../../src/server';
import { CUTOMERS, PASSWORD, USERS, createTestData, deleteTestData } from './utils';

(async () => {
    describe('Authentication', () => {
        const testUsers = USERS.map(user => ({
            ...user,
            refreshToken: null,
            accessToken: null,
        }));

        beforeAll(async () => {
            await server.ready();
            await createTestData(server);
        });

        afterAll(async () => {
            await deleteTestData(server);
            server.close();
        });

        test('Failed user authentication', async () => {
            // Login should fail with user trying to login as customer and vice versa
            for (const user of testUsers) {
                const userAsCustomer = await server.inject({
                    method: 'POST',
                    url: '/auth/login/customer',
                    payload: {
                        username: user.username,
                        password: PASSWORD,
                    },
                });
                expect(userAsCustomer.statusCode).toBe(404);
            }
            for (const customer of CUTOMERS) {
                const customerAsUser = await server.inject({
                    method: 'POST',
                    url: '/auth/login/user',
                    payload: {
                        username: customer.username,
                        password: PASSWORD,
                    },
                });
                expect(customerAsUser.statusCode).toBe(404);
            }

            // Login should fail with wrong password
            const wrongPassword = await server.inject({
                method: 'POST',
                url: '/auth/login/user',
                payload: {
                    username: testUsers[0].username,
                    password: 'wrongPassword',
                },
            });
            expect(wrongPassword.statusCode).toBe(401);

            // Login should fail with schema validation
            const wrongUsername = await server.inject({
                method: 'POST',
                url: '/auth/login/user',
                payload: {
                    username:
                        'wrongUsernameThatIsTooLong_____IMeanReallyTooLongLikeSoLongItCanTouchTheSky____EvenLongerThanThat',
                    password: PASSWORD,
                },
            });
            expect(wrongUsername.statusCode).toBe(400);
        });

        test('Successfull user authentication', async () => {
            for (const user of testUsers) {
                // Login should be successfull
                const res = await server.inject({
                    method: 'POST',
                    url: '/auth/login/user',
                    payload: {
                        username: user.username,
                        password: PASSWORD,
                    },
                });
                expect(res.statusCode).toBe(200);

                // Response should contain a token and a user object
                // The user object should not contain the password
                const jsonContent = await res.json();

                expect(jsonContent.user.password).toBeUndefined();
                expect(jsonContent.accessToken).toBeDefined();
                expect(res.cookies[0].name).toBe('refreshToken');

                // Save the refresh token and the access token
                // For the next tests
                user.accessToken = jsonContent.token;
                user.refreshToken =
                    (res.cookies[0] as Record<string, string>).name +
                    '=' +
                    (res.cookies[0] as Record<string, string>).value;
            }
        });

        // FIXME This test is failing
        test('Access to protected ressources', async () => {
            const res = await server.inject({
                method: 'GET',
                url: '/user',
                headers: {
                    Authorization: `Bearer ${testUsers[0].accessToken}`,
                },
            });

            expect(res.statusCode).toBe(200);
        });
    });
})();
