import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Login response format';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();
    const API = new ApiCaller();

    {
        /*
            Login should return user object and tokens
        */

        const userResponse = await API.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const userJsonContent = await userResponse.json();

        if (userJsonContent.user?.password !== undefined) {
            logger.error(`FAILED: User Login does return password`, userResponse);
        } else {
            logger.success(`SUCCESS: User Login does not return password`);
        }

        if (userJsonContent.accessToken === undefined) {
            logger.error(`FAILED: User Login does not return accessToken`, userResponse);
        } else {
            logger.success(`SUCCESS: User Login does return accessToken`);
        }

        const userRefreshToken = userResponse.headers.get('set-cookie').split(';')[0].split('=')[1];

        if (userRefreshToken === undefined) {
            logger.error(`FAILED: User Login does not return refreshToken`, userResponse);
        } else {
            logger.success(`SUCCESS: User Login does return refreshToken`);
        }

        // For admins

        const adminResponse = await API.POST('/auth/login/admin', {
            username: testAdmins[0].username,
            password: PASSWORD,
        });

        const adminJsonContent = await adminResponse.json();

        if (adminJsonContent.user?.password !== undefined) {
            logger.error(`FAILED: Admin Login does return password`, adminResponse);
        } else {
            logger.success(`SUCCESS: Admin Login does not return password`);
        }

        if (adminJsonContent.accessToken === undefined) {
            logger.error(`FAILED: Admin Login does not return accessToken`, adminResponse);
        } else {
            logger.success(`SUCCESS: Admin Login does return accessToken`);
        }

        const adminRefreshToken = adminResponse.headers.get('set-cookie').split(';')[0].split('=')[1];

        if (adminRefreshToken === undefined) {
            logger.error(`FAILED: Admin Login does not return refreshToken`, adminResponse);
        } else {
            logger.success(`SUCCESS: Admin Login does return refreshToken`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
