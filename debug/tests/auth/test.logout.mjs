import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Logout';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();

    {
        /*
            Login of one user with two clients should generate two tokens with the same signature
            Logout of one client should revoke only one token
        */

        const client_1 = new ApiCaller();
        const client_2 = new ApiCaller();
        const client_3 = new ApiCaller();
        const client_4 = new ApiCaller();

        const res_1 = await client_1.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const res_2 = await client_2.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const res_3 = await client_3.POST('/auth/login/admin', {
            username: testAdmins[0].username,
            password: PASSWORD,
        });

        const res_4 = await client_4.POST('/auth/login/admin', {
            username: testAdmins[0].username,
            password: PASSWORD,
        });

        const json_1 = await res_1.json();
        const refreshToken_1 = res_1.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_1 = json_1.accessToken;
        const json_2 = await res_2.json();
        const refreshToken_2 = res_2.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_2 = json_2.accessToken;
        const json_3 = await res_3.json();
        const refreshToken_3 = res_3.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_3 = json_3.accessToken;
        const json_4 = await res_4.json();
        const refreshToken_4 = res_4.headers.get('set-cookie').split(';')[0].split('=')[1];
        const accessToken_4 = json_4.accessToken;

        const userRefreshError = refreshToken_1 === refreshToken_2;
        const userAccessError = accessToken_1 === accessToken_2;
        const adminRefreshError = refreshToken_3 === refreshToken_4;
        const adminAccessError = accessToken_3 === accessToken_4;

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

        client_1.setCookieToken(refreshToken_1);
        client_1.setBearerToken(accessToken_1);
        client_2.setCookieToken(refreshToken_2);
        client_2.setBearerToken(accessToken_2);
        client_3.setCookieToken(refreshToken_3);
        client_3.setBearerToken(accessToken_3);
        client_4.setCookieToken(refreshToken_4);
        client_4.setBearerToken(accessToken_4);

        // Logout client_1 & client_3 once to revoke accessToken
        // Try a protected route with client_1 & client_3
        await client_1.GET('/auth/logout/user');
        const res_1_logout = await client_1.GET('/protected/ping');
        await client_3.GET('/auth/logout/admin');
        const res_3_logout = await client_3.GET('/protected/admin/ping');

        if (res_1_logout.status !== 401) {
            logger.error(`FAILED: Logout user by revoking accessToken with success`, res);
        } else {
            logger.success(`SUCCESS: Logout user by revoking accessToken with success`);
        }
        if (res_3_logout.status !== 401) {
            logger.error(`FAILED: Logout admin by revoking accessToken with success`, res);
        } else {
            logger.success(`SUCCESS: Logout admin by revoking accessToken with success`);
        }

        // Re-login client_1 & client_3
        // Disconnect all clients with logout/all
        const res_1_login = await client_1.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });
        const res_3_login = await client_3.POST('/auth/login/admin', {
            username: testAdmins[0].username,
            password: PASSWORD,
        });

        const tokens = {
            user: {
                refreshToken: res_1_login.headers.get('set-cookie').split(';')[0].split('=')[1],
                accessToken: (await res_1_login.json()).accessToken,
            },
            admin: {
                refreshToken: res_3_login.headers.get('set-cookie').split(';')[0].split('=')[1],
                accessToken: (await res_3_login.json()).accessToken,
            },
        };

        client_1.setCookieToken(tokens.user.refreshToken);
        client_1.setBearerToken(tokens.user.accessToken);
        client_3.setCookieToken(tokens.admin.refreshToken);
        client_3.setBearerToken(tokens.admin.accessToken);

        const res_user_logout_all = await client_1.GET('/auth/logout/user/all');
        const res_admin_logout_all = await client_3.GET('/auth/logout/admin/all');

        if (res_user_logout_all.status !== 200) {
            logger.error(`FAILED: Called logout/user/all route with success`, res_user_logout_all);
        } else {
            logger.success(`SUCCESS: Called logout/user/all route with success`);
        }
        if (res_admin_logout_all.status !== 200) {
            logger.error(`FAILED: Called logout/admin/all route with success`, res_admin_logout_all);
        } else {
            logger.success(`SUCCESS: Called logout/admin/all route with success`);
        }

        // Try to access protected route with revoked token with all clients
        const res_user_1_protected_route = await client_1.GET('/protected/ping');
        const res_user_2_protected_route = await client_2.GET('/protected/ping');
        const res_admin_1_protected_route = await client_3.GET('/protected/admin/ping');
        const res_admin_2_protected_route = await client_4.GET('/protected/admin/ping');

        const logoutAllAdminsSuccess =
            res_user_1_protected_route.status === 401 && res_user_2_protected_route.status === 401;

        const logoutAllUsersSuccess =
            res_admin_1_protected_route.status === 401 && res_admin_2_protected_route.status === 401;

        if (logoutAllAdminsSuccess) {
            logger.success(`SUCCESS: Logout all admin tokens with success`);
        } else {
            logger.error(`FAILED: Logout all admin tokens with success`, res_admin_1_protected_route);
        }

        if (logoutAllUsersSuccess) {
            logger.success(`SUCCESS: Logout all user tokens with success`);
        } else {
            logger.error(`FAILED: Logout all user tokens with success`, res_user_1_protected_route);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
