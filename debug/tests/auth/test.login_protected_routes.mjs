import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Access protected routes';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();

    {
        /*
            Visitor should not be able to access protected routes
        */

        const visitorClient = new ApiCaller();
        const { res: visitorProtectedResponse } = await visitorClient.GET('/protected/ping');
        const { res: visitorAdminProtectedResponse } = await visitorClient.GET('/protected/admin/ping');

        if (visitorProtectedResponse.status !== 401) {
            logger.error(`FAILED: Visitor should not be able to access protected routes`, visitorProtectedResponse);
        } else {
            logger.success(`SUCCESS: Visitor should not be able to access protected routes`);
        }

        if (visitorAdminProtectedResponse.status !== 401) {
            logger.error(
                `FAILED: Visitor should not be able to access protected admin routes`,
                visitorAdminProtectedResponse,
            );
        } else {
            logger.success(`SUCCESS: Visitor should not be able to access protected admin routes`);
        }

        /*
            Logged user should be able to access protected routes
        */

        const user_client = new ApiCaller();
        await user_client.ConnectAsUser(testUsers[0].username);
        const { res: userProtectedResponse } = await user_client.GET('/protected/ping');

        if (userProtectedResponse.status !== 200) {
            logger.error(`FAILED: Logged user should be able to access protected routes`, userProtectedResponse);
        } else {
            logger.success(`SUCCESS: Logged user should be able to access protected routes`);
        }

        const admin_client = new ApiCaller();
        await admin_client.ConnectAsAdmin(testAdmins[0].username);
        const { res: adminProtectedResponse } = await admin_client.GET('/protected/admin/ping');

        if (adminProtectedResponse.status !== 200) {
            logger.error(`FAILED: Logged admin should be able to access protected routes`, adminProtectedResponse);
        } else {
            logger.success(`SUCCESS: Logged admin should be able to access protected routes`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
