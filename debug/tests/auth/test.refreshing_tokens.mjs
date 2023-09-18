import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Refreshing tokens';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();

    {
        /*
            Login user and try to refresh tokens
        */

        const admin_client = new ApiCaller();
        const user_client = new ApiCaller();

        const adminLogRes = await admin_client.POST('/auth/login/admin', {
            username: testAdmins[0].username,
            password: PASSWORD,
        });

        const userLogRes = await user_client.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const adminLoginJsonRes = await adminLogRes.json();
        const userLoginJsonRes = await userLogRes.json();

        admin_client.setCookieToken(adminLogRes.headers.get('set-cookie').split(';')[0].split('=')[1]);
        admin_client.setBearerToken(adminLoginJsonRes.accessToken);
        user_client.setCookieToken(userLogRes.headers.get('set-cookie').split(';')[0].split('=')[1]);
        user_client.setBearerToken(userLoginJsonRes.accessToken);

        // Access protected route
        const adminProtectedRes = await admin_client.GET('/protected/admin/ping');
        const userProtectedRes = await user_client.GET('/protected/ping');

        if (adminProtectedRes.status !== 200) {
            logger.error(`FAILED: Access protected route with admin token`, adminProtectedRes);
        } else {
            logger.success(`SUCCESS: Access protected route with admin token`);
        }
        if (userProtectedRes.status !== 200) {
            logger.error(`FAILED: Access protected route with user token`, userProtectedRes);
        } else {
            logger.success(`SUCCESS: Access protected route with user token`);
        }

        // Refresh tokens
        admin_client.removeBearerToken();
        user_client.removeBearerToken();

        const adminRefreshRes = await admin_client.GET('/auth/refresh/admin');
        const userRefreshRes = await user_client.GET('/auth/refresh/user');

        const adminRefreshJsonRes = await adminRefreshRes.json();
        const userRefreshJsonRes = await userRefreshRes.json();

        if (adminRefreshRes.status !== 200) {
            // FIXME this test always returns a 500 when server has started
            logger.error(`FAILED: Refresh admin token`, adminRefreshRes);
        } else {
            logger.success(`SUCCESS: Refresh admin token`);
        }
        if (userRefreshRes.status !== 200) {
            logger.error(`FAILED: Refresh user token`, userRefreshRes);
        } else {
            logger.success(`SUCCESS: Refresh user token`);
        }

        // Access protected route
        admin_client.setCookieToken(adminRefreshRes.headers.get('set-cookie').split(';')[0].split('=')[1]);
        admin_client.setBearerToken(adminRefreshJsonRes.accessToken);
        user_client.setCookieToken(userRefreshRes.headers.get('set-cookie').split(';')[0].split('=')[1]);
        user_client.setBearerToken(userRefreshJsonRes.accessToken);

        const adminProtectedRes2 = await admin_client.GET('/protected/admin/ping');
        const userProtectedRes2 = await user_client.GET('/protected/ping');

        if (adminProtectedRes2.status !== 200) {
            logger.error(`FAILED: Access protected route with admin token`, adminProtectedRes2);
        } else {
            logger.success(`SUCCESS: Access protected route with admin token`);
        }
        if (userProtectedRes2.status !== 200) {
            logger.error(`FAILED: Access protected route with user token`, userProtectedRes2);
        } else {
            logger.success(`SUCCESS: Access protected route with user token`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
