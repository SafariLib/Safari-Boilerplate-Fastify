import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Refreshing tokens';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData(prisma);

    {
        /*
            Login user and try to refresh tokens
        */

        const admin_client = new ApiCaller();
        const user_client = new ApiCaller();

        await admin_client.ConnectAsAdmin(testAdmins[0].username);
        await user_client.ConnectAsUser(testUsers[0].username);

        // Access protected route
        const { res: adminProtectedRes } = await admin_client.GET('/protected/admin/ping');
        const { res: userProtectedRes } = await user_client.GET('/protected/ping');

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

        const { res: adminRefreshRes, json: adminRefreshJsonRes } = await admin_client.GET('/auth/refresh/admin');
        const { res: userRefreshRes, json: userRefreshJsonRes } = await user_client.GET('/auth/refresh/user');

        if (adminRefreshRes.status !== 200) {
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

        const { res: adminProtectedRes2 } = await admin_client.GET('/protected/admin/ping');
        const { res: userProtectedRes2 } = await user_client.GET('/protected/ping');

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

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};
