import type { TapInstance, TestApiInstance } from '../helper';

export default async (t: TapInstance, testApi: TestApiInstance) => {
    t.test('Login success', async t => {
        const userSuccess = await (async () => {
            const user = await testApi.createUser();
            await user.login();
            return await user.testUserProtectRoute();
        })();

        const adminSuccess = await (async () => {
            const admin = await testApi.createAdmin();
            await admin.login();
            return await admin.testUserProtectRoute();
        })();

        t.ok(userSuccess, 'Successfull User login');
        t.ok(adminSuccess, 'Successfull Admin login');
    });

    t.test('Login failure', async t => {
        const loginInjector = async (payload: { username: string; password: string }) => {
            const { statusCode, json } = await testApi.server.inject({
                method: 'POST',
                url: '/auth/login/user',
                payload: payload,
            });
            const message = json().message;
            return {
                statusCode,
                message,
            };
        };

        const user = await testApi.createUser();

        const testWrongPassword = await loginInjector({
            username: user.username,
            password: 'wrongpassword',
        });

        const testToLongPassword = await loginInjector({
            username: user.username,
            password:
                'wrongUsernameThatIsTooLong_____IMeanReallyTooLongLikeSoLongItCanTouchTheSky____EvenLongerThanThat',
        });

        t.ok(
            testWrongPassword.statusCode === 401 && testWrongPassword.message === 'USER_INCORRECT_PASSWORD',
            'Successfull rejection of wrong password',
        );
        t.ok(
            testToLongPassword.statusCode === 400,
            'Successfull rejection of malformed payload for login endpoint, too long password',
        );
    });

    t.test('Login too many attempts', async t => {
        const user = await testApi.createUser();
        const admin = await testApi.createAdmin();

        for (let i = 0; i < 5; i++) await user.login({ username: user.username, password: 'wrongpassword' });
        for (let i = 0; i < 5; i++) await admin.login({ username: admin.username, password: 'wrongpassword' });

        const usrTest = await user.login({ username: user.username, password: 'wrongpassword' });
        const adminTest = await admin.login({ username: admin.username, password: 'wrongpassword' });

        t.ok(
            usrTest.statusCode === 401 && usrTest.message === 'USER_TOO_MANY_ATTEMPTS',
            'Successfull rejection of too many login attempts for one User',
        );
        t.ok(
            adminTest.statusCode === 401 && adminTest.message === 'USER_TOO_MANY_ATTEMPTS',
            'Successfull rejection of too many login attempts for one Admin',
        );
    });
};
