import type { TapInstance, TestApiInstance } from '../../helper';

export default async (t: TapInstance, testApi: TestApiInstance) => {
    t.test('Logout success', async t => {
        const user = await testApi.createUser();
        const admin = await testApi.createAdmin();

        const userSuccess = await (async () => {
            await user.login();
            const loginSuccess = await user.testUserProtectRoute();
            await user.logout();
            const logoutSuccess = !(await user.testUserProtectRoute());
            return loginSuccess && logoutSuccess;
        })();

        const adminSuccess = await (async () => {
            await admin.login();
            const loginSuccess = await admin.testAdminProtectRoute();
            await admin.logout();
            const logoutSuccess = !(await admin.testAdminProtectRoute());
            return loginSuccess && logoutSuccess;
        })();

        t.ok(userSuccess, 'Successfull User logout');
        t.ok(adminSuccess, 'Successfull Admin logout');
    });

    t.test('Logout all sessions', async t => {
        const userSuccess = (async () => {
            const user = await testApi.createUser();
            const sessions = Array.from({ length: 5 }, () => testApi.cloneUser(user));
            await Promise.all(sessions.map(session => session.login()));
            const loginSuccess = await Promise.all(sessions.map(session => session.testUserProtectRoute()));
            await user.logoutAllSessions();
            const logoutSuccess = await Promise.all(sessions.map(session => session.testUserProtectRoute()));
            return loginSuccess.every(success => success) && logoutSuccess.every(success => !success);
        })();

        const adminSuccess = (async () => {
            const admin = await testApi.createAdmin();
            const sessions = Array.from({ length: 5 }, () => testApi.cloneUser(admin));
            await Promise.all(sessions.map(session => session.login()));
            const loginSuccess = await Promise.all(sessions.map(session => session.testAdminProtectRoute()));
            await admin.logoutAllSessions();
            const logoutSuccess = await Promise.all(sessions.map(session => session.testAdminProtectRoute()));
            return loginSuccess.every(success => success) && logoutSuccess.every(success => !success);
        })();

        t.ok(userSuccess, 'Successfull User logout all sessions');
        t.ok(adminSuccess, 'Successfull Admin logout all sessions');
    });
};
