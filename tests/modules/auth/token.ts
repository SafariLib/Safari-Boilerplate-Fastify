import type { TapInstance, TestApiInstance } from '../../helper';

export default async (t: TapInstance, testApi: TestApiInstance) => {
    t.test('Refreshing tokens', async t => {
        const user = await testApi.createUser();
        const admin = await testApi.createAdmin();

        await user.login();
        await admin.login();

        user.setAuthorizationToken();
        admin.setAuthorizationToken();

        const isUserLoggedOut = !(await user.testUserProtectRoute());
        const isAdminLoggedOut = !(await admin.testAdminProtectRoute());

        const userRefreshCall = await user.refreshTokens();
        const adminRefreshCall = await admin.refreshTokens();

        const isUserTokenRefreshed = await user.testUserProtectRoute();
        const isAdminTokenRefreshed = await admin.testAdminProtectRoute();

        const userSuccessTest = isUserLoggedOut && userRefreshCall.statusCode === 200 && isUserTokenRefreshed;
        const adminSuccessTest = isAdminLoggedOut && adminRefreshCall.statusCode === 200 && isAdminTokenRefreshed;

        t.ok(userSuccessTest, 'Successfull refresh of user tokens');
        t.ok(adminSuccessTest, 'Successfull refresh of admin tokens');
    });
};
