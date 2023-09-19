import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Logout';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData(prisma);

    {
        /*
            Login of one user with two clients should generate two tokens with the same signature
            Logout of one client should revoke only one token
        */

        const client_1 = new ApiCaller();
        await client_1.ConnectAsUser(testUsers[0].username);
        const client_2 = new ApiCaller();
        await client_2.ConnectAsUser(testUsers[0].username);
        const client_3 = new ApiCaller();
        await client_3.ConnectAsAdmin(testAdmins[0].username);
        const client_4 = new ApiCaller();
        await client_4.ConnectAsAdmin(testAdmins[0].username);

        const userRefreshError = client_1.getCookieToken() === client_2.getCookieToken();
        const userAccessError = client_1.getBearerToken() === client_2.getBearerToken();
        const adminRefreshError = client_3.getCookieToken() === client_4.getCookieToken();
        const adminAccessError = client_3.getBearerToken() === client_4.getBearerToken();

        if (userRefreshError) {
            logger.error(`FAILED: Got same refresh token for two different clients of the same user`);
        }
        if (userAccessError) {
            logger.error(`FAILED: Got same access token for two different clients of the same user`);
        }
        if (!userRefreshError && !userAccessError) {
            logger.success(`SUCCESS: Connected two different clients of the same user with success`);
        }
        if (adminRefreshError) {
            logger.error(`FAILED: Got same refresh token for two different clients of the same admin`);
        }
        if (adminAccessError) {
            logger.error(`FAILED: Got same access token for two different clients of the same admin`);
        }
        if (!adminRefreshError && !adminAccessError) {
            logger.success(`SUCCESS: Connected two different clients of the same admin with success`);
        }

        // Logout client_1 & client_3 once to revoke accessToken
        // Try a protected route with client_1 & client_3
        await client_1.DisconnectAsUser();
        const { res: client_1ProtectedRouteUnauthorized } = await client_1.GET('/protected/ping');
        await client_3.DisconnectAsAdmin();
        const { res: client_3ProtectedRouteUnauthorized } = await client_3.GET('/protected/admin/ping');

        if (client_1ProtectedRouteUnauthorized.status !== 401) {
            logger.error(
                `FAILED: Logout user by revoking accessToken with success`,
                client_1ProtectedRouteUnauthorized,
            );
        } else {
            logger.success(`SUCCESS: Logout user by revoking accessToken with success`);
        }
        if (client_3ProtectedRouteUnauthorized.status !== 401) {
            logger.error(
                `FAILED: Logout admin by revoking accessToken with success`,
                client_3ProtectedRouteUnauthorized,
            );
        } else {
            logger.success(`SUCCESS: Logout admin by revoking accessToken with success`);
        }

        // Re-login client_1 & client_3
        // Disconnect all clients with logout/all
        await client_1.ConnectAsUser(testUsers[0].username);
        await client_3.ConnectAsAdmin(testAdmins[0].username);

        const { res: logoutAll_client_1 } = await client_1.DisconnectAllAsUser();
        const { res: logoutAll_client_3 } = await client_3.DisconnectAllAsAdmin();

        if (logoutAll_client_1.status !== 200) {
            logger.error(`FAILED: Called logout/user/all route with success`, logoutAll_client_1);
        } else {
            logger.success(`SUCCESS: Called logout/user/all route with success`);
        }
        if (logoutAll_client_3.status !== 200) {
            logger.error(`FAILED: Called logout/admin/all route with success`, logoutAll_client_3);
        } else {
            logger.success(`SUCCESS: Called logout/admin/all route with success`);
        }

        // Try to access protected route with revoked token with all clients
        const { res: client_1ProtectedRouteAfterLogoutAll } = await client_1.GET('/protected/ping');
        const { res: client_2ProtectedRouteAfterLogoutAll } = await client_2.GET('/protected/ping');
        const { res: client_3ProtectedRouteAfterLogoutAll } = await client_3.GET('/protected/admin/ping');
        const { res: client_4ProtectedRouteAfterLogoutAll } = await client_4.GET('/protected/admin/ping');

        const logoutAllAdminsSuccess =
            client_3ProtectedRouteAfterLogoutAll.status === 401 && client_4ProtectedRouteAfterLogoutAll.status === 401;

        const logoutAllUsersSuccess =
            client_1ProtectedRouteAfterLogoutAll.status === 401 && client_2ProtectedRouteAfterLogoutAll.status === 401;

        if (logoutAllAdminsSuccess) {
            logger.success(`SUCCESS: Logout all admin tokens with success`);
        } else {
            logger.error(`FAILED: Logout all admin tokens with success`);
        }

        if (logoutAllUsersSuccess) {
            logger.success(`SUCCESS: Logout all user tokens with success`);
        } else {
            logger.error(`FAILED: Logout all user tokens with success`);
        }

        // Try to refresh tokens with revoked token
        const { res: res_user_refresh } = await client_1.GET('/auth/refresh/user');
        const { res: res_admin_refresh } = await client_3.GET('/auth/refresh/admin');

        if (res_user_refresh.status !== 401) {
            logger.error(`FAILED: Forbid token refresh with revoked user refresh token`, res_user_refresh);
        } else {
            logger.success(`SUCCESS: Forbid token refresh with revoked user refresh token`);
        }
        if (res_admin_refresh.status !== 401) {
            logger.error(`FAILED: Forbid token refresh with revoked admin refresh token`, res_admin_refresh);
        }
        if (res_user_refresh.status === 401 && res_admin_refresh.status === 401) {
            logger.success(`SUCCESS: Forbid token refresh with revoked admin refresh token`);
        }
    }

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};
