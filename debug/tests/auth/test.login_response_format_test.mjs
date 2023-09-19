import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Login response format';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();

    {
        /*
            Login should return user object and tokens
        */

        // Tests for user
        const user_client = new ApiCaller();
        const { res: userRes, json: userJson } = await user_client.ConnectAsUser(testUsers[0].username);

        if (userJson.user?.password !== undefined) {
            logger.error(`FAILED: User Login does return password`, userJson);
        } else {
            logger.success(`SUCCESS: User Login does not return password`);
        }

        if (userJson.accessToken === undefined) {
            logger.error(`FAILED: User Login does not return accessToken`, userJson);
        } else {
            logger.success(`SUCCESS: User Login does return accessToken`);
        }

        const userRefreshToken = userRes.headers.get('set-cookie').split(';')[0].split('=')[1];

        if (userRefreshToken === undefined) {
            logger.error(`FAILED: User Login does not return refreshToken`, userRes);
        } else {
            logger.success(`SUCCESS: User Login does return refreshToken`);
        }

        // Tests for admin
        const user_admin = new ApiCaller();
        const { res: adminRes, json: adminJson } = await user_client.ConnectAsAdmin(testAdmins[0].username);

        if (adminJson.user?.password !== undefined) {
            logger.error(`FAILED: User Login does return password`, adminJson);
        } else {
            logger.success(`SUCCESS: User Login does not return password`);
        }

        if (adminJson.accessToken === undefined) {
            logger.error(`FAILED: User Login does not return accessToken`, adminJson);
        } else {
            logger.success(`SUCCESS: User Login does return accessToken`);
        }

        const adminRefreshToken = adminRes.headers.get('set-cookie').split(';')[0].split('=')[1];

        if (adminRefreshToken === undefined) {
            logger.error(`FAILED: User Login does not return refreshToken`, adminRes);
        } else {
            logger.success(`SUCCESS: User Login does return refreshToken`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};
