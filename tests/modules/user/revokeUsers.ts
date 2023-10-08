import type { TapInstance, TestApiInstance } from '../../helper';

export default async (t: TapInstance, testApi: TestApiInstance) => {
    const superAdmin = await testApi.createSuperAdmin();
    const admin = await testApi.createAdmin();
    const user = await testApi.createUser();

    await superAdmin.login();
    await admin.login();
    await user.login();

    t.test('Revoke User and Admin as Super Admin', async t => {
        const loginSuccess = await (async () => {
            const userSuccess = await user.testUserProtectRoute();
            const adminSuccess = await admin.testAdminProtectRoute();
            return userSuccess && adminSuccess;
        })();

        const revokeSuccess = await (async () => {
            [user.id, admin.id].forEach(
                async id => await superAdmin.makePatchRequest(`/protected/admin/user/${id}/revoke`),
            );
            const isUserLoggedOut = !(await user.testUserProtectRoute());
            const isAdminLoggedOut = !(await admin.testAdminProtectRoute());
            const userLoginAttempt = await user.login();
            const adminLoginAttempt = await admin.login();
            return (
                isUserLoggedOut &&
                isAdminLoggedOut &&
                userLoginAttempt.statusCode === 401 &&
                adminLoginAttempt.statusCode === 401
            );
        })();

        t.ok(loginSuccess, 'Successfull login user and admin');
        t.ok(revokeSuccess, 'Successfull revoke user and admin');
    });
};
