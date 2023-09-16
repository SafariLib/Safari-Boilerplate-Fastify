import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Access protected routes';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();

    {
        /*
            Visitor should not be able to access protected routes
        */

        const visitorClient = new ApiCaller();
        const visitorProtectedResponse = await visitorClient.GET('/protected/ping');
        const visitorAdminProtectedResponse = await visitorClient.GET('/protected/admin/ping');

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

        const userClient = new ApiCaller();
        const userResponse = await userClient.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const userJsonContent = await userResponse.json();
        userClient.setBearerToken(userJsonContent.accessToken);
        userClient.setCookieToken(userResponse.headers.get('set-cookie').split(';')[0].split('=')[1]);

        const userProtectedResponse = await userClient.GET('/protected/ping');

        if (userProtectedResponse.status !== 200) {
            logger.error(`FAILED: Logged user should be able to access protected routes`, userProtectedResponse);
        } else {
            logger.success(`SUCCESS: Logged user should be able to access protected routes`);
        }

        const adminClient = new ApiCaller();
        const adminResponse = await adminClient.POST('/auth/login/admin', {
            username: testAdmins[0].username,
            password: PASSWORD,
        });

        const adminJsonContent = await adminResponse.json();
        adminClient.setBearerToken(adminJsonContent.accessToken);
        adminClient.setCookieToken(adminResponse.headers.get('set-cookie').split(';')[0].split('=')[1]);

        const adminProtectedResponse = await adminClient.GET('/protected/admin/ping');

        if (adminProtectedResponse.status !== 200) {
            logger.error(`FAILED: Logged admin should be able to access protected routes`, adminProtectedResponse);
        } else {
            logger.success(`SUCCESS: Logged admin should be able to access protected routes`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
